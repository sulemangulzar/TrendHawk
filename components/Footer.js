import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-forest-950 via-forest-900 to-black border-t border-forest-800 font-poppins">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-500/20">
                                <span className="text-2xl font-black text-forest-950">T</span>
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-lime-400 to-lime-600 bg-clip-text text-transparent">
                                TrendHawk
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Discover trending products across multiple platforms. Make data-driven decisions with powerful analytics and insights.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { icon: Facebook, href: '#' },
                                { icon: Twitter, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Linkedin, href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 bg-forest-800/50 hover:bg-lime-500/10 border border-forest-700 hover:border-lime-500/30 rounded-xl flex items-center justify-center transition-all duration-300 group"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <social.icon className="w-4 h-4 text-gray-400 group-hover:text-lime-400 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Product</h3>
                        <ul className="space-y-4">
                            {['Features', 'Pricing', 'Dashboard', 'Analytics', 'Saved Products', 'API Access'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-gray-400 hover:text-lime-400 transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-lime-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Company</h3>
                        <ul className="space-y-4">
                            {['About Us', 'Blog', 'Careers', 'Press Kit', 'Partners', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-gray-400 hover:text-lime-400 transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1 h-1 bg-lime-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm">
                                <Mail className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Email us at</p>
                                    <a href="mailto:hello@trendhawk.com" className="text-white hover:text-lime-400 transition-colors">
                                        hello@trendhawk.com
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Phone className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Call us</p>
                                    <a href="tel:+1234567890" className="text-white hover:text-lime-400 transition-colors">
                                        +1 (234) 567-890
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <MapPin className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-400">Visit us</p>
                                    <p className="text-white">San Francisco, CA</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-forest-800">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm">
                            © {currentYear} TrendHawk. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="#" className="text-gray-500 hover:text-lime-400 transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="#" className="text-gray-500 hover:text-lime-400 transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="#" className="text-gray-500 hover:text-lime-400 transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
        </footer>
    );
}
