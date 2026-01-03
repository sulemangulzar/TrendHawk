"use client";
import Link from 'next/link';
import { Button } from '@/components/ui';
import Logo from '@/components/Logo';
import { ArrowRight, CheckCircle2, Moon, Sun, Shield, Check, DollarSign, TrendingUp, Calculator, Play, Target } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [showDemo, setShowDemo] = useState(false);

  const faqs = [
    {
      q: "How does TrendHawk find trending products?",
      a: "We scrape real-time data from Amazon, eBay, AliExpress, Etsy, and Daraz. Only products with proven demand and manageable competition appear in your dashboard."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes! Cancel anytime — you'll still have access until the end of your billing period."
    },
    {
      q: "Do you offer a free trial?",
      a: "Yes! The free plan includes 5 Risk Checks per month so you can test TrendHawk before upgrading."
    },
    {
      q: "How accurate is the demand score?",
      a: "Demand scores are based on sales velocity, review trends, seller repetition, and price movements, updated in real-time."
    },
    {
      q: "Will TrendHawk prevent me from losing money?",
      a: "Yes! Our simulator and Money Protection stats show you products mathematically safe to test and track money saved from killing bad products early."
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-300 bg-white dark:bg-black text-gray-900 dark:text-white font-poppins overflow-x-hidden">

      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-white dark:bg-black transition-colors duration-1000" />
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 dark:bg-purple-600/5 blur-[80px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/10 dark:border-white/5 backdrop-blur-[12px] sticky top-0 z-50 bg-white/60 dark:bg-black/60 transition-all duration-300">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 font-medium transition-colors">Analyzer</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 font-medium transition-colors">Pricing</a>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 font-medium transition-colors">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="px-8 py-3 text-sm h-auto shadow-indigo-500/25 font-bold">Try Decision Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-6 pt-16 pb-24 text-center 2xl:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl 2xl:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-gray-900 dark:text-white">
              Stop Losing Money <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500">
                on Bad Products
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              TrendHawk tells you exactly which products to <span className="text-gray-900 dark:text-white font-bold">test</span> and which to <span className="text-red-600 dark:text-red-400 font-bold">kill</span> — before you spend a single dollar. Track live tests, see real seller proof, and get automatic scale/kill recommendations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="h-14 px-10 text-lg w-full sm:w-auto transform hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 font-black">
                  Protect Your Money — Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button
                onClick={() => setShowDemo(true)}
                variant="outline"
                className="h-14 px-10 text-lg w-full sm:w-auto transform hover:scale-105 transition-all border-2 font-black flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              "Join hundreds of sellers who avoided over <span className="text-indigo-600 dark:text-indigo-400 font-bold">$184 in losses</span> last month."
            </p>
          </motion.div>

          {/* Key Features Section */}
          <div id="features" className="mt-32 mb-32">
            <h2 className="text-4xl font-extrabold mb-16 text-gray-900 dark:text-white">Why TrendHawk Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
              {/* Feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">1️⃣ Loss Prevention</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Our simulator calculates your <span className="font-bold text-gray-900 dark:text-white">Risk of Ruin</span>, so you never test products guaranteed to fail.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Money protection stats track losses avoided in real numbers.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">2️⃣ Global Decision Hub</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Consolidate research from <span className="font-bold text-gray-900 dark:text-white">Amazon, eBay, AliExpress, Etsy, and Daraz</span> in one unified system.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  See seller repetition, price trends, and reviews — all in real-time.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">3️⃣ Instant Profit Math</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Dynamic sliders for ad spend, shipping, and returns show your <span className="font-bold text-gray-900 dark:text-white">real net profit instantly</span>.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  No spreadsheets. No guesswork. Just safe decisions.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-8 rounded-3xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">4️⃣ Verified Market Proof</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Only act on products <span className="font-bold text-gray-900 dark:text-white">real sellers are already testing</span>.
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Proof-based insights remove risky guesses.
                </p>
              </motion.div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-32">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">Start discovering safe, profitable products in 4 simple steps</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Choose Platform",
                  desc: "Select from Amazon, eBay, AliExpress, Etsy, or Daraz.",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  step: "2",
                  title: "Fetch Trends",
                  desc: "Get real-time trending products instantly — no manual research required.",
                  color: "from-indigo-500 to-indigo-600"
                },
                {
                  step: "3",
                  title: "Analyze Data",
                  desc: "See demand scores, competition, and profit margins. Know which products are safe to test.",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  step: "4",
                  title: "Save & Export",
                  desc: "Shortlist winners, track them live, and export data to your store or CSV.",
                  color: "from-orange-500 to-orange-600"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                    <span className="text-2xl font-black">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="py-16 text-center mb-24 max-w-screen-xl mx-auto">
            <h2 className="text-4xl font-black mb-3 text-gray-900 dark:text-white tracking-tight">Simple Pricing Plans</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">Stop losing money on bad products. Choose the plan that protects your wallet.</p>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left">
              {/* Early Bird Plan */}
              <div className="p-8 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 relative hover:shadow-lg transition-all">
                <h3 className="text-xl font-black mb-1 text-gray-900 dark:text-white uppercase tracking-wider text-indigo-600">Early Bird</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">$9</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">For innovators who want to grow with us. Lock in this price forever.</p>

                <ul className="space-y-4 mb-8">
                  <Feature text="5 Risk Checks per month" />
                  <Feature text="Market Proof access" />
                  <Feature text="Shortlist tracking" />
                  <Feature text="Basic profit calculator" />
                  <Feature text="Community support" />
                </ul>

                <Link href="/pricing">
                  <Button variant="outline" className="w-full h-12 text-base font-bold border-2">Get Started</Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-3xl border-[3px] border-indigo-500 bg-white dark:bg-gray-900 shadow-xl relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">Recommended</div>
                <h3 className="text-xl font-black mb-1 text-gray-900 dark:text-white uppercase tracking-wider">Professional</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-indigo-600 dark:text-indigo-500">$29</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">For serious sellers who want to stop losing money on bad products.</p>

                <ul className="space-y-4 mb-8">
                  <Feature text="Unlimited Risk Checks" check />
                  <Feature text="Live Tests tracking (scale/kill recommendations)" check />
                  <Feature text="Money protection stats" check />
                  <Feature text="Advanced profit scenarios" check />
                  <Feature text="Priority support" check />
                </ul>

                <Link href="/pricing">
                  <Button variant="premium" className="w-full h-14 text-lg font-black shadow-xl shadow-indigo-500/30">Get Pro Access</Button>
                </Link>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 italic">
                  "Users avoided an average of <span className="text-indigo-600 dark:text-indigo-400 font-bold">$184 in losses</span> last month using this plan."
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-32">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">Everything you need to know about TrendHawk</p>

            <div className="max-w-3xl mx-auto space-y-4 text-left">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mb-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-12 text-white shadow-2xl shadow-indigo-500/30">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Ready to Stop Losing Money and Start Winning?</h2>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
              Start discovering safe, profitable products today with TrendHawk's risk-proof decision engine.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link href="/signup">
                <Button className="h-14 px-10 text-lg bg-white text-indigo-600 hover:bg-indigo-50 font-black shadow-xl">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="h-14 px-10 text-lg border-2 border-white text-white hover:bg-white/10 font-black">
                  Get Pro Access
                </Button>
              </Link>
            </div>

            <p className="text-sm text-indigo-100 italic">
              "Trusted by hundreds of sellers who avoided over <span className="font-bold">$184 in losses</span> last month."
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
        <div className="max-w-screen-2xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-500">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-500">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-500">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-500">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#pricing" className="hover:text-indigo-500">Pricing</a></li>
                <li><a href="#features" className="hover:text-indigo-500">Features</a></li>
                <li><a href="#" className="hover:text-indigo-500">Roadmap</a></li>
                <li><a href="#" className="hover:text-indigo-500">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-500">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-500">Guides</a></li>
                <li><a href="#" className="hover:text-indigo-500">API</a></li>
                <li><a href="#" className="hover:text-indigo-500">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-500">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-500">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-500">GDPR</a></li>
                <li><a href="#" className="hover:text-indigo-500">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">© 2026 TrendHawk. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500">Twitter</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500">Facebook</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-indigo-500">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowDemo(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">TrendHawk Demo</h3>
              <button onClick={() => setShowDemo(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">Demo video placeholder</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Feature({ text, check }) {
  return (
    <li className="flex items-start gap-3">
      {check ? (
        <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
      ) : (
        <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
      )}
      <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
    </li>
  );
}

function X({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
