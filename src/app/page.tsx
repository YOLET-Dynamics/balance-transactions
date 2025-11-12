"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Receipt,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Check,
  Package,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-logo tracking-tight text-white font-bold">
            Balance
          </h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 sm:px-6 py-2 text-sm font-semibold bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-yellow-500/10 border border-brand-yellow-500/20">
              <div className="h-2 w-2 rounded-full bg-brand-yellow-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-gray-300">
                Financial Management for Ethiopian Businesses
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
              <span className="text-white">Simple</span>
              <br />
              <span className="text-brand-yellow-500">Accounting</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
              Stop juggling spreadsheets. Get paid faster. Stay organized.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto h-12 px-8 bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all font-semibold inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-yellow-500/20"
              >
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto h-12 px-8 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all font-medium inline-flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto pt-8 sm:pt-12 border-t border-white/10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  2min
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Create Invoice
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-brand-yellow-500 mb-1">
                  0
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Math Errors
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  100%
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Organized
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Solve Real Problems
              </h2>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
                Built to save you time and eliminate headaches
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Get Paid Faster */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <Receipt className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Get Paid Faster
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Create professional invoices in minutes. Track payment status
                  and follow up automatically
                </p>
              </div>

              {/* Never Miss an Expense */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <FileText className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Never Miss an Expense
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Record every vendor bill. Know exactly what you owe and when
                  it's due
                </p>
              </div>

              {/* Know Your Cash Flow */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Know Your Cash Flow
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  See incoming and outgoing money at a glance. Make smarter
                  financial decisions
                </p>
              </div>

              {/* Save Hours Every Week */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <Package className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Save Hours Every Week
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Stop retyping products and prices. Quick-add your commonly
                  sold items and services
                </p>
              </div>

              {/* Tax Season Made Easy */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Tax Season Made Easy
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Automatic VAT and withholding tax calculations. All your
                  records in one organized place
                </p>
              </div>

              {/* Look Professional */}
              <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all">
                <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-yellow-500/20 transition-colors">
                  <Shield className="h-6 w-6 text-brand-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Look Professional
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Clean, branded documents that make your business look
                  trustworthy and established
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left - Benefits List */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  Stop Losing Money to Disorganization
                </h2>
                <p className="text-base sm:text-lg text-gray-400">
                  Unpaid invoices, missed expenses, and tax headaches cost you
                  real money. Balance keeps everything organized
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-yellow-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-brand-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        No More Forgotten Invoices
                      </h3>
                      <p className="text-sm text-gray-400">
                        Track which invoices are paid and which are outstanding
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-yellow-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-brand-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        No More Tax Calculation Errors
                      </h3>
                      <p className="text-sm text-gray-400">
                        Automatic VAT and withholding tax—always correct
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-yellow-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-brand-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        No More Scattered Records
                      </h3>
                      <p className="text-sm text-gray-400">
                        All your financial documents in one searchable place
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-yellow-500/20 flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-brand-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        No More Manual Data Entry
                      </h3>
                      <p className="text-sm text-gray-400">
                        Save products once, reuse them forever
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Highlight Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 space-y-6">
                <div className="inline-flex h-16 w-16 rounded-xl bg-brand-yellow-500/10 items-center justify-center">
                  <Zap className="h-8 w-8 text-brand-yellow-500" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Start in Minutes
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    No complicated setup. No long forms. Create your
                    organization, add your first invoice, and you're done.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center font-bold text-brand-yellow-500">
                      1
                    </div>
                    <span className="text-gray-300">
                      Create your organization
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center font-bold text-brand-yellow-500">
                      2
                    </div>
                    <span className="text-gray-300">
                      Add products or services
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center font-bold text-brand-yellow-500">
                      3
                    </div>
                    <span className="text-gray-300">
                      Create your first invoice
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 border-t border-white/10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="rounded-2xl bg-gradient-to-br from-brand-yellow-500/10 via-transparent to-transparent border border-brand-yellow-500/20 p-8 sm:p-12 md:p-16 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white">
                Ready to get started?
              </h2>
              <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto px-4">
                Join businesses across Ethiopia using Balance to streamline
                their financial operations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all font-semibold shadow-lg shadow-brand-yellow-500/20"
                >
                  Create an Account <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm font-logo font-bold text-white">Balance</p>
              <p className="text-xs text-gray-600">
                © 2025 • Powered by{" "}
                <span className="font-semibold text-brand-yellow-500">
                  YOLET Labs
                </span>
              </p>
            </div>
            <div className="flex gap-6">
              <Link
                href="/auth/login"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
