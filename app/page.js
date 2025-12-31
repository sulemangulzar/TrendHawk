"use client";
import Link from 'next/link';
import { Button } from '@/components/ui';
import { TrendingUp, ArrowRight, CheckCircle2, Moon, Sun, Globe, Zap, Shield, Check, X, Star, Users, BarChart3, Clock } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  const faqs = [
    {
      q: "How does TrendHawk find trending products?",
      a: "We use advanced technology to analyze real-time data from Amazon and eBay. Our algorithms identify products with high demand and low competition."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes! You can cancel your subscription at any time with no questions asked. You'll continue to have access until the end of your billing period."
    },
    {
      q: "Do you offer a free trial?",
      a: "Yes! We offer a free plan with 5 searches per month so you can test TrendHawk before upgrading to a paid plan."
    },
    {
      q: "How accurate is the demand score?",
      a: "Our demand scores are calculated using multiple data points including sales velocity, review count, price trends, and search volume. They're updated in real-time for maximum accuracy."
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col transition-colors duration-300 bg-white dark:bg-black text-gray-900 dark:text-white font-poppins overflow-x-hidden">

      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime-500/10 dark:bg-lime-500/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-gray-900/50 backdrop-blur-md sticky top-0 z-50 bg-white/80 dark:bg-black/80">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/20 text-white transform hover:rotate-6 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">TrendHawk</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-lime-500 font-medium transition-colors">Analyzer</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-lime-500 font-medium transition-colors">Pricing</a>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-lime-500 dark:hover:text-lime-400 font-medium transition-colors">
                Log In
              </Link>
              <Link href="/signup">
                <Button className="px-8 py-3 text-sm h-auto shadow-lime-500/25 font-bold">Try Decision Engine</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-screen-xl mx-auto px-6 pt-24 pb-32 text-center 2xl:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-lime-50 dark:bg-lime-900/10 border border-lime-100 dark:border-lime-900/30 text-lime-600 dark:text-lime-400 text-sm font-black mx-auto mb-10 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500"></span>
              </span>
              SMART DECISION ENGINE IS LIVE
            </div>

            <h1 className="text-6xl md:text-8xl 2xl:text-9xl font-black tracking-tighter mb-8 leading-[0.9] text-gray-900 dark:text-white">
              Stop Guessing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-500 to-emerald-600 dark:from-lime-400 dark:to-emerald-500">
                Start Validating.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
              The world's first <span className="text-gray-900 dark:text-white font-bold underline decoration-lime-500/30">Loss Prevention Engine</span> for E-commerce.
              Find winning trends and simulate profit margins before you spend a single dollar on ads.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="h-16 px-12 text-xl w-full sm:w-auto transform hover:scale-105 transition-all shadow-xl shadow-lime-500/20 font-black">
                  Start Researching Free
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-black bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
                <div className="flex items-center ml-4 pl-4 border-l border-gray-200 dark:border-gray-800">
                  <div className="text-left">
                    <div className="flex gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Join 4,000+ Sellers</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-40 max-w-screen-xl mx-auto">
            {[
              { icon: Globe, label: '4', desc: 'Core Marketplaces' },
              { icon: Zap, label: 'Real-Time', desc: 'Direct Data Scraping' },
              { icon: Shield, label: 'Verified', desc: 'No-Bullshit Margin Math' },
              { icon: Clock, label: 'Instant', desc: 'Analysis & Simulator' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:border-lime-500/30 transition-all shadow-sm">
                  <stat.icon className="w-7 h-7 text-lime-600 dark:text-lime-400" />
                </div>
                <div className="text-4xl font-black text-gray-900 dark:text-white mb-1 leading-none">{stat.label}</div>
                <div className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest">{stat.desc}</div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 text-left mb-40 max-w-screen-2xl mx-auto">
            {[
              { title: 'Loss Prevention', desc: 'Our simulator calculates the "Risk of Ruin" so you never test a product that is mathematically guaranteed to fail.', icon: Shield, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/10' },
              { title: 'Global Decision Hub', desc: 'Consolidate research from Amazon, eBay, AliExpress, and Daraz into one unified decision engine.', icon: Globe, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/10' },
              { title: 'Instant Profit Math', desc: 'No more spreadsheets. Dynamic sliders for ad spend, shipping, and returns show your pure profit margin.', icon: Zap, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:border-lime-500/30 transition-all group hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-32">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-16 max-w-2xl mx-auto">Start finding winning products in 4 simple steps</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {[
                {
                  step: "1",
                  title: "Choose Platform",
                  desc: "Select from Amazon, eBay, AliExpress, Etsy, or Daraz",
                  icon: Globe,
                  color: "from-blue-500 to-blue-600"
                },
                {
                  step: "2",
                  title: "Fetch Trends",
                  desc: "Our AI scrapes real-time trending products instantly",
                  icon: TrendingUp,
                  color: "from-lime-500 to-emerald-600"
                },
                {
                  step: "3",
                  title: "Analyze Data",
                  desc: "Review demand scores, profit margins, and competition",
                  icon: BarChart3,
                  color: "from-purple-500 to-purple-600"
                },
                {
                  step: "4",
                  title: "Save & Export",
                  desc: "Save winners and export to CSV for your store",
                  icon: CheckCircle2,
                  color: "from-orange-500 to-orange-600"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Connector Line - only on large screens */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-700 -z-10" />
                  )}

                  <div className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 hover:border-lime-500/30 transition-all hover:shadow-lg h-full">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                      <item.icon className="w-8 h-8" />
                    </div>

                    {/* Step Number - Better Visibility */}
                    <div className="flex items-center justify-center mb-3">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg shadow-lg">
                        {item.step}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="py-20 text-center mb-40 max-w-screen-xl mx-auto">
            <h2 className="text-5xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Simple Pricing Plans</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-20 max-w-2xl mx-auto">Scale your winning product output with full decision data. No hidden fees.</p>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto text-left">
              {/* Basic Plan */}
              <div className="p-10 rounded-[32px] border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 relative hover:shadow-xl transition-all">
                <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-wider text-lime-600">Early Bird</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">$9</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">For innovators who want to grow with us. Lock in this price forever.</p>

                <ul className="space-y-5 mb-10">
                  <Feature text="Unlimited searches (Beta Special)" />
                  <Feature text="Live real-time data" />
                  <Feature text="Profit Simulator access" />
                  <Feature text="Export to CSV" />
                  <Feature text="Community Discord" />
                </ul>

                <Link href="/signup?plan=basic">
                  <Button variant="outline" className="w-full h-14 text-lg font-bold border-2">Get Started</Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-10 rounded-[32px] border-[3px] border-lime-500 bg-white dark:bg-gray-900 shadow-2xl relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
                <div className="absolute top-0 right-0 bg-lime-500 text-white text-[10px] font-black px-4 py-2 rounded-bl-2xl uppercase tracking-widest">Recommended</div>
                <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-wider">Professional</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black text-lime-600 dark:text-lime-500">$29</span>
                  <span className="text-gray-500 font-bold">/mo</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">For serious dropshippers scaling their multi-store empire.</p>

                <ul className="space-y-5 mb-10">
                  <Feature text="Unlimited Decision History" check />
                  <Feature text="3,000 searches per month" check />
                  <Feature text="Advanced Loss Prevention Simulator" check />
                  <Feature text="Priority Search Queue" check />
                  <Feature text="API access (50/day)" check />
                </ul>

                <Link href="/signup?plan=pro">
                  <Button variant="premium" className="w-full h-16 text-xl font-black shadow-xl shadow-lime-500/30">Get Pro Access</Button>
                </Link>
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
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 px-8 rounded-3xl bg-gradient-to-r from-lime-500 to-emerald-600 text-white mb-20 text-center">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Find Your Next Winning Product?</h2>
            <p className="text-lime-50 mb-8 text-lg max-w-2xl mx-auto">Start discovering trending products today with our powerful research tools</p>
            <div className="flex justify-center">
              <Link href="/signup">
                <Button className="h-14 px-8 text-lg bg-white text-lime-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Careers</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Blog</Link></li>
                <li><Link href="/press" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Press Kit</Link></li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Features</Link></li>
                <li><Link href="/roadmap" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Roadmap</Link></li>
                <li><Link href="/changelog" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Documentation</Link></li>
                <li><Link href="/guides" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Guides</Link></li>
                <li><Link href="/api" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">API</Link></li>
                <li><Link href="/support" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Support</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600 dark:text-gray-400">© 2025 TrendHawk. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">
                Twitter
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">
                Facebook
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">
                LinkedIn
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-lime-500 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ text, check = true, cross = false, crossCheck = false }) {
  return (
    <li className={`flex items-center gap-3 ${(cross || crossCheck) ? 'text-gray-400 opacity-60' : 'text-gray-700 dark:text-gray-300'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${(cross || crossCheck) ? 'bg-gray-200 dark:bg-gray-800' : 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400'}`}>
        {(cross || crossCheck) ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
      </div>
      <span className="font-medium text-sm">{text}</span>
    </li>
  );
}
