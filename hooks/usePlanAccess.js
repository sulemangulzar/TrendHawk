/**
 * Custom Hook: usePlanAccess
 * Provides plan-based feature access control throughout the app
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function usePlanAccess() {
    const { user } = useAuth();
    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchPlanData();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPlanData = async () => {
        try {
            const response = await fetch(`/api/plan-limits?userId=${user.id}`);
            const data = await response.json();
            setPlanData(data);
        } catch (error) {
            console.error('Failed to fetch plan data:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Check if user can access a specific feature
     */
    const canAccessFeature = (feature) => {
        if (!planData) return false;

        const featureMap = {
            // Basic features
            'basic_analysis': true,
            'shortlist': true,
            'profit_calculator': true,

            // Pro-only features
            'unlimited_analysis': planData.plan === 'pro',
            'advanced_scenarios': planData.plan === 'pro',
            'live_tests': planData.plan === 'pro',
            'export_csv': planData.plan === 'pro',
            'api_access': planData.plan === 'pro',
            'priority_support': planData.plan === 'pro',
        };

        return featureMap[feature] || false;
    };

    /**
     * Check if user has reached their limits
     */
    const hasReachedLimit = () => {
        if (!planData || !planData.usage) return false;
        return !planData.usage.canSearch;
    };

    /**
     * Get remaining searches for current month
     */
    const getRemainingSearches = () => {
        if (!planData || !planData.usage) return 0;
        return planData.usage.searchesRemaining;
    };

    /**
     * Check if user is on a specific plan
     */
    const isPlan = (planName) => {
        return planData?.plan === planName;
    };

    /**
     * Get upgrade message for locked features
     */
    const getUpgradeMessage = (feature) => {
        const messages = {
            'unlimited_analysis': 'Upgrade to Pro for unlimited product analyses',
            'advanced_scenarios': 'Unlock advanced profit scenarios with Pro',
            'live_tests': 'Track unlimited live tests with Pro plan',
            'export_csv': 'Export your data with Pro plan',
            'api_access': 'Get API access with Pro plan',
            'priority_support': 'Get priority support with Pro plan',
        };

        return messages[feature] || 'Upgrade to Pro to unlock this feature';
    };

    return {
        plan: planData?.plan || 'basic',
        limits: planData?.limits,
        usage: planData?.usage,
        loading,
        canAccessFeature,
        hasReachedLimit,
        getRemainingSearches,
        isPlan,
        getUpgradeMessage,
        refresh: fetchPlanData,
    };
}
