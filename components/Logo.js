"use client";
import React from 'react';

export default function Logo({ className = "w-12 h-12", iconOnly = false }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center shrink-0 ${className}`}>
                <img
                    src="/hawk-logo.png"
                    alt="TrendHawk Logo"
                    className="w-full h-full object-contain transition-all"
                    style={{
                        // Indigo color for primary branding
                        filter: 'brightness(0) saturate(100%) invert(32%) sepia(96%) saturate(2466%) hue-rotate(231deg) brightness(96%) contrast(101%)'
                    }}
                />
            </div>
            {!iconOnly && (
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    TrendHawk
                </span>
            )}
        </div>
    );
}
