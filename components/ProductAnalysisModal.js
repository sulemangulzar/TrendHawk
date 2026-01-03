"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrendingUp, DollarSign, Users, Activity, ExternalLink, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProductAnalysisModal({ product, children }) {
    const [costPrice, setCostPrice] = useState('');

    // Parse price safely
    const sellingPrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
    const cost = parseFloat(costPrice) || 0;
    const profit = sellingPrice - cost;
    const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;

    // Valid Chart Data
    const chartData = (product.sales_history || [12, 19, 15, 25, 32, 30, 45]).map((val, i) => ({
        day: `Day ${i + 1}`,
        sales: val
    }));

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border-none shadow-2xl rounded-3xl font-poppins text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto ring-1 ring-gray-100 dark:ring-white/5">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold pr-8 line-clamp-1">{product.title}</DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-8 mt-4">
                    {/* Left Column: Image & Calculator */}
                    <div className="space-y-6">
                        <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {/* Use img tag for simplicity with external urls */}
                            <img
                                src={product.image}
                                alt={product.title}
                                className="object-cover w-full h-full"
                                onError={(e) => e.target.src = 'https://placehold.co/600x400?text=No+Image'}
                            />
                        </div>

                        {/* Profit Calculator Feature */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl">
                            <h3 className="flex items-center gap-2 font-bold mb-4 text-indigo-800 dark:text-indigo-400">
                                <Calculator className="w-4 h-4" /> Profit Calculator
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Selling Price</label>
                                    <div className="font-bold text-lg">${sellingPrice.toFixed(2)}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Product Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={costPrice}
                                            onChange={(e) => setCostPrice(e.target.value)}
                                            className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 pl-6 pr-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-indigo-100 dark:border-indigo-800/10">
                                <span className="text-sm font-medium">Net Profit</span>
                                <div className="text-right">
                                    <div className={`text-xl font-bold ${profit >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
                                        ${profit.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">{margin}% Margin</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & Chart */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <StatBox label="Demand Score" value={product.demand_score || '85/100'} icon={EagleIcon} color="text-indigo-500" />
                            <StatBox label="Competition" value={product.competition_level || 'Medium'} icon={Users} color="text-orange-500" />
                            <StatBox label="Est. Revenue" value={product.monthly_revenue || '$12K'} icon={DollarSign} color="text-green-500" />
                            <StatBox label="Trend" value="Rising ↗" icon={Activity} color="text-blue-500" />
                        </div>

                        {/* Chart Feature */}
                        <div className="bg-white dark:bg-black p-4 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-white/5">
                            <h3 className="text-sm font-semibold mb-4 text-gray-500">7-Day Sales Trend</h3>
                            <div className="h-40 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                        <XAxis dataKey="day" hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#6366f1' }}
                                        />
                                        <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="pt-2">
                            <a href={product.url} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full h-12 text-lg shadow-indigo-500/20">
                                    View on {product.platform} <ExternalLink className="ml-2 w-4 h-4" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function StatBox({ label, value, icon: Icon, color }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl">
            <div className={`mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}
