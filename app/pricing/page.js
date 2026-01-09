"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function PricingPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loadingPlan, setLoadingPlan] = useState(null);

    const plans = [
        {
            name: 'Basic',
            price: billingCycle === 'monthly' ? 19 : 182,
            description: 'For casual sellers testing products',
            features: [
                '100 Risk Checks per month',
                'Market Proof with seller repetition data',
                'Shortlist management (watching/ready/rejected)',
                'Live Tests tracking (up to 5 active)',
                'Money protection stats',
                'Profit calculator',
                'Email support'
            ],
            cta: 'Upgrade to Basic',
            popular: false
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? 49 : 470,
            description: 'Stop losing money on bad products',
            features: [
                '450 Risk Checks per month',
                'Full Market Proof access',
                'Unlimited Shortlist products',
                'Unlimited Live Tests with auto recommendations',
                'Money protection dashboard',
                'Advanced profit scenarios (bull/base/bear)',
                'Today\'s Action recommendations',
                'Priority support',
                'Early access to new features'
            ],
            cta: 'Upgrade to Pro',
            popular: true
        }
    ];

    const handleUpgrade = async (plan) => {
        if (!user) {
            router.push('/login');
            return;
        }

        setLoadingPlan(plan);

        try {
            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    plan: plan,
                    userId: user.id,
                    userEmail: user.email,
                }),
            });

            const data = await response.json();

            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            alert('Failed to start checkout. Please try again.');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black font-poppins">
            {/* Header */}
            <div className="bg-white dark:bg-forest-950 border-b border-gray-200 dark:border-forest-800">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Link href="/dashboard" className="flex items-center gap-3 w-fit">
                        <Logo className="w-10 h-10" />
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
                        Stop losing money on bad products. Choose the plan that protects your wallet.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-xl p-1 inline-flex">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'monthly'
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billingCycle === 'yearly'
                                ? 'bg-indigo-500 text-white'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">
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
                                ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20'
                                : 'border-gray-200 dark:border-forest-800'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
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
                                        <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>


                            {plan.disabled ? (
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    disabled={true}
                                >
                                    {plan.cta}
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleUpgrade(plan.name.toLowerCase())}
                                    className="w-full"
                                    variant={plan.popular ? 'premium' : 'outline'}
                                    disabled={loadingPlan === plan.name.toLowerCase()}
                                >
                                    {loadingPlan === plan.name.toLowerCase() ? 'Loading...' : plan.cta}
                                </Button>
                            )}

                        </div>
                    ))}
                </div>

                {/* FAQ or Additional Info */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        All plans include a 14-day money-back guarantee
                    </p>
                    <Link href="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
