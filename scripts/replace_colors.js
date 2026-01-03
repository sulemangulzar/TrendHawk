#!/usr/bin/env node

/**
 * Color Scheme Replacement Script
 * Replaces all lime color references with the new color palette:
 * - Primary: Indigo
 * - Success: Emerald  
 * - Warnings: Amber
 * - Errors: Red
 */

const fs = require('fs');
const path = require('path');

// Color mappings
const replacements = [
    // Primary colors (lime -> indigo)
    { from: /indigo-50/g, to: 'indigo-50' },
    { from: /indigo-100/g, to: 'indigo-100' },
    { from: /indigo-200/g, to: 'indigo-200' },
    { from: /indigo-300/g, to: 'indigo-300' },
    { from: /indigo-400/g, to: 'indigo-400' },
    { from: /indigo-500/g, to: 'indigo-500' },
    { from: /indigo-600/g, to: 'indigo-600' },
    { from: /indigo-700/g, to: 'indigo-700' },
    { from: /indigo-800/g, to: 'indigo-800' },
    { from: /indigo-900/g, to: 'indigo-900' },
    { from: /indigo-950/g, to: 'indigo-950' },

    // Text colors
    { from: /text-indigo-/g, to: 'text-indigo-' },

    // Background colors
    { from: /bg-indigo-/g, to: 'bg-indigo-' },

    // Border colors
    { from: /border-indigo-/g, to: 'border-indigo-' },

    // Ring colors
    { from: /ring-indigo-/g, to: 'ring-indigo-' },

    // Shadow colors
    { from: /shadow-indigo-/g, to: 'shadow-indigo-' },

    // Hover states
    { from: /hover:text-indigo-/g, to: 'hover:text-indigo-' },
    { from: /hover:bg-indigo-/g, to: 'hover:bg-indigo-' },
    { from: /hover:border-indigo-/g, to: 'hover:border-indigo-' },

    // Focus states
    { from: /focus:border-indigo-/g, to: 'focus:border-indigo-' },
    { from: /focus:ring-indigo-/g, to: 'focus:ring-indigo-' },

    // Dark mode
    { from: /dark:text-indigo-/g, to: 'dark:text-indigo-' },
    { from: /dark:bg-indigo-/g, to: 'dark:bg-indigo-' },
    { from: /dark:border-indigo-/g, to: 'dark:border-indigo-' },
    { from: /dark:hover:text-indigo-/g, to: 'dark:hover:text-indigo-' },
    { from: /dark:hover:bg-indigo-/g, to: 'dark:hover:bg-indigo-' },
];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
        if (content.match(from)) {
            content = content.replace(from, to);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        return true;
    }
    return false;
}

function processDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    let filesUpdated = 0;

    function walk(directory) {
        const files = fs.readdirSync(directory);

        files.forEach(file => {
            const filePath = path.join(directory, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules and .next
                if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                    walk(filePath);
                }
            } else if (extensions.some(ext => file.endsWith(ext))) {
                if (replaceInFile(filePath)) {
                    filesUpdated++;
                }
            }
        });
    }

    walk(dir);
    return filesUpdated;
}

// Run the replacement
const projectRoot = process.cwd();
console.log('🎨 Starting color scheme replacement...\n');
const updated = processDirectory(projectRoot);
console.log(`\n✨ Complete! Updated ${updated} files.`);
