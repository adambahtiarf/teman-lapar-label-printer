"use client";

import { type CSSProperties } from "react";
import { NiimbotPrintPanel } from "@/components/app/niimbot-print-panel";
import { formatShortDate } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

const LABEL_PRINT_CONFIG = {
  widthMm: 40,
  heightMm: 30,
  paddingMm: 1.5,
  fontSizePt: 6.5,
  customerFontSizePt: 7,
  menuFontSizePt: 8,
  gapMm: 0.6,
} as const;

export function LabelPrintView({
  item,
  order,
}: {
  item: OrderItem;
  order: Order;
}) {
  const labelStyle = {
    "--label-width": `${LABEL_PRINT_CONFIG.widthMm}mm`,
    "--label-height": `${LABEL_PRINT_CONFIG.heightMm}mm`,
    "--label-padding": `${LABEL_PRINT_CONFIG.paddingMm}mm`,
    "--label-font-size": `${LABEL_PRINT_CONFIG.fontSizePt}pt`,
    "--label-customer-font-size": `${LABEL_PRINT_CONFIG.customerFontSizePt}pt`,
    "--label-menu-font-size": `${LABEL_PRINT_CONFIG.menuFontSizePt}pt`,
    "--label-gap": `${LABEL_PRINT_CONFIG.gapMm}mm`,
  } as CSSProperties;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-background px-4 pt-4 gap-5 ">
      <section className="w-full">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
              Label Preview
            </p>
            <p className="mt-1 text-sm text-stone-600">
              NIIMBOT label size `40 x 30 mm`
            </p>
          </div>
          <div className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600">
            {order.order_code}
          </div>
        </div>

        <div className="mt-5 flex justify-center rounded bg-[linear-gradient(180deg,#fafaf9_0%,#f5f5f4_100%)] p-6">
          <section
            className="label-ticket flex flex-col overflow-hidden font-mono leading-tight shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
            style={labelStyle}
          >
            <p>No: {order.order_code}</p>
            <p>{formatShortDate(order.created_at)}</p>
            <p className="label-customer">
              {order.customer_name.toUpperCase()}
            </p>
            <p className="label-menu font-bold">{item.menu_name}</p>
            {item.selected_attribute_labels.length ? (
              <p>{item.selected_attribute_labels.join(" / ")}</p>
            ) : null}
            {item.notes ? <p>{item.notes}</p> : null}
          </section>
        </div>
      </section>

      <NiimbotPrintPanel item={item} order={order} />
      <style jsx global>{`
        @page {
          size: ${LABEL_PRINT_CONFIG.widthMm}mm ${LABEL_PRINT_CONFIG.heightMm}mm;
          margin: 0;
        }

        .label-ticket {
          box-sizing: border-box;
          width: var(--label-width);
          height: var(--label-height);
          justify-content: center;
          gap: var(--label-gap);
          padding: var(--label-padding);
          color: black;
          font-size: var(--label-font-size);
          line-height: 1.12;
        }

        .label-ticket p {
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .label-customer {
          font-size: var(--label-customer-font-size);
        }

        .label-menu {
          font-size: var(--label-menu-font-size);
        }

        @media screen {
          .label-ticket {
            border: 1px solid rgba(231, 229, 228, 0.95);
          }
        }
      `}</style>
    </main>
  );
}
