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
  width: 40,
  height: 30,
} as const;

const DEFAULT_DPI = 203;
const DEFAULT_DENSITY = 3;

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

function drawLine(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  maxWidth: number,
  maxLines = 1,
) {
  context.font = font;
  context.fillStyle = "#000";
  context.textBaseline = "top";

  const fontSize = Number.parseInt(font, 10) || 16;
  const lineHeight = Math.round(fontSize * 1.2);
  const lines = wrapText(context, text, maxWidth, maxLines);

  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });

  return lines.length * lineHeight;
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

  let y = padding;
  y += drawLine(
    context,
    `No: ${order.order_code}`,
    padding,
    y,
    "500 14px monospace",
    bodyWidth,
  );
  y += 2;
  y += drawLine(
    context,
    formatShortDate(order.created_at),
    padding,
    y,
    "500 14px monospace",
    bodyWidth,
  );
  y += 6;
  y += drawLine(
    context,
    order.customer_name.toUpperCase(),
    padding,
    y,
    "700 18px monospace",
    bodyWidth,
  );
  y += 4;
  y += drawLine(
    context,
    item.menu_name,
    padding,
    y,
    "700 20px monospace",
    bodyWidth,
    2,
  );

  if (item.selected_attribute_labels.length) {
    y += 4;
    y += drawLine(
      context,
      item.selected_attribute_labels.join(" / "),
      padding,
      y,
      "500 14px monospace",
      bodyWidth,
      2,
    );
  }

  if (item.notes) {
    y += 4;
    drawLine(
      context,
      item.notes,
      padding,
      y,
      "500 14px monospace",
      bodyWidth,
      2,
    );
  }

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
          Print via Bluetooth
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
          <UsbIcon data-icon="inline-start" />
          Print via USB Serial
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
