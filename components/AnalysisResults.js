"use client";
import { CheckCircle, AlertTriangle, XCircle, ShieldCheck, Zap, Thermometer, BarChart3, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export function AnalysisResults({ product }) {
    if (!product) return null;

    // Check if we have full_analysis from universal scraper
    const hasFullAnalysis = product.full_analysis && product.source === 'universal_scraper';

    return (
        <div className="space-y-6">
            <VerdictCard
                verdict={product.verdict}
                riskLevel={product.risk_level}
                confidenceScore={product.confidence_score}
                fullAnalysis={hasFullAnalysis ? product.full_analysis : null}
            />

            {/* Universal Scraper Enhanced Sections */}
            {hasFullAnalysis && (
                <>
                    <UniversalScraperMetrics analysis={product.full_analysis} product={product} />
                    <ProfitBreakdownSection analysis={product.full_analysis.profit} />
                    <RiskAnalysisSection analysis={product.full_analysis.risk} />
                    <CompetitorInsightsSection analysis={product.full_analysis.competitor} price={product.price} />
                </>
            )}

            {/* Standard Sections (backward compatible) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MarketTemperatureSection
                    temp={hasFullAnalysis ? mapTrendToTemp(product.full_analysis.trend.direction) : (product.market_temperature || 'Stable')}
                />
                <CompetitionMeterSection saturation={product.saturation_score || 45} />
            </div>

            <WhyVerdictSection result={product} fullAnalysis={hasFullAnalysis ? product.full_analysis : null} />
            <ProfitRealitySection result={product} fullAnalysis={hasFullAnalysis ? product.full_analysis : null} />

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

// Helper function to map trend to temperature
function mapTrendToTemp(trend) {
    if (trend === 'RISING') return 'Heating';
    if (trend === 'UNTESTED') return 'Dying';
    return 'Stable';
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
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${result.price}</p>
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

// ========================================
// UNIVERSAL SCRAPER ENHANCED COMPONENTS
// ========================================

function UniversalScraperMetrics({ analysis, product }) {
    const levelColors = {
        1: 'bg-blue-500',
        2: 'bg-indigo-500',
        3: 'bg-purple-500',
        4: 'bg-orange-600'
    };

    const levelNames = {
        1: 'Basic HTML',
        2: 'JSON Extract',
        3: 'Script AI',
        4: 'Headless Pro'
    };

    const confidence = analysis.meta?.confidence_score || 0;
    const confidenceColor = confidence > 80 ? 'text-emerald-500' : (confidence > 60 ? 'text-amber-500' : 'text-red-500');

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                        Enterprise Scraper Intelligence
                    </h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-forest-900/40 rounded-full border border-indigo-100 dark:border-indigo-900 shadow-sm">
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-500">Confidence</span>
                        <span className={`text-sm font-black ${confidenceColor}`}>{confidence}%</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-forest-900/40 rounded-full border border-indigo-100 dark:border-indigo-900 shadow-sm">
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-500">Method</span>
                        <span className={`text-xs font-bold text-indigo-600 dark:text-indigo-400`}>LVL {analysis.meta?.scraper_level || 1} • {levelNames[analysis.meta?.scraper_level || 1]}</span>
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-indigo-600 text-white rounded-full flex items-center shadow-lg shadow-indigo-500/20">
                        LIVE DATA
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 dark:bg-forest-900/40 rounded-xl p-4 border border-white/40 dark:border-forest-800/40">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Product</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate" title={product.title}>{product.title}</p>
                </div>
                <div className="bg-white/60 dark:bg-forest-900/40 rounded-xl p-4 border border-white/40 dark:border-forest-800/40">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Live Price</p>
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">${product.price}</p>
                </div>
                <div className="bg-white/60 dark:bg-forest-900/40 rounded-xl p-4 border border-white/40 dark:border-forest-800/40">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Market Position</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{analysis.competitor?.pricing_position || 'AVERAGE'}</p>
                </div>
                <div className="bg-white/60 dark:bg-forest-900/40 rounded-xl p-4 border border-white/40 dark:border-forest-800/40">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Momentum</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{analysis.trend?.momentum || 'Stable'}</p>
                </div>
            </div>

            {confidence < 65 && (
                <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                        <b>Low Data Quality Detected:</b> Results are using partial heuristics. Confidence is below 65%.
                    </p>
                </div>
            )}
        </div>
    );
}

function ProfitBreakdownSection({ analysis }) {
    const profitColor = analysis.net_profit > 10 ? 'text-emerald-600 dark:text-emerald-400' :
        analysis.net_profit > 5 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400';

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Expense Safe Plan (Projected)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projected Sourcing</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${analysis.estimated_cost}</p>
                </div>
                <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Marketing Buffers</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${analysis.ad_cost}</p>
                </div>
                <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Channel Fees</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">${analysis.platform_fee}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border-2 border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1 font-bold">Projected Net</p>
                    <p className={`text-xl font-black ${profitColor}`}>${analysis.net_profit}</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border-2 border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-1 font-bold">Margin</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{analysis.margin_percent}%</p>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs text-amber-800 dark:text-amber-400 font-bold mb-1">⚠️ Disclaimer</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                    All values are estimates based on heuristics. Actual costs may vary.
                </p>
            </div>
        </div>
    );
}

function RiskAnalysisSection({ analysis }) {
    const riskConfig = {
        'LOW': { color: 'text-emerald-600', bg: 'bg-emerald-500', icon: '✅' },
        'MEDIUM': { color: 'text-yellow-600', bg: 'bg-yellow-500', icon: '⚠️' },
        'HIGH': { color: 'text-red-600', bg: 'bg-red-500', icon: '❌' }
    };

    const config = riskConfig[analysis.risk_level] || riskConfig.MEDIUM;

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Risk Assessment
            </h3>

            <div className="flex items-center gap-6 mb-6">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Risk Score</span>
                        <span className={`text-2xl font-black ${config.color}`}>
                            {analysis.risk_score}/100
                        </span>
                    </div>
                    <div className="h-4 bg-gray-100 dark:bg-forest-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${config.bg} transition-all duration-1000`}
                            style={{ width: `${analysis.risk_score}%` }}
                        ></div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-5xl mb-2">{config.icon}</div>
                    <p className={`text-lg font-black ${config.color}`}>{analysis.risk_level}</p>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Risk factors include: price point, review count, rating quality, and image availability.
                    Higher scores indicate lower risk.
                </p>
            </div>
        </div>
    );
}

function CompetitorInsightsSection({ analysis, price }) {
    const positionConfig = {
        'UNDERPRICED': {
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: '💰',
            message: 'Great opportunity! Your price is below market average.'
        },
        'AVERAGE': {
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            icon: '📊',
            message: 'Competitive pricing. You\'re aligned with the market.'
        },
        'OVERPRICED': {
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: '⚠️',
            message: 'Price is above market average. May face competition.'
        },
        'UNKNOWN': {
            color: 'text-gray-600 dark:text-gray-400',
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            border: 'border-gray-200 dark:border-gray-800',
            icon: '❓',
            message: 'Insufficient market data for comparison.'
        }
    };

    const config = positionConfig[analysis.pricing_position] || positionConfig.UNKNOWN;

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Competitor Analysis
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Price</p>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">${price}</p>
                </div>
                <div className="bg-gray-50 dark:bg-forest-800/40 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Market Average</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                        {analysis.avg_price ? `$${analysis.avg_price}` : 'N/A'}
                    </p>
                </div>
            </div>

            <div className={`${config.bg} border-2 ${config.border} rounded-xl p-4`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                        <p className={`text-lg font-black ${config.color} mb-1`}>
                            {analysis.pricing_position}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {config.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

