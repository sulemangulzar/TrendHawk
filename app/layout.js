// Forced reload for candidate fix - 2025-12-31
import { Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = {
  title: 'TrendHawk - Professional E-commerce Product Research',
  description: 'Find winning products across Amazon, eBay, and more. Use AI-driven analytics, profit simulators, and daily action plans to scale your e-commerce business.',
  keywords: ['dropshipping', 'product research', 'ecommerce', 'amazon trends', 'ebay analytics', 'winning products'],
  authors: [{ name: 'TrendHawk Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'TrendHawk - Find Winning Products Before They Go Viral',
    description: 'Professional product research for e-commerce sellers.',
    url: 'https://trendhawk.com',
    siteName: 'TrendHawk',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
