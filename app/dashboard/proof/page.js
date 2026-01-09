"use client";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Search, Globe, TrendingUp, AlertTriangle, DollarSign, Users, BarChart3, Target, CheckCircle2, XCircle, AlertCircle as AlertCircleIcon } from 'lucide-react';
import clsx from 'clsx';

export default function ProofPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [result, setResult] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadingMessages = [
        "Searching Global Marketplaces...",
        "Deep-Scraping Product Architecture...",
        "Analyzing Competitive Landscape...",
        "Calculating Market Viability..."
    ];

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setLoadingStep(0);
        setResult(null);

        const timer = setInterval(() => {
            setLoadingStep(prev => (prev + 1) % loadingMessages.length);
        }, 5000); // 5 second rotation

        try {
            const res = await fetch('/api/proof/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: input.trim() })
            });

            clearInterval(timer);
            // Check if response is actually JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                showToast(`API Error: Route not found (${res.status}). Please restart the dev server.`, 'error');
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setResult(data);
                showToast('Analysis complete', 'success');
            } else {
                showToast(data.error || 'Analysis failed', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('JSON')) {
                showToast('API route not found. Please restart the dev server (Ctrl+C then npm run dev)', 'error');
            } else {
                showToast('Network error: ' + error.message, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCandidate = async () => {
        if (!result || !user) return;
        setSaving(true);
        try {
            const res = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    productUrl: input.trim(),
                    productName: result.product_title,
                    decision: 'saved',
                    platform: result.detected_platform,
                    price: result.pricing.range.avg
                })
            });

            if (res.ok) {
                showToast('Product saved as candidate!', 'success');
            } else {
                const data = await res.json();
                showToast(data.error || 'Failed to save candidate', 'error');
            }
        } catch (error) {
            showToast('Error saving candidate', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getVerdictColor = (verdict) => {
        if (verdict === 'SCALE') return 'emerald';
        if (verdict === 'TEST') return 'amber';
        return 'red';
    };

    const getScoreColor = (score) => {
        if (score >= 70) return 'emerald';
        if (score >= 40) return 'amber';
        return 'red';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 font-poppins pb-20">
            {/* Hero Header */}
            <div className="text-center space-y-6 pt-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Real-Time Evidence Engine
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
                    Live <span className="text-indigo-500">Proof</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                    Instantly validate any product URL with enterprise-grade deep scraping and profit modeling.
                </p>
            </div>

            {/* Sleek Modern Input Bar */}
            <div className="max-w-3xl mx-auto px-4">
                <div className="relative group transition-all duration-300">
                    {/* Subtle outer glow on hover only */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity" />

                    <div className="relative bg-white dark:bg-forest-900/50 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all overflow-hidden font-poppins">
                        <form onSubmit={handleAnalyze} className="flex items-center">
                            <div className="pl-5 text-gray-400">
                                <Globe className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste product URL (Amazon, eBay, Shopify...)"
                                className="flex-1 px-4 py-4 bg-transparent border-none focus:ring-0 focus:outline-0 active:outline-0 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400/50"
                            />
                            <div className="pr-1.5 pl-2">
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:bg-gray-200 dark:disabled:bg-forest-800 disabled:text-gray-400 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                            <span>Scanning</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-3.5 h-3.5" />
                                            <span>Verify</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {/* Secondary Info Moved Here */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 px-4">
                {['Amazon Global', 'TikTok Shop', 'eBay', 'Shopify Stores', 'Etsy'].map((platform) => (
                    <div key={platform} className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-forest-900/40 px-3 py-1.5 rounded-full border border-gray-100 dark:border-forest-800">
                        <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                        {platform}
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {
                loading && (
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
                        <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.2em] text-sm animate-pulse">
                            {loadingMessages[loadingStep]}
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Bypassing platform restrictions for deep validation</p>
                    </div>
                )
            }

            {/* Results */}
            {
                result && !loading && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">

                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{result.detected_platform} • {result.detected_region}</span>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate max-w-2xl">{result.product_title}</h2>
                            </div>
                            <div className="text-xs text-gray-400 font-medium">
                                Analyzed: {new Date(result.analyzed_at).toLocaleString()}
                            </div>
                        </div>

                        {/* Executive Summary Card */}
                        <div className={clsx(
                            "p-8 rounded-[2rem] border-4 relative overflow-hidden shadow-xl",
                            result.verdict === 'SCALE' ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/20" :
                                result.verdict === 'TEST' ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-500/20" :
                                    "bg-red-50/50 dark:bg-red-900/10 border-red-500/20"
                        )}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {result.verdict === 'SCALE' && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
                                        {result.verdict === 'TEST' && <AlertCircleIcon className="w-10 h-10 text-amber-500" />}
                                        {result.verdict === 'KILL' && <XCircle className="w-10 h-10 text-red-500" />}
                                        <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {result.verdict === 'SCALE' ? '🚀 SCALE' :
                                                result.verdict === 'TEST' ? '🔬 TEST' :
                                                    '💀 SKIP'}
                                        </h2>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Trust Score: <span className="text-emerald-500">{result.quality?.trust_score}%</span>
                                        </span>
                                        <span className="bg-indigo-500 h-1 w-1 rounded-full"></span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Risk Level: <span className={clsx(
                                                result.risk?.level === 'low' ? 'text-emerald-500' : 'text-red-500'
                                            )}>{result.risk?.level.toUpperCase()}</span>
                                        </span>
                                        <span className="bg-indigo-500 h-1 w-1 rounded-full"></span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            ROI: <span className="text-indigo-500">{result.profit?.roi_percent}%</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="hidden lg:flex items-center gap-6">
                                    <button
                                        onClick={handleSaveCandidate}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-forest-900 border-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-all shadow-lg shadow-indigo-500/5 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : '⭐ Save as Candidate'}
                                    </button>
                                    <ScoreGauge score={result.scores?.overall} label="Overall Rank" />
                                </div>
                            </div>
                            <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed font-semibold italic">
                                "{result.recommendations?.action}" - {result.recommendations?.verdict}
                            </p>
                        </div>

                        {/* Elite Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard
                                icon={<BarChart3 />}
                                title="Market Saturation"
                                score={result.saturation?.level === 'unsaturated' ? 20 : 80}
                                level={result.saturation?.level}
                                description={result.saturation?.recommendation}
                                inverse
                            />
                            <MetricCard
                                icon={<TrendingUp />}
                                title="Demand Force"
                                score={result.scores?.demand_score}
                                level={result.demand?.level}
                                description={`Market momentum is currently ${result.market?.maturity}.`}
                            />
                            <MetricCard
                                icon={<Users />}
                                title="Competition"
                                score={result.competition?.level === 'low' ? 20 : 80}
                                level={result.competition?.level}
                                description={result.competition?.recommendation}
                                inverse
                            />
                            <MetricCard
                                icon={<DollarSign />}
                                title="Profitability"
                                score={result.scores?.profit_potential}
                                level={`${result.profit?.profit_margin_percent}% Margin`}
                                description={`Target ROI: ${result.profit?.roi_percent}%`}
                            />
                        </div>

                        {/* Deep Insights Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Profit Margin Calculator */}
                            <div className="lg:col-span-2 bg-white dark:bg-forest-900/40 border border-indigo-500/10 rounded-[2rem] p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <DollarSign className="w-8 h-8 text-emerald-500" />
                                        Elite Profit Matrix
                                    </h3>
                                    <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                                        {result.profit?.monthly_revenue_potential?.estimated_monthly_sales} Units / Mo
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-6">
                                        <div className="text-center p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                                            <div className="text-4xl font-black text-indigo-500 mb-1">{result.profit?.profit_margin_percent}%</div>
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Net Margin</div>
                                        </div>
                                        <div className="text-center p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                                            <div className="text-3xl font-black text-emerald-500 mb-1">${result.profit?.net_profit_per_unit}</div>
                                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Unit Profit</div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-4">
                                        <CostRow label="Target Selling Price" value={`$${result.profit?.selling_price}`} isTotal />
                                        <div className="h-px bg-gray-100 dark:bg-forest-800 my-2"></div>
                                        <CostRow label="Est. Sourcing (COGS)" value={`-$${result.profit?.estimated_cogs}`} />
                                        <CostRow label="Unit Profit" value={`+$${result.profit?.net_profit_per_unit}`} highlight />
                                        <div className="h-px bg-gray-100 dark:bg-forest-800 my-2"></div>
                                        <CostRow label="Projected Monthly Profit" value={`$${result.profit?.monthly_revenue_potential?.estimated_monthly_profit}`} highlight />
                                    </div>
                                </div>
                            </div>

                            {/* Risk & Quality Panels */}
                            <div className="space-y-6">
                                {/* Risk Assessment */}
                                <div className="bg-white dark:bg-forest-900/40 border border-indigo-500/10 rounded-[2rem] p-6 shadow-sm">
                                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Assessment
                                    </h4>
                                    <div className="space-y-3">
                                        {result.risk?.risks.length > 0 ? (
                                            result.risk.risks.map((r, i) => (
                                                <div key={i} className="flex items-start gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded-xl border border-red-500/20">
                                                    <AlertCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {r.message}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-xl border border-emerald-500/20">
                                                No high severity risks detected.
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest">Risk Score: {result.risk?.score}/100</p>
                                </div>

                                {/* Quality Intel */}
                                <div className="bg-white dark:bg-forest-900/40 border border-indigo-500/10 rounded-[2rem] p-6 shadow-sm">
                                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-indigo-500" /> Market Verdict
                                    </h4>
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
                                        {result.recommendations?.verdict}
                                    </p>
                                    <div className="space-y-2">
                                        {result.recommendations?.pros.map((pro, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase">
                                                <CheckCircle2 className="w-3 h-3" /> {pro}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Plan Blueprint */}
                        <div className="bg-white dark:bg-forest-900/40 border border-indigo-500/10 rounded-[2rem] p-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                                <Target className="w-8 h-8 text-indigo-500" />
                                Strategic Scaling Blueprint
                            </h3>
                            <div className="space-y-8">
                                <ActionSection title="Immediate Execution Phase" items={result.recommendations?.next_steps || []} />
                            </div>
                        </div>

                        {/* Competitor Analysis */}
                        <div className="bg-white dark:bg-forest-900/40 border border-indigo-500/10 rounded-[2rem] p-8 overflow-hidden flex flex-col">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8">Competitive Intelligence</h3>
                            <div className="overflow-x-auto flex-1">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-forest-800">
                                            <th className="text-left pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform</th>
                                            <th className="text-left pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                                            <th className="text-left pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Social Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-forest-900">
                                        {result.proof_sources.slice(0, 8).map((source, i) => (
                                            <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-forest-900/20 transition-colors">
                                                <td className="py-4">
                                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="block">
                                                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md text-[10px] font-black border border-indigo-500/10 inline-block mb-1">
                                                            {source.platform}
                                                        </span>
                                                        <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors truncate max-w-[150px]">
                                                            {source.title}
                                                        </div>
                                                    </a>
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-sm font-black text-gray-900 dark:text-white">${source.priceUSD?.toFixed(2) || source.price?.toFixed(2)}</div>
                                                    <div className="text-[10px] font-bold text-gray-400">{source.currency} {source.originalPrice}</div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="text-sm font-bold text-indigo-500">{source.reviews > 0 ? source.reviews.toLocaleString() : '--'}</div>
                                                    <div className="text-amber-500 text-[8px] tracking-tighter">★★★★★</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

// Helper Components
function MetricCard({ icon, title, score, level, description, inverse = false }) {
    const isGood = inverse ? score < 40 : score > 60;
    const color = isGood ? 'emerald' : score > 40 ? 'amber' : 'red';

    return (
        <div className="bg-white dark:bg-forest-900/40 border border-indigo-500/5 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={clsx("p-3 rounded-2xl", `bg-${color}-500/10 text-${color}-500`)}>
                    {icon}
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">{score}%</div>
            </div>
            <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className={clsx("text-xl font-black mb-2", `text-${color}-500`)}>{level}</p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">{description}</p>
        </div>
    );
}

function CostRow({ label, value, highlight = false, isTotal = false }) {
    return (
        <div className="flex justify-between items-center text-sm font-bold">
            <span className={clsx(highlight ? "text-indigo-500" : "text-gray-500")}>{label}</span>
            <span className={clsx(
                highlight ? "text-xl font-black text-emerald-500" :
                    isTotal ? "text-gray-900 dark:text-white" :
                        "text-red-500"
            )}>{value}</span>
        </div>
    );
}

function ScoreGauge({ score, label }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-forest-800" />
                    <circle
                        cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6"
                        className="text-indigo-500"
                        strokeDasharray={176}
                        strokeDashoffset={176 - (176 * score) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <span className="absolute text-xs font-black text-indigo-500">{score}%</span>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase mt-2 tracking-widest">{label}</span>
        </div>
    );
}

function ActionSection({ title, items }) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">{title}</h4>
            <div className="grid grid-cols-1 gap-y-3">
                {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-forest-900/40 rounded-2xl border border-gray-100 dark:border-forest-800 group hover:border-indigo-500/30 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                        </div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InfoCard({ title, content }) {
    return (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-5">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">{title}</h4>
            <p className="text-sm font-black text-gray-900 dark:text-white leading-relaxed">{content}</p>
        </div>
    );
}
