"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Niivue } from "@niivue/niivue";
import { cn } from "@/lib/utils";

interface InteractiveMRIViewerProps {
    url: string;
    overlayUrl?: string;
    className?: string;
    patientInfo?: {
        participantId?: string | null;
        diagnosis?: string | null;
        age?: string | null;
        gender?: string | null;
    } | null;
    patientLoading?: boolean;
    patientError?: string | null;
}

type ViewMode = "axial" | "coronal" | "sagittal" | "render";
type ViewerMode = ViewMode | "multiplanar";

const getModeLabel = (mode: ViewerMode) =>
    mode === "multiplanar" ? "ALL MODES" : mode.toUpperCase();

const VIEW_MODES: { key: ViewMode; label: string; icon: string }[] = [
    { key: "axial", label: "Axial", icon: "view_stream" },
    { key: "coronal", label: "Coronal", icon: "view_day" },
    { key: "sagittal", label: "Sagittal", icon: "view_week" },
    { key: "render", label: "3D", icon: "3d_rotation" },
];

export default function InteractiveMRIViewer({
    url,
    overlayUrl,
    className,
    patientInfo,
    patientLoading,
    patientError,
}: InteractiveMRIViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const nvRef = useRef<Niivue | null>(null);
    const [viewMode, setViewMode] = useState<ViewerMode>("axial");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [colormap, setColormap] = useState("gray");
    const [renderOpacity, setRenderOpacity] = useState(1);
    const [renderIllumination, setRenderIllumination] = useState(0.6);
    const [gradientOpacity, setGradientOpacity] = useState(0.25);
    const [renderSilhouette, setRenderSilhouette] = useState(0.1);
    const [clipDepth, setClipDepth] = useState(2.0);
    const [clipAzimuth, setClipAzimuth] = useState(35);
    const [clipElevation, setClipElevation] = useState(15);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [thumbnails, setThumbnails] = useState<
        Record<ViewMode, string | null>
    >({
        axial: null,
        coronal: null,
        sagittal: null,
        render: null,
    });

    const renderDefaults = {
        opacity: 1,
        illumination: 0.6,
        gradient: 0.25,
        silhouette: 0.1,
        clipDepth: 2.0,
        azimuth: 35,
        elevation: 15,
    };

    const applyRenderDefaults = useCallback(() => {
        setRenderOpacity(renderDefaults.opacity);
        setRenderIllumination(renderDefaults.illumination);
        setGradientOpacity(renderDefaults.gradient);
        setRenderSilhouette(renderDefaults.silhouette);
        setClipDepth(renderDefaults.clipDepth);
        setClipAzimuth(renderDefaults.azimuth);
        setClipElevation(renderDefaults.elevation);

        if (nvRef.current?.volumes?.length) {
            nvRef.current.setOpacity(0, renderDefaults.opacity);
            nvRef.current.setRenderAzimuthElevation(
                renderDefaults.azimuth,
                renderDefaults.elevation,
            );
            nvRef.current.setClipPlane([
                renderDefaults.clipDepth,
                renderDefaults.azimuth,
                renderDefaults.elevation,
            ]);
            nvRef.current.setScale(1.2);
            void nvRef.current.setVolumeRenderIllumination(
                renderDefaults.illumination,
            );
            void nvRef.current.setGradientOpacity(
                renderDefaults.gradient,
                renderDefaults.silhouette,
            );
        }
    }, []);

    // Initialize Niivue
    useEffect(() => {
        if (!canvasRef.current) return;

        const nv = new Niivue({
            loadingText: "Initializing Neural Stream...",
            backColor: [0.05, 0.07, 0.09, 1],
            show3Dcrosshair: true,
            onLocationChange: () => {},
            glAttributes: { preserveDrawingBuffer: true },
        });

        nvRef.current = nv;
        nv.attachToCanvas(canvasRef.current);
        nv.setSliceType(nv.sliceTypeAxial);

        return () => {
            nv.loadVolumes([]);
        };
    }, []);

    const updateViewMode = useCallback((mode: ViewerMode) => {
        if (!nvRef.current) return;

        const nv = nvRef.current;
        if (mode === "axial") nv.setSliceType(nv.sliceTypeAxial);
        else if (mode === "coronal") nv.setSliceType(nv.sliceTypeCoronal);
        else if (mode === "sagittal") nv.setSliceType(nv.sliceTypeSagittal);
        else if (mode === "render") nv.setSliceType(nv.sliceTypeRender);
        else if (mode === "multiplanar") {
            nv.setMultiplanarLayout(2);
            nv.setHeroImage(0);
            nv.setSliceType(nv.sliceTypeMultiplanar);
        }

        if (typeof nv.draw === "function") {
            nv.draw();
        }

        setViewMode(mode);
        if (mode === "render") {
            applyRenderDefaults();
        }
    }, [applyRenderDefaults]);

    // Load Volume and Generate Thumbnails
    useEffect(() => {
        const loadVolume = async () => {
            if (!nvRef.current || !url) return;

            setLoading(true);
            setError(null);

            try {
                const volumes = [
                    {
                        url,
                        colorMap: colormap,
                        trustPrebuilt: true,
                    },
                ];
                if (overlayUrl) {
                    volumes.push({
                        url: overlayUrl,
                        colorMap: "red",
                        opacity: 0.5,
                        trustPrebuilt: true,
                    } as any);
                }

                await nvRef.current!.loadVolumes(volumes);

                // Finalize state
                const nv = nvRef.current!;
                if (typeof nv.draw === "function") {
                    nv.draw();
                }

                // Generate thumbnails with a small delay for WebGL rendering
                setTimeout(() => {
                    const nv = nvRef.current;
                    if (!nv) return;

                    const thumbs: any = {};
                    const modes: { key: ViewMode; val: number }[] = [
                        { key: "axial", val: nv.sliceTypeAxial },
                        { key: "coronal", val: nv.sliceTypeCoronal },
                        { key: "sagittal", val: nv.sliceTypeSagittal },
                        { key: "render", val: nv.sliceTypeRender },
                    ];

                    for (const m of modes) {
                        nv.setSliceType(m.val);
                        if (typeof nv.draw === "function") nv.draw();
                        thumbs[m.key] = nv.canvas?.toDataURL();
                    }

                    setThumbnails(thumbs);
                    updateViewMode(viewMode);
                    setLoading(false);
                }, 1500);
            } catch (err) {
                console.error("Failed to load MRI volume:", err);
                setError("Failed to load MRI data");
                setLoading(false);
            }
        };

        loadVolume();
    }, [url, overlayUrl]);

    useEffect(() => {
        if (viewMode !== "render") return;
        if (!nvRef.current?.volumes?.length) return;

        nvRef.current.setOpacity(0, renderOpacity);
        nvRef.current.setRenderAzimuthElevation(clipAzimuth, clipElevation);
        nvRef.current.setClipPlane([clipDepth, clipAzimuth, clipElevation]);
        nvRef.current.setScale(1.2);
        void nvRef.current.setVolumeRenderIllumination(renderIllumination);
        void nvRef.current.setGradientOpacity(gradientOpacity, renderSilhouette);
    }, [
        viewMode,
        renderOpacity,
        renderIllumination,
        gradientOpacity,
        renderSilhouette,
        clipDepth,
        clipAzimuth,
        clipElevation,
    ]);

    const handleFullscreenToggle = async () => {
        if (!containerRef.current) return;
        if (document.fullscreenElement) {
            await document.exitFullscreen();
            return;
        }
        await containerRef.current.requestFullscreen();
    };

    const handleResetView = useCallback(() => {
        const nv = nvRef.current;
        if (!nv) return;

        const activeMode = viewMode;
        nv.setDefaults(undefined, true);
        applyRenderDefaults();
        setColormap("gray");

        if (nv.volumes[0]) {
            nv.setColormap(nv.volumes[0].id, "gray");
        }

        updateViewMode(activeMode);

        if (typeof nv.draw === "function") {
            nv.draw();
        }
    }, [applyRenderDefaults, updateViewMode, viewMode]);

    const handleShowAllModes = () => {
        updateViewMode("multiplanar");
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenActive = Boolean(document.fullscreenElement);
            setIsFullscreen(fullscreenActive);
            if (!fullscreenActive) {
                setShowThumbnails(true);
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const resize = () => {
            const nv = nvRef.current as any;
            if (typeof nv?.resizeListener === "function") {
                nv.resizeListener();
            } else if (typeof nv?.resize === "function") {
                nv.resize();
            }
        };

        const handle = window.setTimeout(resize, 0);
        return () => window.clearTimeout(handle);
    }, [isFullscreen]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "flex flex-col h-full min-h-[1000px] bg-[#1e2023] border border-[#3c494e] p-4 mri-glow relative",
                isFullscreen && "w-screen h-screen max-h-none p-3 rounded-none border-cyan-500/20",
                className,
            )}
        >
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between mb-4 border-b border-[#3c494e]/30 pb-3">
                 <h3 className="font-mono text-lg text-[#a8e8ff] tracking-tighter">
                    [ INTERACTIVE_VIEWER_V2.0 ]
                </h3>
                <div className="flex flex-wrap justify-end gap-4">
                     <button
                         onClick={handleFullscreenToggle}
                         className="px-3 py-2 hover:bg-[#333538] transition-colors text-cyan-500 rounded-lg border border-[#3c494e] bg-[#0d1117]/80 flex items-center gap-2"
                         title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                     >
                         <span
                             className="material-symbols-outlined"
                             style={{ fontSize: "20px" }}
                         >
                             {isFullscreen ? "close_fullscreen" : "fullscreen"}
                         </span>
                         <span className="text-xs font-mono hidden sm:inline">
                             {isFullscreen ? "Exit" : "Fullscreen"}
                         </span>
                     </button>
                     <select
                         value={colormap}
                         onChange={(e) => {
                             setColormap(e.target.value);
                             if (nvRef.current?.volumes[0]) {
                                 nvRef.current.setColormap(
                                     nvRef.current.volumes[0].id,
                                     e.target.value,
                                 );
                             }
                         }}
                          className="bg-[#0d1117] border border-cyan-500/30 text-cyan-300 font-mono text-sm rounded-lg px-4 py-3 outline-none hover:border-cyan-500/60 transition-colors min-w-[140px]"
                     >
                        {["gray", "hot", "jet", "viridis", "magma"].map(
                            (cm) => (
                                <option key={cm} value={cm}>
                                    {cm.toUpperCase()}
                                </option>
                            ),
                        )}
                    </select>
                     <button
                         onClick={async () => {
                             if (!nvRef.current) return;
                             const nv = nvRef.current;
                             const originalMode = viewMode;
                             const thumbs: any = {};

                             const modes: { key: ViewMode; val: number }[] = [
                                 { key: "axial", val: nv.sliceTypeAxial },
                                 { key: "coronal", val: nv.sliceTypeCoronal },
                                 { key: "sagittal", val: nv.sliceTypeSagittal },
                                 { key: "render", val: nv.sliceTypeRender },
                             ];

                              for (const m of modes) {
                                  nv.setSliceType(m.val);
                                  if (typeof nv.draw === "function") nv.draw();
                                  thumbs[m.key] = nv.canvas?.toDataURL();
                              }

                              setThumbnails(thumbs);
                              updateViewMode(originalMode);
                         }}
                         className="px-3 py-2 hover:bg-[#333538] transition-colors text-cyan-400 rounded-lg border border-[#3c494e] bg-[#0d1117]/80 flex items-center gap-2"
                         title="Refresh Thumbnails"
                     >
                         <span
                             className="material-symbols-outlined"
                             style={{ fontSize: "20px" }}
                         >
                             refresh
                         </span>
                         <span className="text-xs font-mono hidden sm:inline">
                             Refresh
                         </span>
                     </button>
                     <button
                         onClick={handleResetView}
                         className="px-3 py-2 hover:bg-[#333538] transition-colors text-[#bbc9cf] rounded-lg border border-[#3c494e] bg-[#0d1117]/80 flex items-center gap-2"
                         title="Reset View"
                     >
                         <span
                             className="material-symbols-outlined"
                             style={{ fontSize: "20px" }}
                         >
                             restart_alt
                         </span>
                         <span className="text-xs font-mono hidden sm:inline">
                             Reset
                         </span>
                     </button>
                     <button
                         onClick={handleShowAllModes}
                         className="px-3 py-2 hover:bg-[#333538] transition-colors text-amber-300 rounded-lg border border-[#3c494e] bg-[#0d1117]/80 flex items-center gap-2"
                         title="Show All Modes"
                     >
                         <span
                             className="material-symbols-outlined"
                             style={{ fontSize: "20px" }}
                         >
                             grid_view
                         </span>
                         <span className="text-xs font-mono hidden sm:inline">
                             Show All Modes
                         </span>
                     </button>
                     {isFullscreen && (
                         <button
                             onClick={() => setShowThumbnails((visible) => !visible)}
                             className="px-3 py-2 hover:bg-[#333538] transition-colors text-slate-300 rounded-lg border border-[#3c494e] bg-[#0d1117]/80 flex items-center gap-2"
                             title={showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
                         >
                             <span
                                 className="material-symbols-outlined"
                                 style={{ fontSize: "20px" }}
                             >
                                 {showThumbnails ? "visibility_off" : "visibility"}
                             </span>
                             <span className="text-xs font-mono hidden sm:inline">
                                 {showThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
                             </span>
                         </button>
                     )}
                </div>
            </div>

            {(patientLoading || patientError || patientInfo) && (
                <div className="mb-4 rounded-lg border border-cyan-500/10 bg-[#0f1117] p-3">
                     <div className="font-mono text-sm text-slate-300 mb-2">Patient</div>
                     {patientLoading && (
                         <div className="text-cyan-400 font-mono text-sm">Loading...</div>
                     )}
                     {patientError && (
                         <div className="text-red-400 font-mono text-sm">{patientError}</div>
                     )}
                     {patientInfo && !patientLoading && !patientError && (
                         <div className="space-y-1">
                             <div className="text-slate-300 font-mono text-sm">
                                 ID: <span className="text-cyan-300">{patientInfo.participantId || "n/a"}</span>
                             </div>
                             <div className="text-slate-300 font-mono text-sm">
                                 Diagnosis: <span className="text-cyan-300">{patientInfo.diagnosis || "n/a"}</span>
                             </div>
                             <div className="text-slate-300 font-mono text-sm">
                                 Age: <span className="text-cyan-300">{patientInfo.age || "n/a"}</span>
                             </div>
                             <div className="text-slate-300 font-mono text-sm">
                                 Gender: <span className="text-cyan-300">{patientInfo.gender || "n/a"}</span>
                             </div>
                         </div>
                     )}
                </div>
            )}

            {/* Main View Area */}
            <div className="relative flex-1 bg-black overflow-hidden rounded-lg border border-[#3c494e]/50">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                />

                 {loading && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-cyan-400 font-mono text-lg">
                         INITIALIZING NEURAL SCAN...
                     </div>
                 )}
 
                 {error && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 text-red-500 font-mono text-lg p-4 text-center">
                         {error}
                     </div>
                 )}

                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 border border-[#a8e8ff]/40 z-10">
                    <span className="font-mono text-base text-[#a8e8ff]">
                        MODE: {getModeLabel(viewMode)}
                    </span>
                </div>
            </div>

            {/* Thumbnail Controls */}
            {showThumbnails && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                    {VIEW_MODES.map((mode) => {
                        const showActive = viewMode === mode.key;
                        return (
                            <button
                                key={mode.key}
                                onClick={() => updateViewMode(mode.key)}
                                className={cn(
                                    "relative aspect-video bg-[#0d1117] border flex flex-col items-center justify-center transition-all group overflow-hidden",
                                    showActive
                                        ? "border-[#a8e8ff] shadow-[0_0_15px_rgba(0,212,255,0.3)] ring-1 ring-[#a8e8ff]/50"
                                        : "border-[#3c494e] hover:border-[#a8e8ff]/40",
                                )}
                            >
                            {/* Preview Image / Icon Container */}
                            <div className="flex-1 w-full relative flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                {thumbnails[mode.key] ? (
                                    <img
                                        src={thumbnails[mode.key]!}
                                        alt={mode.label}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                ) : (
                                    <span
                                        className={cn(
                                            "material-symbols-outlined transition-all duration-300",
                                            showActive
                                                ? "text-[#a8e8ff] scale-110"
                                                : "text-[#5c696e] group-hover:text-[#a8e8ff]/60",
                                        )}
                                        style={{
                                            fontSize: "32px",
                                            fontVariationSettings: '"FILL" 1',
                                        }}
                                    >
                                        {mode.icon}
                                    </span>
                                )}

                                {/* Simulated anatomical plane lines (Visual Polish) */}
                                <div className="absolute inset-0 opacity-20 pointer-events-none">
                                    {mode.key === "axial" && (
                                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                                    )}
                                    {mode.key === "coronal" && (
                                        <div className="absolute top-0 left-1/2 w-[2px] h-full bg-cyan-500/50 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                                    )}
                                    {mode.key === "sagittal" && (
                                        <div className="absolute inset-x-4 top-1/3 bottom-1/3 border-y-2 border-cyan-500/50 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                                    )}
                                    {mode.key === "render" && (
                                        <div className="absolute inset-6 border-2 border-cyan-500/40 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.3)]" />
                                    )}
                                </div>
                             </div>

                             {/* Label Bar */}
                             <div className={cn(
                                 "w-full py-2 text-[14px] font-mono font-bold tracking-[0.2em] text-center border-t transition-colors",
                                  showActive
                                      ? "bg-[#a8e8ff]/10 text-[#a8e8ff] border-[#a8e8ff]/30"
                                      : "bg-black/40 text-[#5c696e] border-transparent group-hover:text-[#bbc9cf]",
                             )}
                             >
                                 {mode.label.toUpperCase()}
                             </div>

                             {/* Scanline effect for active thumbnail */}
                             {showActive && (
                                 <div className="absolute inset-0 neural-scanline pointer-events-none opacity-20" />
                             )}

                             {/* Decorative corners */}
                             <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-[#3c494e]" />
                             <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-[#3c494e]" />
                             <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-[#3c494e]" />
                             <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-[#3c494e]" />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
