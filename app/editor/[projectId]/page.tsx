"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Undo2,
  Redo2,
  Settings,
  Sparkles,
  Scissors,
  Type,
  Music,
  Palette,
  Layers,
  Send,
  Loader2,
  Check,
  Clock,
  Film,
  ChevronLeft,
  Wand2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Share2,
  MessageSquare,
  Trash2,
  Copy,
  MoreVertical,
  ChevronDown,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Edit {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "complete" | "error";
  timestamp: Date;
  description?: string;
  commands?: string[];
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
}

export default function EditorPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    volume: 0.8,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
  });

  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "history">("tools");
  const [editHistory, setEditHistory] = useState<Edit[]>([]);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [zoom, setZoom] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);
  const [videoFile, setVideoFile] = useState<{ name: string; size: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load project data on mount
  useEffect(() => {
    const projectData = sessionStorage.getItem(`clipcraft_${projectId}`);
    if (projectData) {
      const parsed = JSON.parse(projectData);
      setVideoFile({ name: parsed.name, size: parsed.size });
      setProjectName(parsed.name.replace(/\.[^/.]+$/, ""));
    }
  }, [projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          setVideoState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
          break;
        case "ArrowLeft":
          setVideoState((prev) => ({
            ...prev,
            currentTime: Math.max(0, prev.currentTime - 5),
          }));
          break;
        case "ArrowRight":
          setVideoState((prev) => ({
            ...prev,
            currentTime: Math.min(prev.duration, prev.currentTime + 5),
          }));
          break;
        case "m":
          setVideoState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
          break;
        case "f":
          setVideoState((prev) => ({ ...prev, isFullscreen: !prev.isFullscreen }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Playback simulation
  useEffect(() => {
    if (!videoState.isPlaying) return;

    const interval = setInterval(() => {
      setVideoState((prev) => {
        if (prev.currentTime >= prev.duration) {
          return { ...prev, isPlaying: false, currentTime: 0 };
        }
        return { ...prev, currentTime: prev.currentTime + 0.1 * prev.playbackRate };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [videoState.isPlaying, videoState.playbackRate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim() || isProcessing) return;

    const newEdit: Edit = {
      id: Date.now().toString(),
      prompt: prompt.trim(),
      status: "processing",
      timestamp: new Date(),
    };

    setEditHistory((prev) => [newEdit, ...prev]);
    setPrompt("");
    setIsProcessing(true);

    // Simulate AI processing with realistic stages
    setTimeout(() => {
      setEditHistory((prev) =>
        prev.map((edit) =>
          edit.id === newEdit.id
            ? {
                ...edit,
                status: "complete",
                description: "Applied successfully",
                commands: ["Analyzed video", "Generated FFmpeg command", "Applied changes"],
              }
            : edit
        )
      );
      setIsProcessing(false);
    }, 2500 + Math.random() * 1500);
  };

  const tools = [
    {
      id: "cut",
      icon: Scissors,
      label: "Cut & Trim",
      prompt: "Cut from ",
      description: "Remove or keep specific parts",
    },
    {
      id: "captions",
      icon: Type,
      label: "Captions",
      prompt: "Add captions",
      description: "Auto-generate subtitles",
    },
    {
      id: "audio",
      icon: Music,
      label: "Audio",
      prompt: "Adjust audio ",
      description: "Volume, noise, music",
    },
    {
      id: "color",
      icon: Palette,
      label: "Color",
      prompt: "Apply ",
      description: "Color grading & filters",
    },
    {
      id: "effects",
      icon: Wand2,
      label: "Effects",
      prompt: "Add ",
      description: "Transitions & effects",
    },
    {
      id: "export",
      icon: Layers,
      label: "Format",
      prompt: "Export as ",
      description: "Resolution & aspect ratio",
    },
  ];

  const quickActions = [
    { label: "Remove silences", prompt: "Remove all silent parts longer than 1 second" },
    { label: "Add fade in/out", prompt: "Add 1 second fade in at start and fade out at end" },
    { label: "Normalize audio", prompt: "Normalize audio levels" },
    { label: "Auto color correct", prompt: "Apply automatic color correction" },
    { label: "Generate captions", prompt: "Generate and add English captions" },
    { label: "Create 9:16 version", prompt: "Export as 9:16 aspect ratio for TikTok" },
  ];

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="h-screen flex flex-col bg-void-950 overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-void-800 flex items-center justify-between px-4 bg-void-900/50 backdrop-blur-xl flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spark-400 to-spark-600 flex items-center justify-center shadow-md shadow-spark-500/30">
              <Film className="w-4 h-4 text-void-950" />
            </div>
          </Link>
          <div className="h-6 w-px bg-void-700" />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-zinc-100 font-medium focus:outline-none focus:ring-1 focus:ring-spark-500/50 rounded px-2 py-1 max-w-[200px]"
          />
          <span className="badge badge-mint text-xs">Auto-saved</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-ghost flex items-center gap-1.5 text-sm">
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>
          <button className="btn-ghost flex items-center gap-1.5 text-sm">
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>
          <div className="h-6 w-px bg-void-700 mx-1" />
          <button className="btn-ghost flex items-center gap-1.5 text-sm">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="btn-secondary flex items-center gap-2 text-sm py-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-glow flex items-center gap-2 text-sm py-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <aside className="w-72 border-r border-void-800 bg-void-900/30 flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-void-800">
            <button
              onClick={() => setActiveTab("tools")}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
                activeTab === "tools"
                  ? "text-spark-400 border-b-2 border-spark-400 bg-spark-500/5"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Wand2 className="w-4 h-4 inline mr-2" />
              Tools
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === "history"
                  ? "text-spark-400 border-b-2 border-spark-400 bg-spark-500/5"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              History
              {editHistory.length > 0 && (
                <span className="absolute top-2 right-4 w-5 h-5 rounded-full bg-spark-500 text-[10px] flex items-center justify-center text-void-950 font-bold">
                  {editHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeTab === "tools" ? (
                <motion.div
                  key="tools"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-1"
                >
                  {tools.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setPrompt(tool.prompt)}
                      className="tool-item w-full group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-void-800 group-hover:bg-spark-500/20 flex items-center justify-center transition-colors">
                        <tool.icon className="w-4 h-4 text-zinc-400 group-hover:text-spark-400 transition-colors" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">{tool.label}</span>
                        <p className="text-xs text-zinc-500">{tool.description}</p>
                      </div>
                    </button>
                  ))}

                  <div className="pt-5">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-3 mb-3">
                      Quick Actions
                    </p>
                    <div className="space-y-1">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => {
                            setPrompt(action.prompt);
                          }}
                          className="w-full text-left px-3 py-2.5 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-void-800/50 rounded-lg transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-2"
                >
                  {editHistory.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No edits yet</p>
                      <p className="text-xs mt-1 text-zinc-600">
                        Start by typing a prompt below
                      </p>
                    </div>
                  ) : (
                    editHistory.map((edit) => (
                      <motion.div
                        key={edit.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-void-800/50 border border-void-700/50 group"
                      >
                        <div className="flex items-start gap-2.5">
                          {edit.status === "processing" ? (
                            <div className="w-6 h-6 rounded-full bg-spark-500/20 flex items-center justify-center flex-shrink-0">
                              <Loader2 className="w-3.5 h-3.5 text-spark-400 animate-spin" />
                            </div>
                          ) : edit.status === "complete" ? (
                            <div className="w-6 h-6 rounded-full bg-mint-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 text-mint-400" />
                            </div>
                          ) : edit.status === "error" ? (
                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-void-700 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-200 leading-relaxed">
                              {edit.prompt}
                            </p>
                            {edit.description && (
                              <p className="text-xs text-mint-400 mt-1">
                                {edit.description}
                              </p>
                            )}
                            <p className="text-[10px] text-zinc-600 mt-1.5">
                              {edit.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-void-700 rounded transition-all">
                            <MoreVertical className="w-4 h-4 text-zinc-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Video Preview */}
          <div
            ref={containerRef}
            className="flex-1 p-6 flex items-center justify-center bg-void-950 relative overflow-hidden"
          >
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-grid opacity-30" />

            <div
              className="video-container w-full max-w-5xl shadow-2xl shadow-black/50 relative"
              style={{ transform: `scale(${zoom})` }}
            >
              {videoFile ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-void-900 via-void-950 to-void-900">
                  <div className="text-center">
                    <Film className="w-20 h-20 text-void-700 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">{videoFile.name}</p>
                    <p className="text-zinc-600 text-sm mt-1">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-void-900 to-void-950">
                  <div className="text-center">
                    <Film className="w-20 h-20 text-void-700 mx-auto mb-4" />
                    <p className="text-zinc-500">No video loaded</p>
                  </div>
                </div>
              )}

              {/* Processing overlay */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-void-950/90 backdrop-blur-md flex items-center justify-center z-10"
                  >
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl bg-spark-500/20 flex items-center justify-center mx-auto mb-5 relative">
                        <Sparkles className="w-10 h-10 text-spark-400" />
                        <div className="absolute inset-0 rounded-2xl border-2 border-spark-500/30 animate-ping" />
                      </div>
                      <p className="text-zinc-100 font-medium mb-2 text-lg">
                        Processing your edit...
                      </p>
                      <p className="text-zinc-500 text-sm mb-4">
                        This may take a moment
                      </p>
                      <div className="w-56 h-1.5 bg-void-800 rounded-full overflow-hidden">
                        <div className="processing-bar h-full" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Playback controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  onClick={() =>
                    setVideoState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                  }
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  {videoState.isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-void-900/80 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                className="btn-icon p-1.5"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400 px-2 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="btn-icon p-1.5"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => setZoom(1)} className="btn-icon p-1.5">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="p-4 border-t border-void-800 bg-void-900/50">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-spark-400" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitPrompt()}
                  placeholder="Describe what you want to do... (e.g., 'Cut the first 10 seconds and add captions')"
                  className="w-full bg-void-800/80 border border-void-700/50 rounded-2xl pl-12 pr-28 py-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-spark-500/50 focus:border-spark-500/50 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span className="text-xs text-zinc-600 mr-2 hidden sm:inline">
                    Press Enter ↵
                  </span>
                  <button
                    onClick={handleSubmitPrompt}
                    disabled={!prompt.trim() || isProcessing}
                    className="btn-glow py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Controls */}
          <div className="border-t border-void-800 bg-void-900/50 p-4 flex-shrink-0">
            <div className="max-w-6xl mx-auto">
              {/* Playback Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setVideoState((prev) => ({
                        ...prev,
                        currentTime: Math.max(0, prev.currentTime - 10),
                      }))
                    }
                    className="btn-ghost p-2"
                    title="Back 10s"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setVideoState((prev) => ({
                        ...prev,
                        isPlaying: !prev.isPlaying,
                      }))
                    }
                    className="w-11 h-11 rounded-full bg-spark-500 hover:bg-spark-400 flex items-center justify-center transition-colors shadow-lg shadow-spark-500/30"
                  >
                    {videoState.isPlaying ? (
                      <Pause className="w-5 h-5 text-void-950" />
                    ) : (
                      <Play className="w-5 h-5 text-void-950 ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setVideoState((prev) => ({
                        ...prev,
                        currentTime: Math.min(prev.duration, prev.currentTime + 10),
                      }))
                    }
                    className="btn-ghost p-2"
                    title="Forward 10s"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-mono text-zinc-400 bg-void-800/50 px-3 py-1.5 rounded-lg">
                  <span className="text-zinc-100">
                    {formatTime(videoState.currentTime)}
                  </span>
                  <span className="mx-1.5 text-zinc-600">/</span>
                  <span>{formatTime(videoState.duration)}</span>
                </div>

                <div className="flex-1" />

                {/* Playback speed */}
                <div className="relative group">
                  <button className="btn-ghost flex items-center gap-1.5 text-sm">
                    {videoState.playbackRate}x
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="dropdown-menu bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {playbackSpeeds.map((speed) => (
                      <button
                        key={speed}
                        onClick={() =>
                          setVideoState((prev) => ({ ...prev, playbackRate: speed }))
                        }
                        className={`dropdown-item justify-center ${
                          videoState.playbackRate === speed ? "text-spark-400" : ""
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setVideoState((prev) => ({ ...prev, isMuted: !prev.isMuted }))
                    }
                    className="btn-ghost p-2"
                  >
                    {videoState.isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={videoState.isMuted ? 0 : videoState.volume}
                    onChange={(e) =>
                      setVideoState((prev) => ({
                        ...prev,
                        volume: parseFloat(e.target.value),
                        isMuted: false,
                      }))
                    }
                    className="w-20"
                  />
                </div>

                <button
                  onClick={() =>
                    setVideoState((prev) => ({
                      ...prev,
                      isFullscreen: !prev.isFullscreen,
                    }))
                  }
                  className="btn-ghost p-2"
                >
                  {videoState.isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Timeline */}
              <div
                ref={timelineRef}
                className="timeline-track h-20 relative cursor-pointer"
                onClick={(e) => {
                  const rect = timelineRef.current?.getBoundingClientRect();
                  if (rect) {
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    setVideoState((prev) => ({
                      ...prev,
                      currentTime: percentage * prev.duration,
                    }));
                  }
                }}
              >
                {/* Timeline background grid */}
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-void-600"
                      style={{ left: `${(i + 1) * (100 / 24)}%` }}
                    />
                  ))}
                </div>

                {/* Video clip representation */}
                <div className="timeline-clip absolute inset-y-3 left-0 right-0">
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-spark-200" />
                      <span className="text-xs font-medium text-spark-200">
                        {videoFile?.name || "Main Video"}
                      </span>
                    </div>
                  </div>

                  {/* Waveform visualization placeholder */}
                  <div className="absolute inset-x-4 bottom-2 h-6 flex items-end gap-[2px]">
                    {Array.from({ length: 100 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-spark-500/40 rounded-t-sm"
                        style={{
                          height: `${20 + Math.sin(i * 0.3) * 15 + Math.random() * 10}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                  style={{
                    left: `${(videoState.currentTime / videoState.duration) * 100}%`,
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
                </div>

                {/* Time markers */}
                <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-1 text-[10px] text-zinc-600">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i}>
                      {formatTime((videoState.duration / 6) * i).slice(0, -2)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="dialog-overlay"
              onClick={() => setShowExportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="dialog-content"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-zinc-100">Export Video</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn-icon"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["MP4", "MOV", "WebM", "GIF"].map((format) => (
                      <button
                        key={format}
                        className="px-4 py-2.5 rounded-xl bg-void-800 border border-void-700 text-zinc-300 hover:border-spark-500/50 hover:text-zinc-100 transition-colors text-sm font-medium"
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Resolution
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["4K", "1080p", "720p", "480p"].map((res) => (
                      <button
                        key={res}
                        className="px-4 py-2.5 rounded-xl bg-void-800 border border-void-700 text-zinc-300 hover:border-spark-500/50 hover:text-zinc-100 transition-colors text-sm font-medium"
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {["16:9", "9:16", "1:1", "4:5", "21:9"].map((ratio) => (
                      <button
                        key={ratio}
                        className="px-3 py-2.5 rounded-xl bg-void-800 border border-void-700 text-zinc-300 hover:border-spark-500/50 hover:text-zinc-100 transition-colors text-sm font-medium"
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">
                    Quality
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["High", "Medium", "Low"].map((quality) => (
                      <button
                        key={quality}
                        className="px-4 py-2.5 rounded-xl bg-void-800 border border-void-700 text-zinc-300 hover:border-spark-500/50 hover:text-zinc-100 transition-colors text-sm font-medium"
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn-glow flex-1 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

