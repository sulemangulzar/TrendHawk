"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Crown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

export default function PricingPage() {
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            name: 'Free',
            price: billingCycle === 'monthly' ? 0 : 0,
            description: 'Perfect for trying out TrendHawk',
            features: [
                '5 searches per day',
                'Basic product metrics',
                'Save up to 10 products',
                'Email support'
            ],
            cta: 'Current Plan',
            href: '/dashboard',
            popular: false,
            disabled: true
        },
        {
            name: 'Basic',
            price: billingCycle === 'monthly' ? 10 : 96,
            description: 'Great for casual sellers',
            features: [
                '50 searches per day',
                'Advanced analytics',
                'Save unlimited products',
                'Export to CSV',
                'Priority email support',
                'Product alerts'
            ],
            cta: 'Upgrade to Basic',
            href: '/checkout?plan=basic',
            popular: false
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? 30 : 288,
            description: 'For serious product researchers',
            features: [
                'Unlimited searches',
                'Real-time data updates',
                'Advanced competitor analysis',
                'API access',
                'Custom reports',
                'Priority support',
                'Early access to new features',
                'Dedicated account manager'
            ],
            cta: 'Upgrade to Pro',
            href: '/checkout?plan=pro',
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-poppins">
            {/* Header */}
            <div className="bg-white dark:bg-forest-950 border-b border-gray-200 dark:border-forest-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Link href="/dashboard" className="flex items-center gap-3 w-fit">
                        <div className="w-10 h-10 bg-lime-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TrendHawk</h1>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Select the perfect plan for your product research needs
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-1 inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-lime-500 text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'yearly'
                                    ? 'bg-lime-500 text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-2 py-0.5 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative bg-white dark:bg-forest-900/40 border-2 rounded-2xl p-8 ${plan.popular
                                    ? 'border-lime-500 shadow-2xl shadow-lime-500/20'
                                    : 'border-gray-200 dark:border-forest-800'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-lime-500 to-lime-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link href={plan.href} className="block">
                                <Button
                                    className={`w-full ${plan.popular
                                            ? 'shadow-lg shadow-lime-500/25'
                                            : ''
                                        }`}
                                    variant={plan.popular ? 'default' : 'outline'}
                                    disabled={plan.disabled}
                                >
                                    {plan.cta}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        All plans include a 14-day money-back guarantee
                    </p>
                    <Link href="/dashboard" className="text-lime-600 dark:text-lime-400 hover:underline font-semibold">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
