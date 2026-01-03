"use client";
import { BookOpen, TrendingDown, AlertCircle, Target, Lightbulb } from 'lucide-react';

export default function InsightsPage() {
    return (
        <div className="space-y-8 font-poppins max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    <span className="text-5xl">🧠</span> Insights
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Learn from patterns and become a smarter seller
                </p>
            </div>

            {/* Why Products Fail */}
            <section className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Why Products Fail
                    </h2>
                </div>

                <div className="space-y-4">
                    <FailurePattern
                        title="Market Saturation"
                        description="When too many sellers compete for the same product, profit margins collapse. Look for products with under 500 reviews."
                        impact="High"
                    />
                    <FailurePattern
                        title="Price Wars"
                        description="Competitors racing to the bottom on price. If the product is under $15 with high competition, it's likely in a price war."
                        impact="Critical"
                    />
                    <FailurePattern
                        title="Poor Quality Control"
                        description="Products that break easily lead to high return rates and negative reviews, killing your seller reputation."
                        impact="High"
                    />
                    <FailurePattern
                        title="Weak Emotional Trigger"
                        description="Products that don't solve a clear problem or create desire fail to convert, even with good ads."
                        impact="Medium"
                    />
                </div>
            </section>

            {/* Saturation Patterns */}
            <section className="bg-white dark:bg-forest-900/40 border border-gray-200 dark:border-forest-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Spotting Saturation
                    </h2>
                </div>

                <div className="space-y-4">
                    <InsightCard
                        icon="🔴"
                        title="High Saturation (Skip)"
                        points={[
                            "5,000+ reviews on top listings",
                            "Price under $20 with many sellers",
                            "Dozens of identical products on page 1"
                        ]}
                    />
                    <InsightCard
                        icon="🟡"
                        title="Medium Saturation (Careful)"
                        points={[
                            "500-2,000 reviews",
                            "Some differentiation possible",
                            "Room for unique angles"
                        ]}
                    />
                    <InsightCard
                        icon="🟢"
                        title="Low Saturation (Test)"
                        points={[
                            "Under 500 reviews",
                            "Few direct competitors",
                            "Opportunity for market entry"
                        ]}
                    />
                </div>
            </section>

            {/* Beginner Mistakes */}
            <section className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Common Beginner Mistakes
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <MistakeCard
                        mistake="Testing Too Many Products at Once"
                        cost="$300-500"
                        solution="Test 1-2 products at a time with proper budget"
                    />
                    <MistakeCard
                        mistake="Ignoring Profit Margins"
                        cost="$200-400"
                        solution="Calculate all costs before testing (product, shipping, ads, fees)"
                    />
                    <MistakeCard
                        mistake="Choosing Saturated Products"
                        cost="$150-300"
                        solution="Use TrendHawk's saturation score - avoid anything over 70"
                    />
                    <MistakeCard
                        mistake="Underestimating Ad Costs"
                        cost="$400-600"
                        solution="Budget for 30-50% of product price in ad spend"
                    />
                </div>
            </section>

            {/* Winning Characteristics */}
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        What Makes Products Win
                    </h2>
                </div>

                <div className="space-y-4">
                    <WinningTrait
                        trait="Solves a Clear Problem"
                        example="Posture corrector for back pain"
                        why="People actively search for solutions"
                    />
                    <WinningTrait
                        trait="Visual Appeal"
                        example="Galaxy projector, LED lights"
                        why="Creates desire and social sharing"
                    />
                    <WinningTrait
                        trait="Perceived Value > Actual Cost"
                        example="$30 product that costs $8"
                        why="Healthy profit margins for scaling"
                    />
                    <WinningTrait
                        trait="Low Competition + Rising Demand"
                        example="New trending items with <500 reviews"
                        why="Early market entry advantage"
                    />
                </div>
            </section>

            {/* Pro Tip */}
            <div className="bg-indigo-500 text-white rounded-2xl p-6 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
                <p className="text-indigo-50">
                    The best products combine low saturation, clear emotional triggers, and healthy profit margins.
                    Use TrendHawk's verdict system to find these opportunities automatically.
                </p>
            </div>
        </div>
    );
}

function FailurePattern({ title, description, impact }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 rounded-xl p-4 border-l-4 border-red-500">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${impact === 'Critical' ? 'bg-red-600 text-white' :
                        impact === 'High' ? 'bg-orange-500 text-white' :
                            'bg-yellow-500 text-white'
                    }`}>
                    {impact} Impact
                </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
    );
}

function InsightCard({ icon, title, points }) {
    return (
        <div className="bg-gray-50 dark:bg-forest-800 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                {title}
            </h3>
            <ul className="space-y-2">
                {points.map((point, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-indigo-500 mt-1">•</span>
                        {point}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MistakeCard({ mistake, cost, solution }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{mistake}</h3>
            <p className="text-red-600 dark:text-red-400 font-bold text-sm mb-2">Average Loss: {cost}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Solution:</strong> {solution}
            </p>
        </div>
    );
}

function WinningTrait({ trait, example, why }) {
    return (
        <div className="bg-white dark:bg-forest-900/40 rounded-xl p-4 border-l-4 border-green-500">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{trait}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Example:</strong> {example}
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
                <strong>Why it works:</strong> {why}
            </p>
        </div>
    );
}
