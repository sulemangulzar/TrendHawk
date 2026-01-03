"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertCircle,
    ArrowRight,
    PieChart,
    BarChart,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui';
import clsx from 'clsx';
import { useToast } from '@/context/ToastContext';

export default function SimulatorPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const { showToast } = useToast();

    const [cost, setCost] = useState(15);
    const [price, setPrice] = useState(45);
    const [ads, setAds] = useState(15);
    const [returnRate, setReturnRate] = useState(5);
    const [productName, setProductName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productId) {
            fetchProductData();
        }
    }, [productId]);

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            if (data) {
                setProductName(data.title);
                setPrice(parseFloat(data.price) || 45);
                setCost(data.estimated_cost || (parseFloat(data.price) * 0.3) || 15);
                setAds(parseFloat(data.price) * 0.35 || 15); // Default to avg ad spend
                showToast(`Loaded data for: ${data.title.substring(0, 20)}...`, 'success');
            }
        } catch (error) {
            console.error('Error fetching product for simulator:', error);
            showToast('Could not load specific product data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculations
    const totalCost = cost + ads + (price * (returnRate / 100));
    const profit = price - totalCost;
    const margin = (profit / price) * 100;

    // Scenarios
    const scenarios = [
        { name: 'Bull Case (Best)', sales: 50, profitMultiplier: 1.2 },
        { name: 'Base Case (Normal)', sales: 20, profitMultiplier: 1 },
        { name: 'Bear Case (Risk)', sales: 5, profitMultiplier: 0.6 }
    ];

    const isValTooHigh = price > 10000 || cost > 5000 || ads > 2000;

    return (
        <div className="space-y-8 font-poppins max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    <span className="text-5xl md:text-6xl block md:inline mb-2 md:mb-0">🎮</span> Case Scenario Simulator
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto md:mx-0">
                    Predict your success before spending a single dollar.
                </p>
                {isValTooHigh && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-center gap-3 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-bold tracking-tight">
                            Extreme values detected. Some calculations might be capped for visual stability.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6 bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-3xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-indigo-500" />
                        Variables
                    </h2>

                    <SliderControl
                        label="Product Cost ($)"
                        value={cost}
                        onChange={setCost}
                        min={0}
                        max={2000}
                    />
                    <SliderControl
                        label="Selling Price ($)"
                        value={price}
                        onChange={setPrice}
                        min={1}
                        max={5000}
                    />
                    <SliderControl
                        label="Ad Cost Per Sale ($)"
                        value={ads}
                        onChange={setAds}
                        min={0}
                        max={1000}
                    />
                    <SliderControl
                        label="Return Rate (%)"
                        value={returnRate}
                        onChange={setReturnRate}
                        min={0}
                        max={100}
                    />
                </div>

                {/* Analysis Result */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Verdict */}
                    <div className={`rounded-3xl p-8 border-2 transition-all ${profit > 10 ? 'bg-green-50 dark:bg-green-900/10 border-green-500' :
                        profit > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500' :
                            'bg-red-50 dark:bg-red-900/10 border-red-500'
                        }`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Estimated Net Profit</p>
                                <p className={`text-5xl font-black ${profit > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'
                                    }`}>
                                    ${profit.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-1">Profit Margin</p>
                                <p className="text-3xl font-bold text-indigo-600">{margin.toFixed(1)}%</p>
                            </div>
                        </div>

                        {profit < 5 && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl border border-red-500/20">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm font-bold">WARNING: Margin too thin for a sustainable business.</p>
                            </div>
                        )}
                    </div>

                    {/* Scenarios Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scenarios.map((s, i) => (
                            <div key={i} className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-3">{s.name}</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                                    ${(profit * s.sales).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 font-medium">Monthly Potential</p>
                            </div>
                        ))}
                    </div>

                    {/* Visual Breakdown */}
                    <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-purple-500" />
                            Cost Breakdown
                        </h3>
                        <div className="space-y-4">
                            <BreakdownRow label="Product Acquisiton" amount={cost} color="bg-blue-500" total={price} />
                            <BreakdownRow label="Advertising & Marketing" amount={ads} color="bg-orange-500" total={price} />
                            <BreakdownRow label="Returns & Handling" amount={price * (returnRate / 100)} color="bg-red-500" total={price} />
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-forest-800 flex justify-between items-center">
                                <span className="font-bold text-gray-900 dark:text-white">Net Profit</span>
                                <span className="text-2xl font-black text-indigo-600">${profit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SliderControl({ label, value, onChange, min, max }) {
    const handleNumberChange = (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) return;

        // Cap the value at 10x the intended max for number input, but slider stays at max
        const limit = max * 10;
        if (val > limit) val = limit;
        if (val < min) val = min;

        onChange(val);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{label}</label>
                <div className="relative">
                    <span className="absolute left-2 top-1 text-xs text-indigo-600 font-bold">$</span>
                    <input
                        type="number"
                        value={value}
                        onChange={handleNumberChange}
                        className={clsx(
                            "w-20 pl-4 pr-1 py-1 text-right font-black rounded-lg border focus:outline-none focus:ring-2 text-sm no-spinner transition-all",
                            value >= max
                                ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-500/20 focus:ring-amber-500"
                                : "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/20 focus:ring-indigo-50"
                        )}
                        inputMode="decimal"
                    />
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={max > 500 ? 5 : 1}
                value={Math.min(value, max)}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-100 dark:bg-forest-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                <span>{min}</span>
                <span>{max}{value > max && '+'}</span>
            </div>
        </div>
    );
}

function BreakdownRow({ label, amount, color, total }) {
    // Prevent width from going crazy with extreme values
    const safeTotal = total || 1;
    const width = Math.min(100, Math.max(0, (amount / safeTotal) * 100));
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                <span>{label}</span>
                <span>${amount.toFixed(2)}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-forest-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${width}%` }}
                ></div>
            </div>
        </div>
    );
}
