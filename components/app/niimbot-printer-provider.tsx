"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircleIcon,
  BluetoothIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
} from "lucide-react";
import { incrementPrintedCount } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

type NiimModule = typeof import("@mmote/niimbluelib");
type BluetoothClient = InstanceType<NiimModule["NiimbotBluetoothClient"]>;
type PrintTaskName = NonNullable<
  ReturnType<BluetoothClient["getPrintTaskType"]>
>;

type PrinterStatus =
  | "unsupported"
  | "disconnected"
  | "connecting"
  | "connected"
  | "printing"
  | "error";

type PrinterSession = {
  client: BluetoothClient;
  niim: NiimModule;
  taskName: PrintTaskName;
  printDirection: Parameters<NiimModule["ImageEncoder"]["encodeCanvas"]>[1];
  density: number;
  printerInfo: string;
};

type PrinterContextValue = {
  connectPrinter: () => Promise<void>;
  isBusy: boolean;
  message: string | null;
  printLabel: (item: OrderItem, order: Order) => Promise<void>;
  printerInfo: string | null;
  status: PrinterStatus;
};

const LABEL_MM = {
  width: 50,
  height: 30,
} as const;

const DEFAULT_DPI = 203;
const DEFAULT_DENSITY = 3;
const PRINT_FONT_FAMILY = '"Geist Mono", "Geist Mono Fallback"';

const PrinterContext = createContext<PrinterContextValue | null>(null);

let niimModule: NiimModule | null = null;
let niimModulePromise: Promise<NiimModule> | null = null;

function preloadNiimModule() {
  if (!niimModulePromise) {
    niimModulePromise = import("@mmote/niimbluelib").then((module) => {
      niimModule = module;
      return module;
    });
  }

  return niimModulePromise;
}

function mmToPx(mm: number, dpi: number) {
  return Math.round((mm / 25.4) * dpi);
}

function wrapText(
  context: CanvasRenderingContext2D,
  value: string,
  maxWidth: number,
  maxLines: number,
) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (context.measureText(next).width <= maxWidth) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (words.length && lines.length === maxLines) {
    const last = lines[maxLines - 1] ?? "";
    const usedWords = lines.join(" ").split(/\s+/).filter(Boolean).length;
    if (usedWords < words.length) {
      let trimmed = last;
      while (
        trimmed.length > 1 &&
        context.measureText(`${trimmed}...`).width > maxWidth
      ) {
        trimmed = trimmed.slice(0, -1);
      }
      lines[maxLines - 1] = `${trimmed}...`;
    }
  }

  return lines;
}

type LabelTextBlock = {
  text: string;
  font: string;
  maxLines?: number;
  gapAfter?: number;
};

type MeasuredLabelTextBlock = LabelTextBlock & {
  lines: string[];
  lineHeight: number;
  height: number;
};

function fontPixelSize(font: string) {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : 16;
}

function measureTextBlock(
  context: CanvasRenderingContext2D,
  block: LabelTextBlock,
  maxWidth: number,
): MeasuredLabelTextBlock {
  context.font = block.font;

  const fontSize = fontPixelSize(block.font);
  const lineHeight = Math.round(fontSize * 1.2);
  const lines = wrapText(context, block.text, maxWidth, block.maxLines ?? 1);

  return {
    ...block,
    lines,
    lineHeight,
    height: lines.length * lineHeight,
  };
}

function drawTextBlock(
  context: CanvasRenderingContext2D,
  block: MeasuredLabelTextBlock,
  x: number,
  y: number,
) {
  context.font = block.font;
  context.fillStyle = "#000";
  context.textBaseline = "top";

  block.lines.forEach((line, index) => {
    context.fillText(line, x, y + index * block.lineHeight);
  });

  return block.height;
}

async function loadPrintFonts() {
  if (!("fonts" in document)) return;

  await Promise.all([
    document.fonts.load(`600 16px ${PRINT_FONT_FAMILY}`),
    document.fonts.load(`700 26px ${PRINT_FONT_FAMILY}`),
  ]);
}

