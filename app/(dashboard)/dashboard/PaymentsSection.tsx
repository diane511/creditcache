import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionTitle, StatLine } from "./dashboard-ui";

type SavedCard = {
  brand: string;
  last4: string;
  type: string;
  expiry: string;
  status: string;
};

type PaymentMethod = {
  name: string;
  note: string;
  status: string;
};

export function PaymentsSection({
  savedCards,
  paymentMethods,
}: {
  savedCards: SavedCard[];
  paymentMethods: PaymentMethod[];
}) {
  return (
    <section
      id="payments"
      className="grid gap-0 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/10 dark:border-white/10 lg:grid-cols-2 lg:divide-y-0 lg:divide-x"
    >
      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Saved cards"
          description="Keep payment cards visible and easy to manage."
          action={<Badge tone="primary">{savedCards.length} cards</Badge>}
        />

        <div className="mt-5 space-y-4">
          {savedCards.map((card) => (
            <div
              key={`${card.brand}-${card.last4}`}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    {card.brand} •••• {card.last4}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {card.type}
                  </div>
                </div>
                <Badge tone="good">{card.status}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatLine label="Expiry" value={card.expiry} />
                <StatLine label="Type" value="Card" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Payment methods"
          description="Track the ways users can pay, send, or receive money."
        />

        <div className="mt-5">
          {paymentMethods.map((method) => (
            <div
              key={method.name}
              className="flex items-start justify-between gap-3 border-b border-zinc-100 py-4 last:border-b-0 dark:border-white/5"
            >
              <div>
                <div className="text-sm font-medium text-zinc-950 dark:text-white">
                  {method.name}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {method.note}
                </div>
              </div>
              <Badge tone="primary">{method.status}</Badge>
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/payments"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Manage payments
            </Link>
            <Link
              href="/cards"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              Add new card
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}