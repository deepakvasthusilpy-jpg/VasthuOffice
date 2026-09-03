import React, { useState, useRef } from "react";
import { ImageIcon, Wand2, Upload, Download, RefreshCw, CheckCircle2, Sparkles, Layers, Sliders } from "lucide-react";

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1 Square (1024x1024)", desc: "Social & Post" },
  { id: "16:9", label: "16:9 Landscape (1920x1080)", desc: "Elevation & 3D Site" },
  { id: "9:16", label: "9:16 Vertical (1080x1920)", desc: "Story & Mobile View" },
  { id: "4:3", label: "4:3 Standard Architectural", desc: "Plan & Exterior" },
];

const PRESET_PROMPTS = [
  "Photorealistic 3D architectural exterior render of a modern contemporary Kerala luxury house with sloped tile accents, warm evening lighting, landscaped tropical garden",
  "Realistic traditional Kerala Nalukettu courtyard villa with wooden pillars, brass charupady, inner open-to-sky nadumuttam with raindrops",
  "Modern minimalist open-plan living room interior with teak wood furniture, warm recessed ambient LED lighting, large glass patio doors",
  "Front elevation 3D architectural visualization of a two-story modern residence with textured stone cladding, balcony planters, and glass railings"
];

// High-quality architectural render placeholders to demonstrate the 4 rendered outputs
const SAMPLE_RENDERS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
];

export const RenderingDashboard: React.FC = () => {
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0]);
  const [selectedSize, setSelectedSize] = useState("16:9");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(SAMPLE_RENDERS);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setStatusMessage("Reference image uploaded. Ready for realistic render.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRender = () => {
    if (!prompt.trim()) {
      setStatusMessage("Please enter a description or prompt for the rendering.");
      return;
    }
    setLoading(true);
    setStatusMessage("Generating 4 realistic architectural views using Nano Banana 2 Lite engine...");

    // Simulate realistic generation pipeline
    setTimeout(() => {
      setImages([
        `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80&sig=${Date.now() + 1}`,
        `https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80&sig=${Date.now() + 2}`,
        `https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80&sig=${Date.now() + 3}`,
        `https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80&sig=${Date.now() + 4}`
      ]);
      setLoading(false);
      setStatusMessage("Successfully generated 4 realistic architectural renders!");
    }, 1800);
  };

  return (
    <div id="rendering_dashboard_container" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Nano Banana 2 Lite • Free Edition
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            AI Realistic Architectural Rendering
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Render 4 photorealistic architectural views simultaneously from text descriptions or uploaded elevation / 2D plan references.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn_trigger_render_top"
            onClick={handleRender}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-900/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering 4 Views...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Render 4 Realistic Views
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input & Config */}
        <div className="lg:col-span-1 space-y-5">
          {/* Reference Image Upload */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-indigo-600" /> Reference Image / Sketch
              </label>
              {uploadedImage && (
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {uploadedImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 group">
                <img src={uploadedImage} alt="Uploaded reference" className="w-full h-36 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-indigo-50/30"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                <p className="text-xs font-bold text-slate-700">Click or drag image here</p>
                <p className="text-[10px] text-slate-500 mt-0.5">AutoCAD 2D export, sketch, or photo</p>
              </div>
            )}
          </div>

          {/* Size / Aspect Ratio Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" /> Output Size & Aspect Ratio
            </label>
            <div className="space-y-2">
              {ASPECT_RATIOS.map((ratio) => (
                <label
                  key={ratio.id}
                  onClick={() => setSelectedSize(ratio.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedSize === ratio.id
                      ? "border-pink-500 bg-pink-50/50 text-pink-900 font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="aspect_ratio"
                      checked={selectedSize === ratio.id}
                      onChange={() => setSelectedSize(ratio.id)}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <span>{ratio.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{ratio.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" /> Architectural Presets
            </label>
            <div className="space-y-1.5">
              {PRESET_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="w-full text-left text-[11px] text-slate-600 hover:text-slate-900 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 line-clamp-2 transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right: Prompt Input and 4 Rendered Results */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prompt Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Render Prompt / Description
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Nano Banana 2 Lite Engine</span>
            </div>
            <textarea
              id="txt_render_prompt"
              rows={4}
              className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-800"
              placeholder="Describe materials, lighting (morning golden hour, twilight), landscaping, exterior textures, style (Contemporary, Traditional Kerala Nalukettu, Minimalist)..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {statusMessage ? (
                <p className="text-xs text-indigo-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {statusMessage}
                </p>
              ) : (
                <span className="text-xs text-slate-400">Click render to generate 4 distinct angles/variations</span>
              )}
              <button
                id="btn_render_action"
                onClick={handleRender}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                Render 4 Nos
              </button>
            </div>
          </div>

          {/* 4 Rendered Images Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span>Rendered Views (4 Outputs • {selectedSize})</span>
                {loading && <span className="text-xs text-pink-600 animate-pulse font-normal">(Generating...)</span>}
              </h2>
              <span className="text-xs text-slate-500">Click any image to view full resolution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col"
                >
                  <div className="relative overflow-hidden bg-slate-100 flex-1">
                    <img
                      src={img}
                      alt={`Render View ${idx + 1}`}
                      className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
                      View #{idx + 1}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-pink-600/90 backdrop-blur-sm text-white font-mono text-[10px] font-bold">
                      {selectedSize}
                    </div>
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Realistic Architectural Render {idx + 1}</span>
                    <a
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                      title="Open full image"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
