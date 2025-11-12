"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Receipt,
  TrendingUp,
  Code2,
  Layers,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-logo tracking-tight text-white">
            Balance
          </h1>
          <div className="flex gap-6 items-center">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 text-sm font-semibold bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all inline-flex items-center gap-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 md:py-32 min-h-[85vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-yellow-500/10 text-sm text-gray-300 border border-brand-yellow-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-yellow-500" />
                Financial Management Simplified
              </div>

              <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-white">Track.</span>
                <span className="text-brand-yellow-500">Record.</span>
                <br />
                <span className="text-white">Grow.</span>
              </h2>

              <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                Balance transforms complex financial workflows into simple,
                intuitive actions. Record payments, generate invoices, and
                manage your business finances with ease.
              </p>

              <div className="flex gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="h-12 px-8 bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all font-semibold inline-flex items-center gap-2"
                >
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right Side Card */}
            <div className="border border-white/10 rounded-2xl p-8 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="text-brand-yellow-500 text-2xl">💰</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Built for Ethiopian Businesses
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Ethiopian withholding tax, VAT compliance, and ETB
                      currency support built right in.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-brand-yellow-500 text-2xl">📄</div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Professional Documents
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Generate clean, compliant invoices and payment vouchers
                      automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="container mx-auto px-6 py-24 border-t border-white/10"
        >
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to manage finances
            </h3>
            <p className="text-lg text-gray-400">
              From invoicing to payment tracking, all in one simple platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <Receipt className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Sales Invoices</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create professional invoices with automatic VAT calculation and
                withholding tax compliance
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <FileText className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Vouchers</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Track all payments with detailed audit trails and vendor
                management
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <TrendingUp className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Purchase Bills</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Manage vendor bills, track expenses, and maintain complete
                records
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <Code2 className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Sequential Numbering
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automatic document numbering that resets yearly per organization
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <Layers className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Multi-Organization
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Manage multiple businesses with role-based access and data
                isolation
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-brand-yellow-500/30 transition-all group">
              <div className="h-12 w-12 rounded-lg bg-brand-yellow-500/10 flex items-center justify-center group-hover:bg-brand-yellow-500/20 transition-colors">
                <FileText className="h-6 w-6 text-brand-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-white">PDF Generation</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Beautiful, professional report generation for all your financial documents
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="about"
          className="container mx-auto px-6 py-24 border-t border-white/10"
        >
          <div className="max-w-4xl mx-auto text-center space-y-8 p-12 md:p-16 rounded-2xl bg-gradient-to-br from-brand-yellow-500/10 to-transparent border border-brand-yellow-500/20">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Start managing your finances today
            </h3>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Join businesses across Ethiopia using Balance to streamline their
              financial operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 h-12 px-8 bg-brand-yellow-500 text-black rounded-lg hover:bg-brand-yellow-600 transition-all font-semibold"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 h-12 px-8 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-all font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-sm text-gray-500">
                © 2025 Balance. All rights reserved.
              </p>
              <p className="text-xs text-gray-600">
                Powered by{" "}
                <span className="font-semibold text-brand-yellow-500">
                  YOLET Labs
                </span>
              </p>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
