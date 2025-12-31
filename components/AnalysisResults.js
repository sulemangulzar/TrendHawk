"use client";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck, Zap, Thermometer, BarChart3 } from 'lucide-react';

export function AnalysisResults({ product }) {
    if (!product) return null;

    return (
        <div className="space-y-6">
            <VerdictCard
                verdict={product.verdict}
                riskLevel={product.risk_level}
                confidenceScore={product.confidence_score}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MarketTemperatureSection temp={product.market_temperature || 'Stable'} />
                <CompetitionMeterSection saturation={product.saturation_score || 45} />
            </div>

            <WhyVerdictSection result={product} />
            <ProfitRealitySection result={product} />

            {product.common_complaints && product.common_complaints.length > 0 && (
                <ComplaintsSection complaints={product.common_complaints} />
            )}

            <AudienceSection result={product} />

            {product.failure_reasons && product.failure_reasons.length > 0 && (
                <FailureReasonsSection reasons={product.failure_reasons} />
            )}
        </div>
    );
}

function VerdictCard({ verdict, riskLevel, confidenceScore }) {
    const configs = {
        test: {
            icon: CheckCircle,
            title: 'VERDICT: ✅ TEST',
            bg: 'from-green-500 to-emerald-600',
            text: 'text-white',
            message: 'Good potential'
        },
        careful: {
            icon: AlertTriangle,
            title: 'VERDICT: ⚠ CAREFUL',
            bg: 'from-yellow-500 to-orange-600',
            text: 'text-white',
            message: 'Moderate risk detected'
        },
        skip: {
            icon: XCircle,
            title: 'VERDICT: ❌ SKIP',
            bg: 'from-red-500 to-pink-600',
            text: 'text-white',
            message: 'High risk - not recommended'
        }
    };

    const config = configs[verdict] || configs.skip;
    const Icon = config.icon;

    return (
        <div className={`bg-gradient-to-br ${config.bg} rounded-3xl p-6 md:p-8 ${config.text} shadow-2xl relative overflow-hidden`}>
            {/* Background effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 text-center sm:text-left">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <Icon className="w-10 h-10 md:w-12 md:h-12" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black mb-1 leading-tight">{config.title}</h2>
                            <p className="text-base md:text-lg opacity-90 font-medium">{config.message}</p>
                        </div>
                    </div>

                    <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center min-w-[120px] border border-white/20 self-stretch sm:self-auto">
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">Confidence</p>
                        <div className="text-3xl md:text-4xl font-black flex items-center">
                            {confidenceScore || 0}
                            <span className="text-xl opacity-60 ml-0.5">%</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-4 md:gap-6 text-[10px] font-black uppercase tracking-widest opacity-80">
                    <span className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Risk: {riskLevel}
                    </span>
                    <span className="flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full">
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        Live Scan
                    </span>
                </div>
            </div>
        </div>
    );
}

function WhyVerdictSection({ result }) {
    const reasons = [];
    if (result.saturation_score > 70) reasons.push({ icon: '❌', text: `Market Saturation (${result.saturation_score}/100)`, type: 'bad' });
    if (result.priceWarDetected) reasons.push({ icon: '❌', text: 'Price Wars Detected', type: 'bad' });
    if (result.emotional_trigger_score < 50) reasons.push({ icon: '⚠', text: 'Weak Emotional Trigger', type: 'warning' });
    if (result.profit_average_case > 10) reasons.push({ icon: '✅', text: 'Good Profit Margins', type: 'good' });
    if (result.demand_level === 'high') reasons.push({ icon: '✅', text: 'High Demand', type: 'good' });

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Why This Verdict</h3>
            <ul className="space-y-3">
                {reasons.map((reason, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <span className="text-2xl">{reason.icon}</span>
                        <span className="text-gray-700 dark:text-gray-300">{reason.text}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ProfitRealitySection({ result }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profit Reality</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product Cost</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${result.estimated_cost}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shipping</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">${result.estimated_shipping}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Sell Price</p>
                    <p className="text-2xl font-bold text-lime-600 dark:text-lime-400">${result.price}</p>
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-forest-700 pt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Worst Case:</span>
                    <span className={`text-xl font-bold ${result.profit_worst_case < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        ${result.profit_worst_case}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Average:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${result.profit_average_case}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Best Case:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">${result.profit_best_case}</span>
                </div>
            </div>
        </div>
    );
}

function ComplaintsSection({ complaints }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Complaints</h3>
            <ul className="space-y-3">
                {complaints.map((complaint, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className={`text-2xl`}>
                            {complaint.severity === 'high' ? '🔴' : complaint.severity === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {complaint.type} ({complaint.percentage}% of reviews)
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{complaint.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AudienceSection({ result }) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Best For
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{result.best_audience}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Avoid If
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{result.avoid_audience}</p>
            </div>
        </div>
    );
}

function FailureReasonsSection({ reasons }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Common Failure Reasons</h3>
            <ul className="space-y-4">
                {reasons.map((reason, i) => (
                    <li key={i} className="border-l-4 border-red-500 pl-4">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">{reason.reason}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
                        <span className={`text-xs font-bold uppercase ${reason.impact === 'critical' ? 'text-red-600' : reason.impact === 'high' ? 'text-orange-600' : 'text-yellow-600'}`}>
                            {reason.impact} impact
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MarketTemperatureSection({ temp }) {
    const config = {
        'Heating': { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '🔥' },
        'Stable': { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: '💎' },
        'Dying': { color: 'text-red-500', bg: 'bg-red-500/10', icon: '🧊' }
    }[temp] || { color: 'text-gray-500', bg: 'bg-gray-500/10', icon: '📊' };

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Market Temperature
            </h3>
            <div className={`flex items-center justify-between p-4 rounded-xl ${config.bg}`}>
                <div>
                    <p className={`text-2xl font-black ${config.color}`}>{temp}</p>
                    <p className="text-xs text-gray-500 font-medium">Updated 5m ago</p>
                </div>
                <span className="text-4xl">{config.icon}</span>
            </div>
        </div>
    );
}

function CompetitionMeterSection({ saturation }) {
    const getLevel = (s) => {
        if (s > 80) return { label: 'INSANE', color: 'bg-red-500' };
        if (s > 60) return { label: 'HIGH', color: 'bg-orange-500' };
        if (s > 30) return { label: 'MEDIUM', color: 'bg-yellow-500' };
        return { label: 'LOW', color: 'bg-green-500' };
    };

    const level = getLevel(saturation);

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Competition Pressure
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{level.label}</p>
                    <p className="text-sm font-bold text-gray-500">{saturation}% Saturation</p>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-forest-800 rounded-full overflow-hidden">
                    <div className={`h-full ${level.color} transition-all duration-1000`} style={{ width: `${saturation}%` }}></div>
                </div>
            </div>
        </div>
    );
}
