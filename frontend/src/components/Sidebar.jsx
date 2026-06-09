import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Database, Sun, Moon, Map } from 'lucide-react';

const Sidebar = ({ isConnected, darkMode, toggleDarkMode }) => {
    const location = useLocation();

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.location.reload();
        }
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/map', label: 'Live Map', icon: Map },
        { path: '/reports', label: 'Reports', icon: Database },
    ];

    return (
        <aside className="h-16 lg:h-full w-full lg:w-64 flex-shrink-0 flex lg:flex-col justify-between items-center lg:items-stretch bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-800 p-4 z-40 transition-all duration-300">
            {/* Logo Section */}
            <Link
                to="/"
                onClick={handleLogoClick}
                className="hidden lg:flex items-center gap-3 mb-8 px-2 hover:opacity-90 transition-all duration-200 group"
            >
                <div className="w-10 h-10 flex-shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-lg shadow-cyan-500/20 rounded-xl overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                            </linearGradient>
                            <linearGradient id="logoRoadGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#020617" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                            <linearGradient id="logoSweepGrad" x1="50" y1="-5" x2="85" y2="15" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
                            </linearGradient>
                            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Outer metallic panel */}
                        <rect x="1.5" y="1.5" width="97" height="97" rx="14" fill="url(#logoBgGrad)" stroke="#334155" strokeWidth="2" />
                        
                        {/* Cyan outer border glow */}
                        <rect x="1.5" y="1.5" width="97" height="97" rx="14" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />

                        {/* 5x5 Coordinate Grid */}
                        <g opacity="0.25">
                            {/* Vertical lines */}
                            <line x1="10" y1="10" x2="10" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="26" y1="10" x2="26" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="42" y1="10" x2="42" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="58" y1="10" x2="58" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="74" y1="10" x2="74" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="90" y1="10" x2="90" y2="90" stroke="#64748b" strokeWidth="0.75" />

                            {/* Horizontal lines */}
                            <line x1="10" y1="10" x2="90" y2="10" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="26" x2="90" y2="26" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="42" x2="90" y2="42" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="58" x2="90" y2="58" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="74" x2="90" y2="74" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#64748b" strokeWidth="0.75" />
                        </g>

                        {/* Concentric Radar Rings */}
                        <g opacity="0.6">
                            <circle cx="50" cy="35" r="14" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="1 2" />
                            <circle cx="50" cy="35" r="24" stroke="#22d3ee" strokeWidth="1.2" />
                            <circle cx="50" cy="35" r="34" stroke="#22d3ee" strokeWidth="1.2" />
                            <circle cx="50" cy="35" r="44" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" />
                        </g>

                        {/* Radar Sweep Wedge */}
                        <g className="animate-radar-sweep">
                            <path d="M 50 35 L 50 -5 A 40 40 0 0 1 85 15 Z" fill="url(#logoSweepGrad)" />
                            <line x1="50" y1="35" x2="85" y2="15" stroke="#22d3ee" strokeWidth="1.5" filter="url(#logoGlow)" />
                        </g>

                        {/* Road Polygon */}
                        <path d="M 22 90 L 45 35 H 55 L 78 90 Z" fill="url(#logoRoadGrad)" stroke="#475569" strokeWidth="1" />
                        
                        {/* Road White Border lines */}
                        <line x1="22" y1="90" x2="45" y2="35" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
                        <line x1="78" y1="90" x2="55" y2="35" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
                        
                        {/* Dashed Center lane */}
                        <line x1="50" y1="90" x2="50" y2="35" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 5" />

                        {/* Corner Brackets */}
                        {/* Top Left (Cyan) */}
                        <path d="M 10 22 V 10 H 22" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#logoGlow)" />
                        {/* Top Right (Cyan) */}
                        <path d="M 90 22 V 10 H 78" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#logoGlow)" />
                        {/* Bottom Left (White) */}
                        <path d="M 10 78 V 90 H 22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Bottom Right (White) */}
                        <path d="M 90 78 V 90 H 78" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-[15px] font-extrabold text-slate-800 dark:text-white tracking-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">StreetScan <span className="text-cyan-500">AI</span></h1>
                    <span className="text-[9px] text-slate-400 font-mono tracking-wider">v3.5</span>
                </div>
            </Link>

            {/* Mobile Brand / Logo (only on small viewports) */}
            <Link
                to="/"
                onClick={handleLogoClick}
                className="flex lg:hidden items-center gap-2 group hover:opacity-90 transition-all duration-200"
            >
                <div className="w-8 h-8 flex-shrink-0 group-hover:scale-105 transition-all duration-300 relative shadow-md shadow-cyan-500/20 rounded-lg overflow-hidden">
                    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="logoBgGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e293b" />
                                <stop offset="100%" stopColor="#0f172a" />
                            </linearGradient>
                            <linearGradient id="logoRoadGradMobile" x1="0%" y1="100%" x2="0%" y2="0%">
                                <stop offset="0%" stopColor="#020617" />
                                <stop offset="100%" stopColor="#1e293b" />
                            </linearGradient>
                            <linearGradient id="logoSweepGradMobile" x1="50" y1="-5" x2="85" y2="15" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
                            </linearGradient>
                            <filter id="logoGlowMobile" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Outer metallic panel */}
                        <rect x="1.5" y="1.5" width="97" height="97" rx="14" fill="url(#logoBgGradMobile)" stroke="#334155" strokeWidth="2" />
                        
                        {/* Cyan outer border glow */}
                        <rect x="1.5" y="1.5" width="97" height="97" rx="14" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />

                        {/* 5x5 Coordinate Grid */}
                        <g opacity="0.25">
                            {/* Vertical lines */}
                            <line x1="10" y1="10" x2="10" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="26" y1="10" x2="26" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="42" y1="10" x2="42" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="58" y1="10" x2="58" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="74" y1="10" x2="74" y2="90" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="90" y1="10" x2="90" y2="90" stroke="#64748b" strokeWidth="0.75" />

                            {/* Horizontal lines */}
                            <line x1="10" y1="10" x2="90" y2="10" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="26" x2="90" y2="26" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="42" x2="90" y2="42" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="58" x2="90" y2="58" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="74" x2="90" y2="74" stroke="#64748b" strokeWidth="0.75" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#64748b" strokeWidth="0.75" />
                        </g>

                        {/* Concentric Radar Rings */}
                        <g opacity="0.6">
                            <circle cx="50" cy="35" r="14" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="1 2" />
                            <circle cx="50" cy="35" r="24" stroke="#22d3ee" strokeWidth="1.2" />
                            <circle cx="50" cy="35" r="34" stroke="#22d3ee" strokeWidth="1.2" />
                            <circle cx="50" cy="35" r="44" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" />
                        </g>

                        {/* Radar Sweep Wedge */}
                        <g className="animate-radar-sweep">
                            <path d="M 50 35 L 50 -5 A 40 40 0 0 1 85 15 Z" fill="url(#logoSweepGradMobile)" />
                            <line x1="50" y1="35" x2="85" y2="15" stroke="#22d3ee" strokeWidth="1.5" filter="url(#logoGlowMobile)" />
                        </g>

                        {/* Road Polygon */}
                        <path d="M 22 90 L 45 35 H 55 L 78 90 Z" fill="url(#logoRoadGradMobile)" stroke="#475569" strokeWidth="1" />
                        
                        {/* Road White Border lines */}
                        <line x1="22" y1="90" x2="45" y2="35" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
                        <line x1="78" y1="90" x2="55" y2="35" stroke="#f8fafc" strokeWidth="1.5" opacity="0.9" />
                        
                        {/* Dashed Center lane */}
                        <line x1="50" y1="90" x2="50" y2="35" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 5" />

                        {/* Corner Brackets */}
                        {/* Top Left (Cyan) */}
                        <path d="M 10 22 V 10 H 22" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#logoGlowMobile)" />
                        {/* Top Right (Cyan) */}
                        <path d="M 90 22 V 10 H 78" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" filter="url(#logoGlowMobile)" />
                        {/* Bottom Left (White) */}
                        <path d="M 10 78 V 90 H 22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Bottom Right (White) */}
                        <path d="M 90 78 V 90 H 78" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">StreetScan <span className="text-cyan-500">AI</span></span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex lg:flex-col gap-1.5 flex-1 lg:flex-initial justify-center lg:justify-start px-2 lg:px-0">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={
                                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 btn-interactive relative overflow-hidden group ${
                                    isActive
                                        ? 'bg-blue-50 text-accent-blue border border-blue-100 shadow-sm shadow-blue-500/5 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
                                }`
                            }
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                            )}
                            <Icon size={16} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[6deg] ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                            <span className="hidden lg:inline">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions Section */}
            <div className="flex lg:flex-col gap-2 lg:mt-auto items-center lg:items-stretch w-auto lg:w-full">
                {/* Theme Toggle Button */}
                <button
                    onClick={toggleDarkMode}
                    className="flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-xl text-[11px] font-semibold tracking-wide transition-all duration-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 border border-slate-200/50 dark:border-slate-800 btn-interactive lg:mb-2 bg-white/50 dark:bg-slate-900/30"
                >
                    {darkMode ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-indigo-400" />}
                    <span className="hidden lg:inline">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                </button>

                {/* Connection Status indicator */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-detect-safe animate-pulse' : 'bg-red-400'}`} />
                    <span className="hidden lg:inline text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                        {isConnected ? 'Server Online' : 'Server Offline'}
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default React.memo(Sidebar);
