import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Download, Upload } from 'lucide-react';

const VideoTimeline = ({ results, onReset }) => {
    const { frames_scanned, duration_seconds, damage_frames, worst_severity, peak_confidence, timeline } = results;
    
    // Default to the first frame with damage, or 0 if none
    const firstDamageFrameIdx = timeline?.findIndex(f => f.detected_issues.length > 0) || 0;
    const [activeFrameIdx, setActiveFrameIdx] = useState(Math.max(0, firstDamageFrameIdx));

    if (!timeline || timeline.length === 0) return null;

    const activeFrame = timeline[activeFrameIdx];

    const getSeverityColor = (sev) => {
        if (sev.toLowerCase() === 'high') return 'text-red-400 border-red-400/20 bg-red-400/10';
        if (sev.toLowerCase() === 'moderate' || sev.toLowerCase() === 'medium') return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
        return 'text-green-400 border-green-400/20 bg-green-400/10';
    };

    return (
        <div className="mt-8 animate-fade-in w-full">
            <p className="text-xs font-semibold tracking-widest text-[#00ff88] uppercase mb-1">
                Video Analysis Complete
            </p>
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Video Analysis Results</h2>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-4 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-2">Seconds Analyzed</p>
                    <p className="text-3xl font-bold text-accent-blue">
                        {duration_seconds !== undefined && duration_seconds !== null ? `${duration_seconds}s` : `${(frames_scanned / 5).toFixed(1)}s`}
                    </p>
                </div>
                <div className="glass-panel p-4 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-2">Damage Found</p>
                    <p className="text-3xl font-bold text-orange-500">{damage_frames}</p>
                </div>
                <div className="glass-panel p-4 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-2">Worst Severity</p>
                    <span className={`px-3 py-1 mt-1 rounded-full text-xs font-medium border ${getSeverityColor(worst_severity)}`}>
                        {worst_severity.toLowerCase()}
                    </span>
                </div>
                <div className="glass-panel p-4 flex flex-col items-center justify-center border border-slate-200">
                    <p className="text-[10px] text-slate-500 tracking-wider uppercase mb-2">Peak Confidence</p>
                    <p className="text-3xl font-bold text-cyan-500">{peak_confidence}%</p>
                </div>
            </div>

            {/* Timeline Selector */}
            <div className="mb-8">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-3">Detection Timeline</p>
                <div className="glass-panel p-3 border border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    {timeline.map((frame, idx) => {
                        const hasDamage = frame.detected_issues.length > 0;
                        const isActive = idx === activeFrameIdx;
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveFrameIdx(idx)}
                                className={`flex flex-col items-center justify-center min-w-[56px] h-[52px] rounded-lg transition-all duration-200 border
                                    ${isActive ? 'bg-accent-blue border-accent-blue shadow-md text-white' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:border-slate-600'}
                                `}
                            >
                                <span className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {frame.timestamp}s
                                </span>
                                {hasDamage ? (
                                    <AlertTriangle className={`w-3.5 h-3.5 mt-1 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                                ) : (
                                    <CheckCircle className={`w-3.5 h-3.5 mt-1 ${isActive ? 'text-white' : 'text-green-500'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Active Frame Details */}
            <div className="mb-8">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-widest uppercase mb-3">
                    Detection at {activeFrame.timestamp}s
                </p>
                
                {activeFrame.detected_issues.length === 0 ? (
                    <div className="glass-panel border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mb-3" />
                        <p className="text-slate-700 dark:text-slate-300 font-medium">No damage detected at this timestamp.</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">The road surface appears secure natively.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeFrame.detected_issues.map((issue, idx) => (
                            <div key={idx} className="glass-panel p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <h4 className="text-slate-800 dark:text-slate-100 font-bold">{issue.type}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getSeverityColor(issue.severity)}`}>
                                        {issue.severity}
                                    </span>
                                </div>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs text-mission-400">Confidence</span>
                                        <span className="text-sm font-bold text-accent-blue">{Math.round(issue.confidence * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-mission-900 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-accent-blue transition-all duration-1000" 
                                            style={{ width: `${Math.round(issue.confidence * 100)}%` }}
                                        />
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/60 p-2 rounded">
                                    bbox: [{issue.bbox.map(n => Math.round(n)).join(', ')}]
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoTimeline;
