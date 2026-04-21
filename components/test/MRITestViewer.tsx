"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Niivue } from "@niivue/niivue";

interface MRIViewerNiiVueProps {
  participant_id: string;
}

type ViewMode = "axial" | "coronal" | "sagittal";

export default function MRITestViewer({
  participant_id,
}: MRIViewerNiiVueProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Niivue instance is created only once

  const nvRef = useRef<Niivue>(new Niivue());

  const [colormap, setColormap] = useState("gray");

  const [viewMode, setViewMode] = useState<ViewMode>("axial");

  const [renderOpacity, setRenderOpacity] = useState(1);

  const [renderIllumination, setRenderIllumination] = useState(0.6);

  const [gradientOpacity, setGradientOpacity] = useState(0.25);

  const [renderSilhouette, setRenderSilhouette] = useState(0.1);

  const [clipDepth, setClipDepth] = useState(2.0);

  const [clipAzimuth, setClipAzimuth] = useState(35);

  const [clipElevation, setClipElevation] = useState(15);

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

  // useEffect(() => {
  //   setLoading(true);
  //   fetch(
  //     `http://127.0.0.1:8000/files/${participant_id}/${participant_id}_T1w.nii.gz`,
  //   )
  //     .then((res) => res.json())
  //     .then((data) => {})
  //     .catch((e) => {
  //       setError("Failed to load cases.");
  //       setLoading(false);
  //     });
  // }, []);

  const applyViewMode = useCallback((mode: ViewMode) => {
    const v = nvRef.current.volumes[0];

    if (!v) return;

    if (mode === "axial") {
      nvRef.current.setSliceType(nvRef.current.sliceTypeAxial);
      return;
    }

    if (mode === "coronal") {
      nvRef.current.setSliceType(nvRef.current.sliceTypeCoronal);
      return;
    }

    if (mode === "sagittal") {
      nvRef.current.setSliceType(nvRef.current.sliceTypeSagittal);
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
    const loadData = async () => {
      try {
        const volumes = [{ url }];

        await nvRef.current.loadVolumes(volumes);

        applyViewMode(viewMode);
        applyColormap();
      } catch (e: any) {}
    };

    loadData();
  }, []);

  // 2b. Effect: Switch plane (axial/coronal/sagittal/3D)

  useEffect(() => {
    applyViewMode(viewMode);
    applyColormap();
  }, [applyViewMode, applyColormap, viewMode]);

  // 3. Effect: Change colormap without reloading the file

  useEffect(() => {
    applyColormap();
  }, [applyColormap]);

  // Colormap change

  const handleColormapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColormap(e.target.value);
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

    nvRef.current.setScale(1);
  };

  return (
    <div className="w-full h-[70vh] min-h-[560px] max-h-[900px] bg-[#0f1117] rounded-2xl border border-cyan-500/20 shadow-2xl relative overflow-hidden p-5">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative z-10 h-full grid grid-cols-1 lg:grid-cols-[20%_80%] gap-4">
        <div className="bg-[#0d1015] rounded-xl border border-cyan-500/10 p-4 flex flex-col overflow-hidden h-full">
          <div className="flex flex-col items-stretch gap-2 mb-6">
            {[
              { key: "axial", label: "Axial" },
              { key: "coronal", label: "Coronal" },
              { key: "sagittal", label: "Sagittal" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setViewMode(item.key as ViewMode)}
                className={
                  viewMode === item.key
                    ? "w-full px-3 py-2 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/60 font-mono text-xs text-left"
                    : "w-full px-3 py-2 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs text-left hover:border-cyan-500/50"
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-slate-300 text-xs">
              Colormap:
            </label>
            <select
              value={colormap}
              onChange={handleColormapChange}
              className="w-full bg-[#181b22] border border-cyan-500/30 text-cyan-300 font-mono rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-colors"
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
              className="w-full px-3 py-2 rounded-md bg-[#181b22] text-slate-300 border border-cyan-500/20 font-mono text-xs text-left hover:border-cyan-500/50"
            >
              Reset view
            </button>
          </div>
        </div>
        <div className="bg-black/40 rounded-xl border border-cyan-500/10 p-3 flex flex-col relative">
          <canvas
            ref={canvasRef}
            className="w-full flex-1 rounded-xl bg-black border border-cyan-500/10 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
