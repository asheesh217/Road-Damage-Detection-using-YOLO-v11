import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Video, Image, Upload, Loader2, Search, X } from 'lucide-react';
import anime from 'animejs';
import { uploadImage, uploadVideo, getImageUrl } from '../services/api';
import VideoTimeline from './VideoTimeline';

const SEVERITY_COLORS = {
    High: { border: '#ef4444', bg: 'bg-red-50/70 border-red-200 dark:bg-red-950/20 dark:border-red-900/50', text: 'text-red-500 dark:text-red-400', badge: 'bg-red-500 text-white shadow-sm font-semibold' },
    Medium: { border: '#f59e0b', bg: 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500 text-white shadow-sm font-semibold' },
    Low: { border: '#10b981', bg: 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500 text-white shadow-sm font-semibold' },
    None: { border: '#64748b', bg: 'bg-slate-50/70 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-500 text-white shadow-sm font-semibold' }
};

const MODES = [
    { id: 'image', label: 'Image', icon: Image },
    { id: 'video', label: 'Video', icon: Video },
];

const AnalysisOverlay = ({ progress, mode }) => {
    const [statusText, setStatusText] = useState('Initializing scan...');
    const [subText, setSubText] = useState('Establishing neural link');
    const canvasRef = useRef(null);

    useEffect(() => {
        if (progress < 20) {
            setStatusText('Initializing YOLO11 Engine...');
            setSubText('Loading convolutional weights & tensor configs');
        } else if (progress < 45) {
            setStatusText('Analyzing surface textures...');
            setSubText('Extracting high-frequency spatial gradients');
        } else if (progress < 70) {
            setStatusText('Detecting structural anomalies...');
            setSubText('Locking onto cracks, potholes, and deformation zones');
        } else if (progress < 90) {
            setStatusText('Executing severity classifier...');
            setSubText('Calculating defect depth & confidence values');
        } else {
            setStatusText('Finalizing report registry...');
            setSubText('Saving inspection metadata & syncing cloud assets');
        }
    }, [progress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth || 500;
            canvas.height = canvas.parentElement.offsetHeight || 400;
        };
        resize();
        window.addEventListener('resize', resize);

        // Gibberish characters, alphabets & symbols
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,./<>?~¥$&+*§#@';
        
        // Font size and columns configuration
        const fontSize = 12;
        const columns = Math.floor(canvas.width / 15) + 1;
        
        // Active falling streams
        const streams = Array(columns).fill(0).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            speed: 1.0 + Math.random() * 2.0,
            char: chars[Math.floor(Math.random() * chars.length)],
            opacity: 0.08 + Math.random() * 0.25
        }));

        const draw = () => {
            // Dark transparent background trailing
            ctx.fillStyle = 'rgba(15, 23, 42, 0.08)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            streams.forEach((stream) => {
                ctx.font = `500 ${fontSize}px monospace`;
                ctx.fillStyle = `rgba(6, 182, 212, ${stream.opacity})`; // Neon Cyan
                
                // Draw current character
                ctx.fillText(stream.char, stream.x, stream.y);
                
                // Move down
                stream.y += stream.speed;

                // Mutate character slightly as it falls
                if (Math.random() > 0.95) {
                    stream.char = chars[Math.floor(Math.random() * chars.length)];
                }

                // Reset stream to top with new position when it goes off screen
                if (stream.y > canvas.height) {
                    stream.y = Math.random() * -50 - 20;
                    stream.x = Math.random() * canvas.width;
                    stream.char = chars[Math.floor(Math.random() * chars.length)];
                    stream.speed = 1.0 + Math.random() * 2.0;
                    stream.opacity = 0.08 + Math.random() * 0.25;
                }
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
            {/* Falling Gibberish Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

            {/* Corner brackets */}
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-accent-cyan/60 rounded-tl-lg animate-pulse z-10" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-accent-cyan/60 rounded-tr-lg animate-pulse z-10" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-accent-cyan/60 rounded-bl-lg animate-pulse z-10" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-accent-cyan/60 rounded-br-lg animate-pulse z-10" />

            {/* Rotating futuristic HUD circles */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6 z-10">
                <div className="absolute inset-0 border border-dashed border-accent-blue/30 rounded-full animate-spin" style={{ animationDuration: '12s' }} />
                <div className="absolute inset-2 border border-dotted border-accent-cyan/40 rounded-full animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
                <div className="absolute inset-6 border border-accent-blue/20 rounded-full flex items-center justify-center">
                    <Loader2 size={28} className="animate-spin text-accent-cyan" />
                </div>
            </div>

            {/* AI HUD text fields */}
            <div className="text-center max-w-sm z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 mb-3 text-[10px] font-bold text-accent-cyan tracking-wider uppercase animate-pulse">
                    AI Scan Active
                </div>
                <h4 className="text-white font-semibold text-sm mb-1 tracking-tight font-sans">
                    {statusText}
                </h4>
                <p className="text-slate-400 text-[11px] font-mono mb-6 leading-relaxed min-h-[32px] px-4">
                    {subText}
                </p>
            </div>

            {/* Custom progress loading bar */}
            <div className="w-64 z-10">
                <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-widest font-semibold">Progress</span>
                    <span className="text-xs font-mono text-white font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-slate-800/80 rounded-full p-0.5 border border-slate-700/50 overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-gradient-to-r from-accent-blue via-accent-cyan to-blue-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        style={{ width: `${Math.min(progress, 100)}%` }} 
                    />
                </div>
            </div>
        </div>
    );
};

const VideoPlayer = ({
    latestEvent,
    onMediaStateChange,
    onAnalysisComplete,
    activeMode,
    onModeChange,
    onReset,
    uploadedSrc,
    setUploadedSrc,
    uploadedFile,
    setUploadedFile,
    fileName,
    setFileName,
    analysisState,
    setAnalysisState,
    analysisResults,
    setAnalysisResults,
    analysisProgress,
    setAnalysisProgress,
    analysisTime,
    setAnalysisTime,
    imageLoaded,
    setImageLoaded
}) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const imageContainerRef = useRef(null);
    const mediaRef = useRef(null);
    const boxTimeoutRef = useRef(null);
    const laserRef = useRef(null);
    const fileInputRef = useRef(null);

    const [localMode, setLocalMode] = useState('image');
    const mode = activeMode || localMode;
    const setMode = onModeChange || setLocalMode;

    const [sliderPos, setSliderPos] = useState(50);
    const sliderRef = useRef(null);

    const handleSliderMove = useCallback((clientX) => {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pct);
    }, []);

    const handleMouseMove = (e) => {
        if (e.buttons === 1) {
            handleSliderMove(e.clientX);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches && e.touches[0]) {
            handleSliderMove(e.touches[0].clientX);
        }
    };

    // ── Notify parent when media is active ──
    useEffect(() => {
        const isActive = mode !== 'image' && uploadedSrc !== null;
        onMediaStateChange?.(isActive);
    }, [mode, uploadedSrc, onMediaStateChange]);



    // ── Draw bounding boxes for live detection (camera/video mode) ──
    useEffect(() => {
        if (mode === 'image') return; // Image mode uses its own drawing
        if (!latestEvent || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        const [xPct, yPct, wPct, hPct] = latestEvent.bbox;
        const x = (xPct / 100) * canvas.width;
        const y = (yPct / 100) * canvas.height;
        const w = (wPct / 100) * canvas.width;
        const h = (hPct / 100) * canvas.height;
        const color = SEVERITY_COLORS[latestEvent.severity]?.border || '#3b82f6';

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = color + '18';
        ctx.fillRect(x, y, w, h);

        const cornerLen = 10;
        ctx.lineWidth = 3;
        [[x, y, x + cornerLen, y, x, y + cornerLen],
         [x + w - cornerLen, y, x + w, y, x + w, y + cornerLen],
         [x, y + h - cornerLen, x, y + h, x + cornerLen, y + h],
         [x + w - cornerLen, y + h, x + w, y + h, x + w, y + h - cornerLen]
        ].forEach(([mx, my, lx1, ly1, lx2, ly2]) => {
            ctx.beginPath();
            ctx.moveTo(mx, my); ctx.lineTo(lx1, ly1);
            ctx.moveTo(lx1 === mx ? lx2 : lx1, ly1 === my ? ly2 : ly1);
            ctx.lineTo(lx2, ly2);
            ctx.stroke();
        });

        const label = `${latestEvent.type} ${(latestEvent.confidence * 100).toFixed(0)}%`;
        ctx.font = '600 13px Inter, sans-serif';
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 22, textWidth + 12, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 4, y - 7);

        if (boxTimeoutRef.current) clearTimeout(boxTimeoutRef.current);
        boxTimeoutRef.current = setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 2500);
        return () => { if (boxTimeoutRef.current) clearTimeout(boxTimeoutRef.current); };
    }, [latestEvent, mode]);

    // ── Draw bounding boxes on image after analysis ──
    const drawImageBoxes = useCallback(() => {
        if (!analysisResults || !imageContainerRef.current) return;

        const canvas = imageContainerRef.current;
        const imgEl = canvas.parentElement?.querySelector('img');
        if (!imgEl) return;

        const ctx = canvas.getContext('2d');
        canvas.width = imgEl.offsetWidth;
        canvas.height = imgEl.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imgW = analysisResults.image_width || imgEl.naturalWidth || 640;
        const imgH = analysisResults.image_height || imgEl.naturalHeight || 480;

        // Correctly account for object-contain letterboxing/pillarboxing
        const imgRatio = imgW / imgH;
        const containerRatio = canvas.width / canvas.height;

        let displayWidth, displayHeight;
        let offsetX = 0, offsetY = 0;

        if (imgRatio > containerRatio) {
            // Image is wider than container (letterboxed top/bottom)
            displayWidth = canvas.width;
            displayHeight = canvas.width / imgRatio;
            offsetY = (canvas.height - displayHeight) / 2;
        } else {
            // Image is taller than container (pillarboxed left/right)
            displayHeight = canvas.height;
            displayWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - displayWidth) / 2;
        }

        analysisResults.detected_issues.forEach((issue) => {
            const [bx, by, bw, bh] = issue.bbox;
            // Since bbox coordinates are percentages (0 to 100), map them to display area
            const x = offsetX + (bx / 100) * displayWidth;
            const y = offsetY + (by / 100) * displayHeight;
            const w = (bw / 100) * displayWidth;
            const h = (bh / 100) * displayHeight;
            const color = SEVERITY_COLORS[issue.severity]?.border || '#3b82f6';

            // Box
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = color + '18';
            ctx.fillRect(x, y, w, h);

            // Corner brackets
            const cl = 10;
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y + cl); ctx.lineTo(x, y); ctx.lineTo(x + cl, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + w - cl, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cl);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + h - cl); ctx.lineTo(x, y + h); ctx.lineTo(x + cl, y + h);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + w - cl, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cl);
            ctx.stroke();

            // Label
            const label = `${issue.type} ${(issue.confidence * 100).toFixed(0)}%`;
            ctx.font = '600 12px Inter, sans-serif';
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y - 20, tw + 10, 18, 3);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.fillText(label, x + 5, y - 6);
        });
    }, [analysisResults]);

    useEffect(() => {
        if (analysisState === 'done' && imageLoaded) {
            // Small delay to ensure DOM is painted
            const timer = setTimeout(() => drawImageBoxes(), 100);
            return () => clearTimeout(timer);
        }
    }, [analysisState, imageLoaded, drawImageBoxes]);

    // ── Live Video Tracking ──
    const handleTimeUpdate = () => {
        if (mode !== 'video' || analysisState !== 'done' || !analysisResults || !analysisResults.timeline) return;
        if (!canvasRef.current || !mediaRef.current) return;

        const currentTime = mediaRef.current.currentTime;
        
        // Find the absolute closest frame in the timeline
        let closestFrame = null;
        let minDiff = Infinity;
        
        analysisResults.timeline.forEach(f => {
            const diff = Math.abs(f.timestamp - currentTime);
            if (diff < minDiff) {
                minDiff = diff;
                closestFrame = f;
            }
        });

        // Use the closest frame if it is within 0.25 seconds (since frames are spaced 0.20s apart)
        const frame = (minDiff < 0.25) ? closestFrame : null;

        const canvas = canvasRef.current;
        const videoEl = mediaRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = videoEl.offsetWidth;
        canvas.height = videoEl.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!frame || frame.detected_issues.length === 0) return;

        // Correctly account for object-contain letterboxing/pillarboxing in video
        const videoW = videoEl.videoWidth || canvas.width;
        const videoH = videoEl.videoHeight || canvas.height;
        const videoRatio = videoW / videoH;
        const containerRatio = canvas.width / canvas.height;

        let displayWidth, displayHeight;
        let offsetX = 0, offsetY = 0;

        if (videoRatio > containerRatio) {
            // Video is wider than container (letterboxed top/bottom)
            displayWidth = canvas.width;
            displayHeight = canvas.width / videoRatio;
            offsetY = (canvas.height - displayHeight) / 2;
        } else {
            // Video is taller than container (pillarboxed left/right)
            displayHeight = canvas.height;
            displayWidth = canvas.height * videoRatio;
            offsetX = (canvas.width - displayWidth) / 2;
        }

        frame.detected_issues.forEach(issue => {
            const [xPct, yPct, wPct, hPct] = issue.bbox;
            const x = offsetX + (xPct / 100) * displayWidth;
            const y = offsetY + (yPct / 100) * displayHeight;
            const w = (wPct / 100) * displayWidth;
            const h = (hPct / 100) * displayHeight;
            const color = SEVERITY_COLORS[issue.severity]?.border || '#3b82f6';

            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = color + '18';
            ctx.fillRect(x, y, w, h);

            const label = `${issue.type} ${(issue.confidence * 100).toFixed(0)}%`;
            ctx.font = '600 13px Inter, sans-serif';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 22, textWidth + 12, 20, 4);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, x + 4, y - 7);
        });
    };

    // ── Mode switch ──
    const switchMode = (newMode) => {
        setUploadedSrc(null);
        setUploadedFile(null);
        setFileName('');
        setAnalysisState('idle');
        setAnalysisResults(null);
        setAnalysisProgress(0);
        setAnalysisTime(0);
        setImageLoaded(false);
        setMode(newMode);
        onReset?.();
    };

    // ── File upload ──
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setUploadedSrc(URL.createObjectURL(file));
        setUploadedFile(file);
        setAnalysisState('idle');
        setImageLoaded(false);
        setAnalysisResults(null);
        onReset?.();
    };

    // ── Analyze media via backend ──
    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setAnalysisState('analyzing');
        setAnalysisProgress(0);
        const startTime = Date.now();

        // Simulate progress bar while waiting for backend
        const progressInterval = setInterval(() => {
            setAnalysisProgress((prev) => {
                if (prev >= 95) { clearInterval(progressInterval); return 95; }
                return prev + Math.random() * 8;
            });
        }, 800);

        try {
            let response;
            if (mode === 'video') {
                response = await uploadVideo(uploadedFile);
            } else {
                response = await uploadImage(uploadedFile);
            }
            
            clearInterval(progressInterval);
            setAnalysisProgress(100);
            setAnalysisTime(((Date.now() - startTime) / 1000).toFixed(2));

            if (response.success && response.data) {
                setAnalysisResults(response.data);
                if (onAnalysisComplete) {
                    onAnalysisComplete(response.data);
                }
                setTimeout(() => setAnalysisState('done'), 400);
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            clearInterval(progressInterval);
            console.error('Analysis failed:', error);
            setAnalysisState('idle');
            alert(`Analysis failed: ${error.message}`);
        }
    };

    // ── New upload reset ──
    const handleNewUpload = () => {
        setUploadedSrc(null);
        setUploadedFile(null);
        setFileName('');
        setAnalysisState('idle');
        setAnalysisResults(null);
        setAnalysisProgress(0);
        setAnalysisTime(0);
        setImageLoaded(false);
        onReset?.();
    };

    // ── Render content ──
    const renderContent = () => {
        // ── VIDEO MODE ──
        if (mode === 'video') {
            if (!uploadedSrc) {
                return (
                    <label className="flex flex-col items-center justify-center h-full gap-5 cursor-pointer m-4 border-2 border-dashed border-slate-200 hover:border-blue-400/70 hover:bg-blue-50/20 rounded-2xl transition-all duration-300 p-8 group">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-inner transition-transform group-hover:scale-105">
                            <Upload size={32} className="text-accent-blue" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-700 text-sm font-semibold">Upload Road Video</p>
                            <p className="text-xs text-slate-400 mt-1">Drag and drop or click to select video</p>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200/50">
                            MP4, AVI, MOV supported
                        </span>
                        <input type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                );
            }
            return (
                <div className="flex flex-col h-full w-full">
                    {/* Video Player overlay */}
                    <div className="relative flex-1 min-h-0 bg-black">
                        <video ref={mediaRef} src={uploadedSrc} onTimeUpdate={handleTimeUpdate} controls className="w-full h-full object-contain" />
                        
                        {/* Live Bounding Boxes Canvas */}
                        {analysisState === 'done' && (
                            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />
                        )}

                        {/* Close button */}
                        {analysisState !== 'analyzing' && (
                            <button onClick={handleNewUpload}
                                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all border border-slate-200 shadow-sm text-slate-500">
                                <X size={16} />
                            </button>
                        )}

                        {/* Loading overlay */}
                        {analysisState === 'analyzing' && (
                            <AnalysisOverlay progress={analysisProgress} mode="video" />
                        )}
                    </div>

                    {/* Bottom bar — Analyze */}
                    {analysisState === 'idle' && (
                        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <button onClick={handleAnalyze}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all btn-interactive shadow-md shadow-blue-500/20">
                                <Search size={16} />
                                Analyze Video
                            </button>
                            <button onClick={handleNewUpload}
                                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-all border border-slate-200 dark:border-slate-700 btn-interactive">
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        // ── IMAGE MODE ──
        if (mode === 'image') {
            // Empty state — upload prompt
            if (!uploadedSrc) {
                return (
                    <label className="flex flex-col items-center justify-center h-full gap-5 cursor-pointer m-4 border-2 border-dashed border-slate-200 hover:border-blue-400/70 hover:bg-blue-50/20 rounded-2xl transition-all duration-300 p-8 group">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center shadow-inner transition-transform group-hover:scale-105">
                            <Upload size={32} className="text-accent-blue" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-700 text-sm font-semibold">Upload Road Image</p>
                            <p className="text-xs text-slate-400 mt-1">Drag and drop or click to select image</p>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200/50">
                            JPG, PNG, WEBP supported
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                );
            }

            const showSlider = analysisState === 'done' && analysisResults;

            return (
                <div className="flex flex-col h-full">
                    {/* Image + Canvas overlay */}
                    <div 
                        ref={sliderRef}
                        className="relative flex-1 min-h-0 select-none overflow-hidden bg-slate-950/20"
                        onMouseMove={handleMouseMove}
                        onTouchMove={handleTouchMove}
                        onClick={(e) => handleSliderMove(e.clientX)}
                    >
                        {/* Underneath (Plain Raw Image) */}
                        <img src={uploadedSrc} alt="Upload Raw" className="w-full h-full object-contain pointer-events-none" />
                        
                        {/* On Top (Clipped Annotated Image + Canvas) */}
                        <div 
                            className="absolute inset-0 pointer-events-none overflow-hidden"
                            style={{ clipPath: showSlider ? `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` : 'none' }}
                        >
                            <img src={uploadedSrc} alt="Upload Annotated" className="w-full h-full object-contain pointer-events-none"
                                 onLoad={() => setImageLoaded(true)} />
                            <canvas ref={imageContainerRef}
                                className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" />
                        </div>

                        {/* Slider bar & handle */}
                        {showSlider && (
                            <>
                                <div 
                                    className="absolute top-0 bottom-0 w-[2px] bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                                    style={{ left: `${sliderPos}%` }}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 border border-white text-white flex items-center justify-center shadow-lg font-bold font-mono text-xs select-none cursor-ew-resize">
                                        ↔
                                    </div>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 select-none pointer-events-none z-20">
                                    AI DETECTIONS
                                </div>
                                <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 select-none pointer-events-none z-20">
                                    RAW SURFACE
                                </div>
                            </>
                        )}

                        {/* Close button */}
                        {analysisState !== 'analyzing' && (
                            <button onClick={handleNewUpload}
                                className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 flex items-center justify-center transition-all border border-white/10">
                                <X size={16} />
                            </button>
                        )}

                        {/* Loading overlay */}
                        {analysisState === 'analyzing' && (
                            <AnalysisOverlay progress={analysisProgress} mode="image" />
                        )}
                    </div>

                    {/* Bottom bar — Analyze / Results */}
                    {analysisState === 'idle' && (
                        <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                            <button onClick={handleAnalyze}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-blue hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all btn-interactive shadow-md shadow-blue-500/20">
                                <Search size={16} />
                                Analyze Image
                            </button>
                            <button onClick={handleNewUpload}
                                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-all border border-slate-200 dark:border-slate-700 btn-interactive">
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Results panel */}
                    {analysisState === 'done' && analysisResults && (
                        <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[160px] flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="text-xs font-mono text-accent-cyan uppercase tracking-wider">Analysis Complete</span>
                                    <h3 className="text-lg font-semibold text-mission-100 dark:text-slate-100">Detection Results</h3>
                                </div>
                                <span className="text-xs font-mono text-mission-400 dark:text-slate-400">Processed in {analysisTime}s</span>
                            </div>

                            {/* Issue cards */}
                            {analysisResults.detected_issues.length === 0 ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-detect-safe/10 border border-detect-safe/20">
                                    <span className="text-detect-safe text-sm font-medium">✓ No damage detected</span>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {analysisResults.detected_issues.map((issue, idx) => {
                                        const colors = SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.Low;
                                        return (
                                            <div key={idx}
                                                className={`flex items-center gap-3 p-3 rounded-lg ${colors.bg} border min-w-[200px]`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm text-mission-100 dark:text-slate-100">{issue.type}</span>
                                                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                                                            {issue.severity === 'High' ? 'critical' : issue.severity.toLowerCase()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-mission-300 dark:text-slate-400">Confidence</span>
                                                        <span className={`text-xs font-bold ${colors.text}`}>{(issue.confidence * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full h-1 bg-slate-200/40 rounded-full mt-1 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000"
                                                            style={{ width: `${issue.confidence * 100}%`, backgroundColor: colors.border }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <>
            <div className={`glass-panel overflow-hidden relative flex flex-col ${analysisState === 'done' ? 'min-h-[380px]' : 'lg:h-[calc(100vh-230px)] min-h-[380px]'}`} ref={containerRef}>
                {/* Header tabs */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
                    <div className="flex gap-1">
                        {MODES.map((m) => {
                            const Icon = m.icon;
                            const isActive = mode === m.id;
                            return (
                                <button key={m.id} onClick={() => switchMode(m.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        isActive ? 'bg-blue-50 text-accent-blue border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
                                                 : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}>
                                    <Icon size={14} />
                                    {m.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-3">
                        {fileName && <span className="text-xs text-mission-300 dark:text-slate-400 font-mono truncate max-w-[150px]">{fileName}</span>}
                        {uploadedSrc && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex-shrink-0"
                                >
                                    <Upload size={12} />
                                    Upload New
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept={mode === 'video' ? 'video/*' : 'image/*'}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Media area */}
                <div className={`relative flex flex-col ${analysisState === 'done' ? (mode === 'video' ? 'h-[400px] flex-shrink-0' : 'h-[640px] flex-shrink-0') : 'flex-grow flex-1 min-h-0'}`}>
                    {renderContent()}
                </div>
            </div>

            {/* Frame-by-Frame Results for Video */}
            {mode === 'video' && analysisState === 'done' && analysisResults && (
                <VideoTimeline results={analysisResults} onReset={handleNewUpload} />
            )}
        </>
    );
};

export default VideoPlayer;
