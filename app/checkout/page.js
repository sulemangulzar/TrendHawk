"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/pricing');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-indigo-500">
            Redirecting to pricing...
        </div>
    );
}
