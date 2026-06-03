import Link from "next/link";
import {
  ArrowRight,
  Receipt,
  Wallet,
  TrendingUp,
  Calculator,
  Package,
  Sprout,
  Check,
} from "lucide-react";

const features = [
  {
    icon: Receipt,
    title: "Get paid faster",
    description:
      "Send invoices in minutes and always know what's been paid and what's still owed.",
  },
  {
    icon: Wallet,
    title: "Stay on top of payments",
    description:
      "Record every payment against the right invoice, with vouchers handled for you.",
  },
  {
    icon: Calculator,
    title: "Tax, handled for you",
    description:
      "VAT and withholding tax are worked out on every document, so the numbers are always right.",
  },
  {
    icon: TrendingUp,
    title: "Know where you stand",
    description:
      "See money coming in and going out at a glance, so there are no surprises.",
  },
  {
    icon: Package,
    title: "Save time on every invoice",
    description:
      "Save your products and prices once, then reuse them with a single click.",
  },
  {
    icon: Sprout,
    title: "Built to grow with you",
    description:
      "Tidy, organized records today — with room for full accounting as your business grows.",
  },
];

const benefits = [
  {
    title: "No more forgotten invoices",
    description: "Always know which invoices are paid and which are still owed.",
  },
  {
    title: "No more tax-time surprises",
    description: "VAT and withholding tax are applied correctly, every time.",
  },
  {
    title: "No more scattered records",
    description: "Every invoice, bill, and payment lives in one searchable place.",
  },
  {
    title: "No more repetitive typing",
    description: "Save products and customers once, then reuse them anywhere.",
  },
];

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <span className="font-logo text-xl tracking-tight text-white">
            Balance
          </span>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Open app
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-brand-yellow-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-brand-yellow-600"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Premium background: faint brand glow + masked dot grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_30%,transparent_75%)]" />
            <div className="absolute left-1/2 top-[-12rem] h-[30rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand-yellow-500/[0.07] blur-[130px]" />
          </div>

          <div className="container relative mx-auto px-4 pb-16 pt-24 text-center sm:px-6 sm:pt-32">
            <div className="mx-auto max-w-3xl space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow-500" />
                <span className="text-sm font-medium text-gray-300">
                  Finance software for Ethiopian businesses
                </span>
              </div>

              <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/55 bg-clip-text text-5xl font-semibold leading-[1.04] tracking-[-0.03em] text-transparent sm:text-6xl md:text-7xl">
                Run your business,
                <br className="hidden sm:block" /> not your spreadsheets.
              </h1>

              <p className="mx-auto max-w-xl text-balance text-lg leading-relaxed text-gray-400 sm:text-xl">
                Send invoices, track payments, and stay on top of tax — all in
                one simple place that grows with your business.
              </p>

              <div className="flex flex-col items-center justify-center gap-3 pt-3 sm:flex-row">
                <Link
                  href="/auth/login"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-yellow-500 px-7 font-semibold text-black transition-colors hover:bg-brand-yellow-600 sm:w-auto"
                >
                  Open app <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-7 font-medium text-white transition-colors hover:bg-white/5 sm:w-auto"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Product preview */}
            <div className="relative mx-auto mt-20 max-w-3xl">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl shadow-black/50 ring-1 ring-white/5">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                </div>
                <div className="space-y-5 p-5 text-left sm:p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-logo text-lg text-white">Balance</p>
                      <p className="text-sm text-gray-500">
                        Invoice INV-2026-0142
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                      <Check className="h-3 w-3" /> Paid
                    </span>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-5">
                    {[
                      { name: "Consulting services", amount: "12,000.00" },
                      { name: "Implementation", amount: "8,500.00" },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-300">{row.name}</span>
                        <span className="tabular-nums text-gray-400">
                          ETB {row.amount}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 border-t border-white/10 pt-5 text-sm">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>VAT (15%)</span>
                      <span className="tabular-nums">ETB 3,075.00</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Withholding (2%)</span>
                      <span className="tabular-nums">− ETB 410.00</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 text-base font-semibold text-white">
                      <span>Total due</span>
                      <span className="tabular-nums">ETB 23,165.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need, in one place
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              From your first invoice to your busiest month, Balance keeps the
              numbers tidy.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06]">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto border-t border-white/10 px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Stop losing money to disorganization
              </h2>
              <p className="text-lg leading-relaxed text-gray-400">
                Unpaid invoices, missed bills, and tax mistakes quietly cost you
                money. Balance keeps everything in one calm, organized place.
              </p>
              <div className="space-y-5 pt-2">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-3.5">
                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{benefit.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <h3 className="text-xl font-semibold text-white">
                Up and running in minutes
              </h3>
              <p className="mt-2 leading-relaxed text-gray-400">
                No complicated setup and no long forms. Create your
                organization, add a product, and send your first invoice.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  "Create your organization",
                  "Add products or services",
                  "Send your first invoice",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-sm">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="text-gray-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-24 sm:px-6">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-yellow-500/[0.06] blur-[110px]"
            />
            <div className="relative">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-lg text-gray-400">
                Built for Ethiopian businesses, from solo founders to growing
                teams.
              </p>
              <Link
                href="/auth/login"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand-yellow-500 px-7 font-semibold text-black transition-colors hover:bg-brand-yellow-600"
              >
                Open app <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-1 md:items-start">
              <span className="font-logo text-sm text-white">Balance</span>
              <p className="text-xs text-gray-500">
                © {year} · Powered by{" "}
                <span className="font-medium text-gray-300">YOLET Labs</span>
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 transition-colors hover:text-white"
              >
                Open app
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 transition-colors hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
