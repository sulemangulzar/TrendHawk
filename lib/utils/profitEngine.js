// Profit & Risk Engine
// Calculates net profit and risk of ruin for products

export class ProfitEngine {
    constructor() {
        this.realisticSalesLimit = 100; // Configurable based on user's test budget
    }

    /**
     * Calculate net profit per sale
     * @param {Object} inputs - User and market inputs
     * @returns {Object} Profit calculation results
     */
    calculateNetProfit(inputs) {
        const {
            sellingPrice,
            productCost,
            shippingCost = 0,
            adCostPerSale = 0,
            returnRate = 0.05, // Default 5%
        } = inputs;

        // Core profit formula
        const returnCost = returnRate * sellingPrice;
        const netProfit = sellingPrice - productCost - shippingCost - adCostPerSale - returnCost;
        const profitMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

        return {
            netProfit: parseFloat(netProfit.toFixed(2)),
            profitMargin: parseFloat(profitMargin.toFixed(2)),
            breakEvenPrice: productCost + shippingCost + adCostPerSale + returnCost
        };
    }

    /**
     * Calculate risk of ruin
     * @param {Object} inputs - Test budget and profit data
     * @returns {Object} Risk assessment
     */
    calculateRiskOfRuin(inputs) {
        const {
            fixedTestBudget,
            netProfit,
            probabilityOfSale = 0.5 // Default 50% conversion
        } = inputs;

        // Risk of Ruin calculation
        if (netProfit <= 0) {
            return {
                riskLevel: 'Guaranteed Failure',
                reason: 'Net profit is zero or negative',
                breakEvenSales: Infinity,
                shouldTest: false
            };
        }

        const breakEvenSales = Math.ceil(fixedTestBudget / netProfit);

        // Determine risk level
        let riskLevel, shouldTest, reason;

        if (breakEvenSales > this.realisticSalesLimit) {
            riskLevel = 'High Risk';
            shouldTest = false;
            reason = `Need ${breakEvenSales} sales to break even (unrealistic)`;
        } else if (breakEvenSales > this.realisticSalesLimit * 0.7) {
            riskLevel = 'Medium Risk';
            shouldTest = netProfit > 5; // Only if profit > $5
            reason = `Need ${breakEvenSales} sales to break even (challenging)`;
        } else {
            riskLevel = 'Low Risk';
            shouldTest = true;
            reason = `Need only ${breakEvenSales} sales to break even`;
        }

        return {
            riskLevel,
            shouldTest,
            reason,
            breakEvenSales,
            expectedROI: ((netProfit * breakEvenSales) - fixedTestBudget) / fixedTestBudget * 100
        };
    }

    /**
     * Calculate live test ROI
     * @param {Object} testData - Live test metrics
     * @returns {Object} ROI and recommendation
     */
    calculateLiveTestROI(testData) {
        const {
            totalSpent,
            salesCount,
            avgProfitPerSale = 30,
            daysLive
        } = testData;

        const revenue = salesCount * avgProfitPerSale;
        const roi = totalSpent > 0 ? ((revenue - totalSpent) / totalSpent) * 100 : 0;

        // Scale/Kill Rules
        let recommendation, reason;

        // Rule 1: Kill - No sales after 3 days
        if (daysLive >= 3 && salesCount === 0) {
            recommendation = 'kill';
            reason = 'No sales after 3 days';
        }
        // Rule 2: Kill - ROI < -30% after 5 days
        else if (roi < -30 && daysLive >= 5) {
            recommendation = 'kill';
            reason = 'ROI below -30% after 5 days';
        }
        // Rule 3: Scale - ROI > 30%
        else if (roi > 30) {
            recommendation = 'scale';
            reason = `Profitable with ${roi.toFixed(1)}% ROI`;
        }
        // Rule 4: Monitor
        else {
            recommendation = 'monitor';
            reason = 'Continue testing';
        }

        return {
            roi: parseFloat(roi.toFixed(2)),
            revenue,
            netProfit: revenue - totalSpent,
            recommendation,
            reason
        };
    }

    /**
     * Calculate profit scenarios (Bull/Base/Bear)
     * @param {Object} inputs - Base product data
     * @returns {Object} Three scenario calculations
     */
    calculateScenarios(inputs) {
        // Bull case: Best assumptions
        const bullCase = this.calculateNetProfit({
            ...inputs,
            sellingPrice: inputs.sellingPrice * 1.2,
            adCostPerSale: inputs.adCostPerSale * 0.8,
            returnRate: 0.03
        });

        // Base case: Realistic assumptions
        const baseCase = this.calculateNetProfit(inputs);

        // Bear case: Worst assumptions
        const bearCase = this.calculateNetProfit({
            ...inputs,
            sellingPrice: inputs.sellingPrice * 0.9,
            adCostPerSale: inputs.adCostPerSale * 1.2,
            returnRate: 0.08,
            shippingCost: (inputs.shippingCost || 0) * 1.1
        });

        return {
            bull: bullCase,
            base: baseCase,
            bear: bearCase
        };
    }

    /**
     * Money saved calculation when killing a test early
     * @param {Object} testData - Test budget and spending
     * @returns {number} Money saved
     */
    calculateMoneySaved(testData) {
        const {
            plannedBudget,
            totalSpent
        } = testData;

        return Math.max(0, plannedBudget - totalSpent);
    }
}

export default ProfitEngine;
