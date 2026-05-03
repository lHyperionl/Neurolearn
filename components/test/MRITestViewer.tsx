"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Niivue, SHOW_RENDER } from "@niivue/niivue";

interface MRIViewerNiiVueProps {
  participant_id: string;
}

type ViewMode = "axial" | "coronal" | "sagittal" | "all";

export default function MRITestViewer({
  participant_id,
}: MRIViewerNiiVueProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Niivue instance is created only once

  const nvRef = useRef<Niivue>(new Niivue());

  const [colormap, setColormap] = useState("gray");
  const colormapRef = useRef(colormap);

  const [viewMode, setViewMode] = useState<ViewMode>("all");

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
    "gray",
    "hot",
    "red",
    "blue",
    "green",
    "jet",
    "viridis",
    "plasma",
    "magma",
    "cividis",
  ];

  const url = `http://127.0.0.1:8000/files/${participant_id}/${participant_id}_T1w.nii.gz`;

  const applyViewMode = useCallback((nv: Niivue, mode: ViewMode) => {
    const v = nv.volumes[0];

    if (!v) return;

    const viewer = nv as any;

    if (mode === "axial") {
      nv.setSliceType(nv.sliceTypeAxial);
      return;
    }

    if (mode === "coronal") {
      nv.setSliceType(nv.sliceTypeCoronal);
      return;
    }

    if (mode === "sagittal") {
      nv.setSliceType(nv.sliceTypeSagittal);
      return;
    }

    nv.setSliceType(nv.sliceTypeMultiplanar);

    if (typeof viewer.setMultiplanarLayout === "function") {
      viewer.setMultiplanarLayout(2);
    }

    if (typeof viewer.setMultiplanarEqualSize === "function") {
      viewer.setMultiplanarEqualSize(true);
    }

    if (viewer.opts) {
      viewer.opts.multiplanarShowRender = SHOW_RENDER.NEVER;
    }
  }, []);

  const applyColormap = useCallback((nv: Niivue) => {
    const v = nv.volumes[0];

    if (!v) return;

    nv.setColormap(v.id, colormapRef.current);
    const viewer = nv as any;
    if (typeof viewer.draw === "function") viewer.draw();
  }, []);

  useEffect(() => {
    colormapRef.current = colormap;
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

  // Fullscreen change handler: update state and resize viewer
  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);

      const viewer = nvRef.current as any;
      if (typeof viewer.resizeListener === "function") {
        viewer.resizeListener();
      } else if (typeof viewer.resize === "function") {
        viewer.resize();
      }
    };

    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Window resize: ensure viewer resizes and colormap is reapplied
  useEffect(() => {
    const onResize = () => {
      const viewer = nvRef.current as any;
      if (typeof viewer.resizeListener === "function") {
        viewer.resizeListener();
      } else if (typeof viewer.resize === "function") {
        viewer.resize();
      }

      if (nvRef.current.volumes.length > 0) {
        applyColormap(nvRef.current);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyColormap]);

  // 2. Effect: Load main file and overlay (only when URL changes)

  useEffect(() => {
    const loadData = async () => {
      try {
        const volumes = [{ url }];

        await nvRef.current.loadVolumes(volumes);

        applyViewMode(nvRef.current, viewMode);
        applyColormap(nvRef.current);
      } catch (e: any) {}
    };

    loadData();
  }, [applyColormap, applyViewMode, url, viewMode]);

  // 3. Effect: Change colormap without reloading the file

  useEffect(() => {
    if (nvRef.current.volumes.length > 0) {
      applyColormap(nvRef.current);
    }
  }, [applyColormap, colormap]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const viewer = nvRef.current as any;

      if (typeof viewer.resizeListener === "function") {
        viewer.resizeListener();
      } else if (typeof viewer.resize === "function") {
        viewer.resize();
      }
    }, 0);

    return () => window.clearTimeout(handle);
  }, [viewMode]);

  // Colormap change

  const handleColormapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMap = e.target.value;
    setColormap(newMap);

    // Apply immediately to the loaded volume so the UI updates without reload
    if (nvRef.current.volumes.length > 0) {
      try {
        nvRef.current.setColormap(nvRef.current.volumes[0].id, newMap);
        const viewer = nvRef.current as any;
        if (typeof viewer.draw === "function") viewer.draw();
      } catch (err) {}
    }
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
      applyViewMode(nvRef.current, viewMode);
      applyColormap(nvRef.current);
      nvRef.current.setScale(1);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {}
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[70vh] min-h-[560px] max-h-[900px] bg-[#0f1117] rounded-2xl border border-cyan-500/20 shadow-2xl relative overflow-hidden p-5"
    >
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 h-full grid grid-cols-1 lg:grid-cols-[20%_80%] gap-4">
        <div className="bg-[#0d1015] rounded-xl border border-cyan-500/10 p-4 flex flex-col overflow-auto lg:h-full h-auto min-h-0">
          <div className="flex flex-col items-stretch gap-2 mb-6">
            {[
              { key: "axial", label: "Axial" },
              { key: "coronal", label: "Coronal" },
              { key: "sagittal", label: "Sagittal" },
              { key: "all", label: "All" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setViewMode(item.key as ViewMode)}
                className={
                  viewMode === item.key
                    ? "w-full px-3 py-2 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-mono text-xs text-left whitespace-normal break-words overflow-hidden"
                    : "w-full px-3 py-2 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs text-left hover:border-cyan-500/50 whitespace-normal break-words overflow-hidden"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="w-full px-3 py-2 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs text-left hover:border-cyan-500/50 whitespace-normal break-words overflow-hidden"
            >
              {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            </button>
            <label className="font-mono text-slate-300 text-xs">
              Colormap:
            </label>
            <select
              value={colormap}
              onChange={handleColormapChange}
              className="w-full bg-[#181b22] border border-cyan-500/30 text-cyan-300 font-mono rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors whitespace-normal break-words overflow-hidden"
            >
              {colormaps.map((cm) => (
                <option
                  key={cm}
                  value={cm}
                  className="bg-[#181b22] text-cyan-300"
                >
                  {cm}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleResetView}
              className="w-full px-3 py-2 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs text-left hover:border-cyan-500/50 whitespace-normal break-words overflow-hidden"
            >
              Reset view
            </button>
          </div>
        </div>
        <div className="bg-black/40 rounded-xl border border-cyan-500/10 p-3 flex flex-col relative min-h-0">
          <canvas
            ref={canvasRef}
            className="w-full flex-1 rounded-xl bg-black border border-cyan-500/10 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
