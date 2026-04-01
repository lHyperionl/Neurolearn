"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { MRIImage } from "@/lib/mock-data";

const MotionImage = motion(Image);

interface MRIViewerProps {
    images: MRIImage[];
}

const MRIViewer = ({ images }: MRIViewerProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

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
        setShowAnnotations(true);
    }, []);

    const currentImage = images[currentImageIndex];

    return (
        <div
            ref={containerRef}
            className="bg-[#1e2023] border border-[#3c494e] p-4 mri-glow relative flex flex-col h-full overflow-hidden"
        >
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 border-b border-[#3c494e]/30 pb-3">
                <h3 className="font-mono text-sm text-[#a8e8ff] tracking-tighter">
                    [ MRI_VIEWER_V1.0 ]
                </h3>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 hover:bg-[#333538] transition-colors text-[#bbc9cf]"
                        title="Zoom In"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                        >
                            zoom_in
                        </span>
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 hover:bg-[#333538] transition-colors text-[#bbc9cf]"
                        title="Zoom Out"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                        >
                            zoom_out
                        </span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="p-2 hover:bg-[#333538] transition-colors text-[#bbc9cf]"
                        title="Reset"
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                        >
                            restart_alt
                        </span>
                    </button>
                    <div className="w-px h-6 bg-[#3c494e] mx-1" />
                    <button
                        onClick={() => setShowAnnotations(!showAnnotations)}
                        className={cn(
                            "px-3 py-1 text-xs font-mono flex items-center gap-2 transition-colors",
                            showAnnotations
                                ? "bg-[#00d4ff] text-[#00586b]"
                                : "bg-[#282a2d] text-[#bbc9cf] hover:bg-[#333538]",
                        )}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                        >
                            note_alt
                        </span>
                        ANNOTATIONS: {showAnnotations ? "ON" : "OFF"}
                    </button>
                </div>
            </div>

            {/* Main Image */}
            <div
                className="relative flex-1 bg-black overflow-hidden flex items-center justify-center"
                style={{ minHeight: "320px" }}
            >
                <div className="neural-scanline" />

                <AnimatePresence mode="wait">
                    <MotionImage
                        key={currentImageIndex}
                        src={currentImage.url}
                        alt={`MRI ${currentImage.view} Scan`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-contain opacity-80"
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

                {/* Overhead label */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 border border-[#a8e8ff]/40 z-10">
                    <span className="font-mono text-[10px] text-[#a8e8ff]">
                        {currentImage.view} / {currentImage.sequence}
                    </span>
                </div>

                {/* Bottom right stats */}
                <div className="absolute bottom-4 right-4 text-right z-10">
                    <p className="font-mono text-[10px] text-slate-500">
                        ZOOM: {scale.toFixed(1)}X
                    </p>
                    <p className="font-mono text-[10px] text-slate-500">
                        SLICE: {currentImageIndex + 1}/{images.length}
                    </p>
                </div>

                {/* Annotation overlay */}
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
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <circle
                                    cx="50"
                                    cy="45"
                                    r="8"
                                    fill="none"
                                    stroke="#00d4ff"
                                    strokeWidth="0.5"
                                    strokeDasharray="2,1"
                                />
                                <line
                                    x1="58"
                                    y1="37"
                                    x2="65"
                                    y2="30"
                                    stroke="#00d4ff"
                                    strokeWidth="0.3"
                                />
                                <foreignObject
                                    x="65"
                                    y="24"
                                    width="34"
                                    height="14"
                                >
                                    <div className="text-[4px] text-[#a8e8ff] font-mono bg-black/60 px-1 py-0.5 border border-[#00d4ff]/30 w-fit whitespace-nowrap">
                                        SUSPICIOUS LESION
                                    </div>
                                </foreignObject>
                            </svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 mt-4">
                {images.map((img, index) => {
                    const isActive = currentImageIndex === index;
                    return (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={cn(
                                "relative aspect-square bg-[#282a2d] cursor-pointer overflow-hidden group transition-colors",
                                isActive
                                    ? "border-2 border-[#a8e8ff]"
                                    : "border border-[#3c494e] hover:border-[#a8e8ff]/40",
                            )}
                        >
                            <Image
                                src={img.url}
                                alt={img.view}
                                fill
                                sizes="150px"
                                className={cn(
                                    "object-cover grayscale transition-opacity",
                                    isActive
                                        ? "opacity-80"
                                        : "opacity-50 group-hover:opacity-70",
                                )}
                            />
                            <div
                                className={cn(
                                    "absolute bottom-0 left-0 w-full p-1",
                                    isActive
                                        ? "bg-[#a8e8ff]/20"
                                        : "bg-black/50",
                                )}
                            >
                                <p
                                    className={cn(
                                        "text-[8px] font-mono text-center leading-none",
                                        isActive
                                            ? "text-[#a8e8ff]"
                                            : "text-[#bbc9cf]",
                                    )}
                                >
                                    {img.view}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MRIViewer;