function buildCanvas(item: OrderItem, order: Order) {
  const canvas = document.createElement("canvas");
  const width = mmToPx(LABEL_MM.width, DEFAULT_DPI);
  const height = mmToPx(LABEL_MM.height, DEFAULT_DPI);
  const padding = 12;
  const bodyWidth = width - padding * 2;

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas rendering is not available.");

  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#000";

  const blocks: LabelTextBlock[] = [
    {
      text: `No: ${order.order_code}`,
      font: `400 24px ${PRINT_FONT_FAMILY}`,
      gapAfter: 2,
    },
    {
      text: formatShortDate(order.created_at),
      font: `400 24px ${PRINT_FONT_FAMILY}`,
      gapAfter: 6,
    },
    {
      text: order.customer_name.toUpperCase(),
      font: `400 24px ${PRINT_FONT_FAMILY}`,
      gapAfter: 4,
    },
    {
      text: item.menu_name,
      font: `400 26px ${PRINT_FONT_FAMILY}`,
      maxLines: 2,
      gapAfter:
        item.selected_attribute_labels.length || item.notes ? 4 : undefined,
    },
    ...(item.selected_attribute_labels.length
      ? [
          {
            text: item.selected_attribute_labels.join(" / "),
            font: `400 16px ${PRINT_FONT_FAMILY}`,
            maxLines: 2,
            gapAfter: item.notes ? 4 : undefined,
          },
        ]
      : []),
    ...(item.notes
      ? [
          {
            text: item.notes,
            font: `600 16px ${PRINT_FONT_FAMILY}`,
            maxLines: 2,
          },
        ]
      : []),
  ];

  const measuredBlocks = blocks.map((block) =>
    measureTextBlock(context, block, bodyWidth),
  );
  const contentHeight = measuredBlocks.reduce(
    (total, block, index) =>
      total +
      block.height +
      (index < measuredBlocks.length - 1 ? (block.gapAfter ?? 0) : 0),
    0,
  );
  let y = Math.max(padding, Math.round((height - contentHeight) / 2));

  measuredBlocks.forEach((block, index) => {
    y += drawTextBlock(context, block, padding, y);
    if (index < measuredBlocks.length - 1) {
      y += block.gapAfter ?? 0;
    }
  });

  return canvas;
}

function describeModel(
  value: unknown,
  fallback: string,
  taskName?: string,
  protocolVersion?: number,
) {
  const taskLabel = taskName ? ` via ${taskName} task` : "";
  const protocolLabel =
    typeof protocolVersion === "number" ? ` (protocol ${protocolVersion})` : "";

  return `${String(value ?? fallback)}${protocolLabel}${taskLabel}`;
}

function hasBluetoothSupport() {
  return typeof navigator !== "undefined" && "bluetooth" in navigator;
}

