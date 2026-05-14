# Order Label Printing MVP

Mobile-first Next.js App Router app for simple order label management:
create order, add items, print one thermal label per click, and complete the order.

## Printer Support

- Label size is configured for `40 x 30 mm`.
- Browser print fallback is available on `/print/label/[itemId]`.
- Direct NIIMBOT printing is integrated with `@mmote/niimbluelib`.
- `NIIMBOT B1`: use Bluetooth from a Chromium-based browser with Web Bluetooth.
- `NIIMBOT B31`: use Bluetooth or USB Serial from a supported Chromium-based desktop browser.
- iPhone/iPad browsers generally do not expose Web Bluetooth reliably, so use the browser print fallback there.

## Setup

1. Add Supabase environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

2. Run the SQL migrations manually in Supabase SQL Editor, in order:

```text
supabase/migrations/202604270001_order_label_printing_mvp.sql
supabase/migrations/202604290001_settings_management.sql
```

The migrations create the tables, indexes, updated-at triggers, order-code function,
RLS policies for authenticated users, and seed attributes for Sugar Level, Ice Level,
Spice Level, and Size, plus configurable paper sizes and order number formats.

3. Make sure the browser has a valid Supabase Auth session. This MVP intentionally
does not include login UI. Without a session, Supabase uses the anon role and RLS
will block writes.

For local-only demos without login, run this second SQL file in Supabase SQL Editor:

```text
supabase/migrations/202604270002_enable_anon_demo_access.sql
supabase/migrations/202604290002_enable_anon_access_to_settings_management.sql
```

Do not run the demo anon access SQL in production.

4. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Manual Test Flow

1. Open `/settings` and confirm `Attributes`, `Paper Sizes`, and `Order Number` sections are visible.
2. Add or edit attribute options if needed.
3. Add a paper size and set a default if you want something other than `40 x 30 mm`.
4. Add or edit an order number format and confirm the preview looks right.
5. Open `/menus` and create a menu with attribute switches enabled.
6. Open `/orders/new`, create an order, and confirm it redirects to `/orders/[id]`.
7. Add an item and confirm only the selected menu's enabled attributes appear.
8. Click `Print` once and confirm `printed_count` increments by exactly 1.
9. Keep printing until `printed_count >= qty`, then confirm reprint warning appears.
10. Confirm `/print/label/[itemId]` uses the active paper size.
11. Use `Bluetooth` or `USB Serial` on the label page to print directly to a NIIMBOT printer when the browser supports it.

## Checks

```bash
npm run lint
npm run build
```
