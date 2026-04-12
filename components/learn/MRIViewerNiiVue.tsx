"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Niivue } from "@niivue/niivue";

interface MRIViewerNiiVueProps {

  url: string; // URL for the NIfTI file (e.g., from backend)
  style?: React.CSSProperties;
  overlayUrl?: string; // Optional overlay (e.g., segmentation)
  overlayToggleUrl?: string; // Segmentation URL that can be toggled with a button
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

export default function MRIViewerNiiVue({
  url,
  style,
  overlayUrl,
  overlayToggleUrl,
  patientInfo,
  patientLoading,
  patientError,
}: MRIViewerNiiVueProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Niivue instance is created only once

  const nvRef = useRef<Niivue>(new Niivue());

  const [colormap, setColormap] = useState("gray");

  const [viewMode, setViewMode] = useState<ViewMode>("axial");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [renderOpacity, setRenderOpacity] = useState(1);

  const [renderIllumination, setRenderIllumination] = useState(0.6);

  const [gradientOpacity, setGradientOpacity] = useState(0.25);

  const [renderSilhouette, setRenderSilhouette] = useState(0.1);

  const [clipDepth, setClipDepth] = useState(2.0);

  const [clipAzimuth, setClipAzimuth] = useState(35);

  const [clipElevation, setClipElevation] = useState(15);
  const [isFullscreen, setIsFullscreen] = useState(false);



  // Colormaps supported by Niivue

  const colormaps = [

    "gray", "hot", "red", "blue", "green", "jet", "viridis", "plasma", "magma", "cividis"

  ];

  const applyViewMode = useCallback((mode: ViewMode) => {

    const v = nvRef.current.volumes[0];

    if (!v) return;

    if (mode === "axial") {

      nvRef.current.setSliceType(nvRef.current.sliceTypeAxial);

      if (v.dims && v.dims.length > 2) {
        // default slice handled internally by Niivue
      }

      return;

    }

    if (mode === "coronal") {

      nvRef.current.setSliceType(nvRef.current.sliceTypeCoronal);

      if (v.dims && v.dims.length > 1) {
        // default slice handled internally by Niivue
      }

      return;

    }

    if (mode === "sagittal") {

      nvRef.current.setSliceType(nvRef.current.sliceTypeSagittal);

      if (v.dims && v.dims.length > 0) {
        // default slice handled internally by Niivue
      }

      return;

    }

    nvRef.current.setSliceType(nvRef.current.sliceTypeRender);

  }, []);

  const applyColormap = useCallback(() => {

    const v = nvRef.current.volumes[0];

    if (!v) return;

    nvRef.current.setColormap(v.id, colormap);

  }, [colormap]);



  // 1. Effect: Initialize the canvas (once)

  useEffect(() => {

    if (canvasRef.current) {

      nvRef.current.attachToCanvas(canvasRef.current);

    }

    return () => {

      // Proper cleanup when leaving the page

      nvRef.current.loadVolumes([]);

    };

  }, []);



  // 2. Effect: Load main file and overlay (only when URL changes)

  useEffect(() => {

    setLoading(true);

    setError(null);

    const loadData = async () => {

      try {

        const volumes = [{ url }];

        if (overlayToggleUrl) {

          volumes.push({

            url: overlayToggleUrl,

            colorMap: "red",

            opacity: 0.5,

            name: overlayToggleUrl.split("/").pop() || "overlay",

          } as any);

        }

        await nvRef.current.loadVolumes(volumes);

        applyViewMode(viewMode);
        applyColormap();

        setLoading(false);

        setError(null);

      } catch (e: any) {

        setLoading(false);

        setError("Error loading: " + e.message);

      }

    };

    loadData();

  }, [url, overlayToggleUrl, applyViewMode, applyColormap, viewMode]);



  // 2b. Effect: Switch plane (axial/coronal/sagittal/3D)

  useEffect(() => {

    applyViewMode(viewMode);
    applyColormap();

  }, [applyViewMode, applyColormap, viewMode]);



  // 3. Effect: Change colormap without reloading the file

  useEffect(() => {

    applyColormap();

  }, [applyColormap]);



  // 4. Effect: Apply 3D settings (render mode)

  useEffect(() => {

    if (viewMode !== "render") return;

    if (nvRef.current.volumes.length === 0) return;

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



  // Colormap change

  const handleColormapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColormap(e.target.value);

  };

  const handleFullscreenToggle = async () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await containerRef.current.requestFullscreen();
  };

  const handleResetView = () => {
    setRenderOpacity(1);
    setRenderIllumination(0.6);
    setGradientOpacity(0.25);
    setRenderSilhouette(0.1);
    setClipDepth(2.0);
    setClipAzimuth(35);
    setClipElevation(15);

    if (nvRef.current.volumes.length > 0) {
      nvRef.current.setDefaults(undefined, true);
    }

    applyViewMode(viewMode);
    applyColormap();

    if (viewMode === "render") {
      nvRef.current.setOpacity(0, 1);
      nvRef.current.setRenderAzimuthElevation(35, 15);
      nvRef.current.setClipPlane([2.0, 35, 15]);
      nvRef.current.setScale(1.2);
      void nvRef.current.setVolumeRenderIllumination(0.6);
      void nvRef.current.setGradientOpacity(0.25, 0.1);
    } else {
      nvRef.current.setScale(1);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);



  return (
    <div
      ref={containerRef}
      className="w-full h-[70vh] min-h-[560px] max-h-[900px] bg-[#0f1117] rounded-2xl border border-cyan-500/20 shadow-2xl relative overflow-hidden p-5"
      style={style}
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 h-full grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div className="bg-[#0d1015] rounded-xl border border-cyan-500/10 p-4 flex flex-col overflow-hidden">
          {(patientLoading || patientError || patientInfo) && (
            <div className="mb-4 rounded-lg border border-cyan-500/10 bg-[#0f1117] p-3">
              <div className="font-mono text-xs text-slate-300 mb-2">Patient</div>
              {patientLoading && (
                <div className="text-cyan-400 font-mono text-xs">Loading...</div>
              )}
              {patientError && (
                <div className="text-red-400 font-mono text-xs">{patientError}</div>
              )}
              {patientInfo && !patientLoading && !patientError && (
                <div className="space-y-1">
                  <div className="text-slate-300 font-mono text-xs">
                    ID: <span className="text-cyan-300">{patientInfo.participantId || "n/a"}</span>
                  </div>
                  <div className="text-slate-300 font-mono text-xs">
                    Diagnosis: <span className="text-cyan-300">{patientInfo.diagnosis || "n/a"}</span>
                  </div>
                  <div className="text-slate-300 font-mono text-xs">
                    Age: <span className="text-cyan-300">{patientInfo.age || "n/a"}</span>
                  </div>
                  <div className="text-slate-300 font-mono text-xs">
                    Gender: <span className="text-cyan-300">{patientInfo.gender || "n/a"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {[
              { key: "axial", label: "Axial" },
              { key: "coronal", label: "Coronal" },
              { key: "sagittal", label: "Sagittal" },
              { key: "render", label: "3D" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setViewMode(item.key as ViewMode)}
                className={
                  viewMode === item.key
                    ? "px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-mono text-xs"
                    : "px-3 py-1 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs hover:border-cyan-500/50"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <label className="font-mono text-slate-300 text-xs">Colormap:</label>
            <select
              value={colormap}
              onChange={handleColormapChange}
              className="bg-[#181b22] border border-cyan-500/30 text-cyan-300 font-mono rounded-md px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
            >
              {colormaps.map((cm) => (
                <option key={cm} value={cm} className="bg-[#181b22] text-cyan-300">{cm}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleResetView}
              className="ml-auto px-3 py-1 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs hover:border-cyan-500/50"
            >
              Reset view
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {viewMode === "render" && (
              <>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Opacity:
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={renderOpacity}
                    onChange={(e) => setRenderOpacity(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{renderOpacity.toFixed(2)}</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Clip depth:
                  <input
                    type="range"
                    min={0}
                    max={2}
                    step={0.05}
                    value={clipDepth}
                    onChange={(e) => setClipDepth(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{clipDepth.toFixed(2)}</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Azimuth:
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={clipAzimuth}
                    onChange={(e) => setClipAzimuth(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{clipAzimuth} deg</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Elevation:
                  <input
                    type="range"
                    min={-90}
                    max={90}
                    step={1}
                    value={clipElevation}
                    onChange={(e) => setClipElevation(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{clipElevation} deg</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Illumination:
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={renderIllumination}
                    onChange={(e) => setRenderIllumination(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{renderIllumination.toFixed(2)}</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Gradient:
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={gradientOpacity}
                    onChange={(e) => setGradientOpacity(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{gradientOpacity.toFixed(2)}</span>
                </label>
                <label className="font-mono text-slate-300 flex items-center gap-3">
                  Silhouette:
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={renderSilhouette}
                    onChange={(e) => setRenderSilhouette(Number(e.target.value))}
                    className="accent-cyan-500 h-2 w-full cursor-pointer"
                  />
                  <span className="text-cyan-400 font-bold font-mono text-xs">{renderSilhouette.toFixed(2)}</span>
                </label>
              </>
            )}
          </div>
        </div>
        <div className="bg-black/40 rounded-xl border border-cyan-500/10 p-3 flex flex-col relative">
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-md border border-cyan-500/20 bg-[#0f1117]/80 text-cyan-200 hover:border-cyan-500/60"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? "close_fullscreen" : "fullscreen"}
            </span>
          </button>
          {loading && <div className="text-cyan-400 font-mono mb-2">Loading MRI data...</div>}
          {error && <div className="text-red-400 font-mono mb-2">{error}</div>}
          <canvas ref={canvasRef} className="w-full flex-1 rounded-xl bg-black border border-cyan-500/10 shadow-inner" />
        </div>
      </div>
    </div>
  );

}