export function NiimbotPrinterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionRef = useRef<PrinterSession | null>(null);
  const [status, setStatus] = useState<PrinterStatus>("disconnected");
  const [message, setMessage] = useState<string | null>(null);
  const [printerInfo, setPrinterInfo] = useState<string | null>(null);

  useEffect(() => {
    void preloadNiimModule().catch(() => undefined);

    return () => {
      void sessionRef.current?.client.disconnect().catch(() => undefined);
      sessionRef.current = null;
    };
  }, []);

  const ensureConnected = useCallback(async () => {
    if (!hasBluetoothSupport()) {
      setStatus("unsupported");
      throw new Error(
        "Browser ini belum mendukung Web Bluetooth. Pakai Chrome atau Edge.",
      );
    }

    const currentSession = sessionRef.current;
    if (currentSession?.client.isConnected()) {
      setStatus("connected");
      return currentSession;
    }

    setStatus("connecting");
    setMessage(null);

    if (!niimModule) {
      await preloadNiimModule();
      throw new Error(
        "Mesin printer sudah siap. Tap Print sekali lagi untuk pilih printer Bluetooth.",
      );
    }

    const niim = niimModule;
    const client = new niim.NiimbotBluetoothClient();
    client.on("disconnect", () => {
      sessionRef.current = null;
      setPrinterInfo(null);
      setStatus("disconnected");
      setMessage("Printer terputus.");
    });

    await client.connect();

    const metadata = client.getModelMetadata();
    const printer = client.getPrinterInfo();
    const taskName: PrintTaskName | undefined =
      client.getPrintTaskType() ??
      (metadata?.model === niim.PrinterModel.B31 ? "B1" : undefined);

    if (!taskName) {
      await client.disconnect().catch(() => undefined);
      throw new Error(
        "Printer terhubung, tapi task print model ini belum tersedia.",
      );
    }

    const nextPrinterInfo = describeModel(
      metadata?.model,
      "Unknown NIIMBOT model",
      taskName,
      printer.protocolVersion,
    );

    const session = {
      client,
      niim,
      taskName,
      printDirection: metadata?.printDirection ?? "top",
      density: metadata?.densityDefault ?? DEFAULT_DENSITY,
      printerInfo: nextPrinterInfo,
    } satisfies PrinterSession;

    sessionRef.current = session;
    setPrinterInfo(nextPrinterInfo);
    setStatus("connected");
    setMessage("Printer online.");

    return session;
  }, []);

  const connectPrinter = useCallback(async () => {
    try {
      await ensureConnected();
    } catch (error) {
      setStatus(hasBluetoothSupport() ? "error" : "unsupported");
      setMessage(
        error instanceof Error ? error.message : "Gagal menghubungkan printer.",
      );
    }
  }, [ensureConnected]);

  const printLabel = useCallback(
    async (item: OrderItem, order: Order) => {
      let session: PrinterSession;

      try {
        session = await ensureConnected();
      } catch (error) {
        setStatus(hasBluetoothSupport() ? "error" : "unsupported");
        setMessage(
          error instanceof Error ? error.message : "Gagal memilih printer.",
        );
        throw error;
      }

      setStatus("printing");
      setMessage(null);

      try {
        await loadPrintFonts();
        const canvas = buildCanvas(item, order);
        const encoded = session.niim.ImageEncoder.encodeCanvas(
          canvas,
          session.printDirection,
        );
        const printTask = session.client.abstraction.newPrintTask(
          session.taskName,
          {
            labelType: session.niim.LabelType.WithGaps,
            density: session.density,
            totalPages: 1,
          },
        );

        try {
          await printTask.printInit();
          await printTask.printPage(encoded, 1);
          await printTask.waitForPageFinished();
          await printTask.waitForFinished();
        } finally {
          await session.client.abstraction.printEnd().catch(() => undefined);
        }

        await incrementPrintedCount(item.id, item.order_id);
        setStatus("connected");
        setMessage("Label berhasil dicetak via Bluetooth.");
      } catch (error) {
        setStatus(session.client.isConnected() ? "connected" : "error");
        setMessage(error instanceof Error ? error.message : "Print gagal.");
        throw error;
      }
    },
    [ensureConnected],
  );

  const value = useMemo<PrinterContextValue>(
    () => ({
      connectPrinter,
      isBusy: status === "connecting" || status === "printing",
      message,
      printLabel,
      printerInfo,
      status,
    }),
    [connectPrinter, message, printLabel, printerInfo, status],
  );

  return (
    <PrinterContext.Provider value={value}>{children}</PrinterContext.Provider>
  );
}

export function useNiimbotPrinter() {
  const context = useContext(PrinterContext);
  if (!context) {
    throw new Error(
      "useNiimbotPrinter must be used inside NiimbotPrinterProvider.",
    );
  }

  return context;
}

export function PrinterConnectionStatus() {
  const { connectPrinter, isBusy, message, printerInfo, status } =
    useNiimbotPrinter();
  const isOnline = status === "connected" || status === "printing";
  const statusText = isOnline ? "Printer Online" : "Printer Offline";
  const detail =
    status === "unsupported"
      ? "Bluetooth tidak tersedia"
      : status === "connecting"
        ? "Pilih printer"
        : status === "printing"
          ? "Mencetak label"
          : printerInfo || message || "Klik untuk pilih koneksi";

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isBusy}
      onClick={() => void connectPrinter()}
      className="h-auto w-full justify-start gap-3 rounded border bg-card px-3 py-2 text-left shadow-none"
      aria-label={`${statusText}. ${detail}`}
    >
      <span
        className={[
          "flex size-9 shrink-0 items-center justify-center rounded-full text-white",
          isOnline ? "bg-emerald-600" : "bg-red-600",
        ].join(" ")}
      >
        {status === "connecting" || status === "printing" ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : isOnline ? (
          <CheckCircle2Icon className="size-4" />
        ) : status === "unsupported" || status === "error" ? (
          <AlertCircleIcon className="size-4" />
        ) : (
          <BluetoothIcon className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5">
          {statusText}
        </span>
        <span className="block truncate text-xs font-normal leading-5 text-muted-foreground">
          {detail}
        </span>
      </span>
    </Button>
  );
}
