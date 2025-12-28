"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { CreditCard, Globe, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/signup?redirect=checkout&plan=${plan}`);
        }
    }, [user, loading, router, plan]);

    const handlePayment = (e) => {
        e.preventDefault();
        setProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard?payment=success');
            }, 2000);
        }, 2000);
    };

    if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-lime-500">Loading checkout...</div>;

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-center p-4">
            <div className="bg-lime-50 dark:bg-lime-900/20 p-8 rounded-3xl border border-lime-100 dark:border-lime-800">
                <div className="w-16 h-16 bg-lime-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Payment Successful!</h2>
                <p className="text-gray-500 dark:text-gray-400">Upgrading your account to {plan.toUpperCase()}...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 font-poppins">
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">

                {/* Order Summary */}
                <div className="md:col-span-1 order-2 md:order-1">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 sticky top-12">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Order Summary</h3>
                        <div className="flex justify-between mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-gray-600 dark:text-gray-400">TrendHawk {plan === 'basic' ? 'Basic' : 'Pro'}</span>
                            <span className="font-bold dark:text-white">${plan === 'basic' ? '10.00' : '30.00'}</span>
                        </div>
                        <div className="flex justify-between mb-6 text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="text-gray-500">$0.00</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold dark:text-white">
                            <span>Total</span>
                            <span>${plan === 'basic' ? '10.00' : '30.00'}</span>
                        </div>
                        <div className="mt-6 bg-lime-50 dark:bg-lime-900/20 p-3 rounded-lg flex items-start gap-2 text-xs text-lime-700 dark:text-lime-400">
                            <Lock className="w-3 h-3 mt-0.5" />
                            <span>Secure 256-bit SSL encrypted payment. 30-day money-back guarantee.</span>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="md:col-span-2 order-1 md:order-2">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800">
                        <h1 className="text-2xl font-bold mb-6 dark:text-white">Secure Checkout</h1>

                        {/* Method Selector */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'card' ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400' : 'border-gray-200 dark:border-gray-700 hover:border-lime-200 dark:text-gray-400'}`}
                            >
                                <CreditCard className="w-5 h-5" /> Card
                            </button>
                            <button
                                onClick={() => setPaymentMethod('payoneer')}
                                className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${paymentMethod === 'payoneer' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:text-gray-400'}`}
                            >
                                <Globe className="w-5 h-5" /> Payoneer
                            </button>
                        </div>

                        {paymentMethod === 'card' ? (
                            <form onSubmit={handlePayment} className="space-y-6">
                                <Input label="Cardholder Name" placeholder="John Doe" required />
                                <Input label="Card Number" placeholder="0000 0000 0000 0000" icon={CreditCard} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Expiry Date" placeholder="MM/YY" required />
                                    <Input label="CVC" placeholder="123" required />
                                </div>
                                <Button className="w-full h-14 text-lg shadow-lime-500/25" disabled={processing}>
                                    {processing ? 'Processing...' : `Pay $${plan === 'basic' ? '10.00' : '30.00'}`}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-white rounded-full border border-gray-200 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                    {/* Mock Payoneer Logo */}
                                    <span className="font-bold text-orange-500 text-xs">Payoneer</span>
                                </div>
                                <p className="mb-6 text-gray-500 dark:text-gray-400">You will be redirected to Payoneer to complete your purchase securely.</p>
                                <Button onClick={handlePayment} className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25" disabled={processing}>
                                    {processing ? 'Redirecting...' : 'Pay with Payoneer'}
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
