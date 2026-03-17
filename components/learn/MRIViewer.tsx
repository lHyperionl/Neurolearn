"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Info,
    Maximize2,
    Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const MotionImage = motion(Image);

interface MRIViewerProps {
    images: string[];
}

const MRIViewer = ({ images }: MRIViewerProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [showAnnotations, setShowAnnotations] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
    }, []);

    const handleZoomIn = useCallback(
        () => setScale((prev) => Math.min(prev + 0.25, 3)),
        [],
    );
    const handleZoomOut = useCallback(
        () => setScale((prev) => Math.max(prev - 0.25, 0.5)),
        [],
    );
    const handleReset = useCallback(() => {
        setScale(1);
        setShowAnnotations(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch((err) => {
                console.error(
                    `Error attempting to enable fullscreen: ${err.message}`,
                );
            });
        } else {
            document.exitFullscreen();
        }
    }, []);

    const toolbarItems = useMemo(
        () => [
            { icon: ZoomIn, label: "Zoom In", onClick: handleZoomIn },
            { icon: ZoomOut, label: "Zoom Out", onClick: handleZoomOut },
            { icon: RotateCcw, label: "Reset View", onClick: handleReset },
            {
                icon: Info,
                label: showAnnotations
                    ? "Hide Annotations"
                    : "Show Annotations",
                onClick: () => setShowAnnotations(!showAnnotations),
                active: showAnnotations,
            },
            {
                icon: isFullscreen ? Minimize2 : Maximize2,
                label: isFullscreen ? "Exit Fullscreen" : "Fullscreen",
                onClick: () => toggleFullscreen(),
            },
        ],
        [
            showAnnotations,
            isFullscreen,
            handleZoomIn,
            handleZoomOut,
            handleReset,
            toggleFullscreen,
        ],
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-col gap-4 h-full",
                isFullscreen && "bg-[#0a0a0a] p-6",
            )}
        >
            <div className="flex items-center justify-between px-2">
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-500/70">
                    MRI Viewer // System Active
                </span>
                <div className="flex items-center gap-1">
                    {toolbarItems.map((item, index) => (
                        <Tooltip key={index}>
                            <TooltipTrigger
                                onClick={item.onClick}
                                className={cn(
                                    "h-8 w-8 flex items-center justify-center rounded-md transition-colors cursor-pointer",
                                    item.active
                                        ? "text-cyan-400 bg-cyan-400/20"
                                        : "text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10",
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                className="bg-slate-900 border-cyan-500/30 text-cyan-400"
                            >
                                <p className="text-xs font-mono">
                                    {item.label}
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 min-h-[400px] rounded-xl border border-cyan-500/20 bg-black overflow-hidden group">
                {/* Pulsing Ring Effect */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 border border-cyan-500/10 rounded-xl animate-pulse" />
                    <div className="absolute inset-4 border border-cyan-500/5 rounded-lg" />
                </div>

                {/* Scanline Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />

                {/* Main Image */}
                <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <MotionImage
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            alt="MRI Scan"
                            fill
                            className="object-contain grayscale contrast-125 p-8"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                scale: scale,
                                transition: {
                                    scale: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    },
                                    opacity: { duration: 0.3 },
                                },
                            }}
                            exit={{ opacity: 0, scale: 1.05 }}
                        />
                    </AnimatePresence>

                    {/* Mock Annotation Layer */}
                    <AnimatePresence>
                        {showAnnotations && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none z-20"
                            >
                                <svg
                                    className="w-full h-full"
                                    viewBox="0 0 100 100"
                                >
                                    <motion.circle
                                        cx="50"
                                        cy="45"
                                        r="8"
                                        fill="none"
                                        stroke="#22d3ee"
                                        strokeWidth="0.5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                        }}
                                    />
                                    <motion.line
                                        x1="58"
                                        y1="45"
                                        x2="70"
                                        y2="35"
                                        stroke="#22d3ee"
                                        strokeWidth="0.5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                    />
                                    <foreignObject
                                        x="71"
                                        y="30"
                                        width="30"
                                        height="10"
                                    >
                                        <div className="text-[4px] text-cyan-400 font-mono bg-black/50 p-1 rounded border border-cyan-500/30">
                                            SUSPICIOUS LESION
                                        </div>
                                    </foreignObject>
                                </svg>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Metadata Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 px-2 py-1 rounded text-[10px] font-mono text-cyan-400 tracking-tighter">
                        AXIAL / T1 +C{" "}
                        {scale !== 1 && ` / ZOOM: ${Math.round(scale * 100)}%`}
                    </div>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/40 rounded-br-xl" />
            </div>

            {/* Thumbnails */}
            {!isFullscreen && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                                "relative flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all",
                                currentImageIndex === index
                                    ? "border-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.5)] scale-105"
                                    : "border-slate-800 hover:border-slate-600",
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Slice ${index}`}
                                fill
                                className="object-cover grayscale"
                            />
                            <div className="absolute inset-0 bg-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MRIViewer;
