"use client";

import { useEffect, type CSSProperties } from "react";
import { formatShortDate } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

const LABEL_PRINT_CONFIG = {
  widthMm: 40,
  heightMm: 20,
  paddingMm: 1.5,
  fontSizePt: 6.5,
  customerFontSizePt: 7,
  menuFontSizePt: 8,
  gapMm: 0.6,
  autoPrintDelayMs: 300,
} as const;

export function LabelPrintView({
  item,
  order,
}: {
  item: OrderItem;
  order: Order;
}) {
  useEffect(() => {
    const timer = window.setTimeout(
      () => window.print(),
      LABEL_PRINT_CONFIG.autoPrintDelayMs,
    );
    return () => window.clearTimeout(timer);
  }, []);

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
    <main className="mx-auto flex min-h-dvh w-full flex-col items-center bg-white p-4 text-black">
      <section
        className="label-ticket flex flex-col overflow-hidden font-mono leading-tight"
        style={labelStyle}
      >
        <p>No: {order.order_code}</p>
        <p>{formatShortDate(order.created_at)}</p>
        <p className="label-customer">{order.customer_name.toUpperCase()}</p>
        <p className="label-menu font-bold">{item.menu_name}</p>
        {item.selected_attribute_labels.length ? (
          <p>{item.selected_attribute_labels.join(" / ")}</p>
        ) : null}
        {item.notes ? <p>{item.notes}</p> : null}
      </section>
      <style jsx global>{`
        @page {
          size: ${LABEL_PRINT_CONFIG.widthMm}mm ${LABEL_PRINT_CONFIG.heightMm}mm;
          margin: 0;
        }

        .label-ticket {
          box-sizing: border-box;
          width: var(--label-width);
          height: var(--label-height);
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
            border: 1px dashed #d4d4d4;
          }
        }

        @media print {
          html,
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .label-ticket,
          .label-ticket * {
            visibility: visible;
          }

          .label-ticket {
            position: absolute;
            left: 0;
            top: 0;
            border: 0;
          }
        }
      `}</style>
    </main>
  );
}
