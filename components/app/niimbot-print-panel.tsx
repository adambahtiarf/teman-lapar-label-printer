"use client";

import { useState, useSyncExternalStore } from "react";
import {
  AlertCircleIcon,
  BluetoothIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  PrinterIcon,
  UsbIcon,
} from "lucide-react";
import { formatShortDate } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

type Transport = "bluetooth" | "serial";
type PrintStatus = "idle" | "connecting" | "printing" | "done" | "error";

const LABEL_MM = {
  width: 50,
  height: 30,
} as const;

const DEFAULT_DPI = 203;
const DEFAULT_DENSITY = 3;
const PRINT_FONT_FAMILY = '"Geist Mono", "Geist Mono Fallback"';

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

  if (lines.length > maxLines) return lines.slice(0, maxLines);

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
      font: `400 22px ${PRINT_FONT_FAMILY}`,
      gapAfter: 2,
    },
    {
      text: formatShortDate(order.created_at),
      font: `400 22px ${PRINT_FONT_FAMILY}`,
      gapAfter: 6,
    },
    {
      text: order.customer_name.toUpperCase(),
      font: `700 22px ${PRINT_FONT_FAMILY}`,
      gapAfter: 4,
    },
    {
      text: item.menu_name,
      font: `700 26px ${PRINT_FONT_FAMILY}`,
      maxLines: 2,
      gapAfter:
        item.selected_attribute_labels.length || item.notes ? 4 : undefined,
    },
    ...(item.selected_attribute_labels.length
      ? [
          {
            text: item.selected_attribute_labels.join(" / "),
            font: `600 16px ${PRINT_FONT_FAMILY}`,
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

type SupportState = {
  bluetooth: boolean;
  serial: boolean;
};

const EMPTY_SUPPORT_STATE: SupportState = {
  bluetooth: false,
  serial: false,
};

const BLUETOOTH_ONLY_SUPPORT_STATE: SupportState = {
  bluetooth: true,
  serial: false,
};

const SERIAL_ONLY_SUPPORT_STATE: SupportState = {
  bluetooth: false,
  serial: true,
};

const FULL_SUPPORT_STATE: SupportState = {
  bluetooth: true,
  serial: true,
};

function detectSupportState(): SupportState {
  const bluetooth =
    typeof navigator !== "undefined" && "bluetooth" in navigator;
  const serial = typeof navigator !== "undefined" && "serial" in navigator;

  if (bluetooth && serial) return FULL_SUPPORT_STATE;
  if (bluetooth) return BLUETOOTH_ONLY_SUPPORT_STATE;
  if (serial) return SERIAL_ONLY_SUPPORT_STATE;
  return EMPTY_SUPPORT_STATE;
}

function subscribeSupportState() {
  return () => undefined;
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

export function NiimbotPrintPanel({
  item,
  order,
}: {
  item: OrderItem;
  order: Order;
}) {
  const [status, setStatus] = useState<PrintStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [printerInfo, setPrinterInfo] = useState<string | null>(null);
  const support = useSyncExternalStore(
    subscribeSupportState,
    detectSupportState,
    () => EMPTY_SUPPORT_STATE,
  );

  async function printToNiimbot(transport: Transport) {
    setStatus("connecting");
    setMessage(null);

    let client:
      | InstanceType<
          (typeof import("@mmote/niimbluelib"))["NiimbotBluetoothClient"]
        >
      | InstanceType<
          (typeof import("@mmote/niimbluelib"))["NiimbotSerialClient"]
        >
      | null = null;

    try {
      const niim = await import("@mmote/niimbluelib");
      client =
        transport === "bluetooth"
          ? new niim.NiimbotBluetoothClient()
          : new niim.NiimbotSerialClient();

      await client.connect();

      const metadata = client.getModelMetadata();
      const printer = client.getPrinterInfo();
      const taskName =
        client.getPrintTaskType() ??
        (metadata?.model === niim.PrinterModel.B31 ? "B1" : undefined);

      if (!taskName) {
        throw new Error(
          "This printer model is connected, but the print task is not mapped yet in niimbluelib.",
        );
      }

      setPrinterInfo(
        describeModel(
          metadata?.model,
          "Unknown NIIMBOT model",
          taskName,
          printer.protocolVersion,
        ),
      );

      setStatus("printing");

      await loadPrintFonts();
      const canvas = buildCanvas(item, order);
      const encoded = niim.ImageEncoder.encodeCanvas(
        canvas,
        metadata?.printDirection ?? "top",
      );
      const printTask = client.abstraction.newPrintTask(taskName, {
        labelType: niim.LabelType.WithGaps,
        density: metadata?.densityDefault ?? DEFAULT_DENSITY,
        totalPages: 1,
      });

      try {
        await printTask.printInit();
        await printTask.printPage(encoded, 1);
        await printTask.waitForPageFinished();
        await printTask.waitForFinished();
      } finally {
        await client.abstraction.printEnd().catch(() => undefined);
      }

      setStatus("done");
      setMessage("Printed successfully through NIIMBOT.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Printing failed.");
    } finally {
      await client?.disconnect().catch(() => undefined);
    }
  }

  return (
    <section className="flex w-full flex-col gap-4 rounded border border-stone-200 bg-white p-5 text-stone-950 shadow-[0_18px_60px_rgba(28,25,23,0.08)]">
      <div className="flex items-start gap-3">
        <div className="rounded bg-stone-900 p-2 text-white">
          <PrinterIcon className="size-4" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-stone-950">Print to NIIMBOT</p>
          <p className="text-sm leading-6 text-stone-600">
            Choose Bluetooth for B1 or B31. Choose USB Serial for B31 with USB
            cable.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="default"
          disabled={
            !support.bluetooth ||
            status === "connecting" ||
            status === "printing"
          }
          onClick={() => void printToNiimbot("bluetooth")}
          className="rounded py-6"
        >
          {status === "connecting" || status === "printing" ? (
            <LoaderCircleIcon
              data-icon="inline-start"
              className="animate-spin"
            />
          ) : (
            <BluetoothIcon data-icon="inline-start" />
          )}
          {status === "connecting"
            ? "Connecting..."
            : status === "printing"
              ? "Printing..."
              : "Print via Bluetooth"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={
            !support.serial || status === "connecting" || status === "printing"
          }
          onClick={() => void printToNiimbot("serial")}
          className="rounded py-6"
        >
          {status === "connecting" || status === "printing" ? (
            <LoaderCircleIcon
              data-icon="inline-start"
              className="animate-spin"
            />
          ) : (
            <UsbIcon data-icon="inline-start" />
          )}
          {status === "connecting"
            ? "Connecting..."
            : status === "printing"
              ? "Printing..."
              : "Print via USB Serial"}
        </Button>
      </div>

      {printerInfo ? (
        <p className="text-sm text-stone-600">
          Connected printer: {printerInfo}
        </p>
      ) : null}

      {message ? (
        <div className="flex items-start gap-2 rounded border px-3 py-3 text-sm">
          {status === "done" ? (
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-red-600" />
          )}
          <p>{message}</p>
        </div>
      ) : null}

      <div className="text-xs leading-5 text-stone-500">
        Direct NIIMBOT printing needs a Chromium-based browser with Web
        Bluetooth or Web Serial support.
      </div>
    </section>
  );
}
