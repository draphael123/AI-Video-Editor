"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Film,
  Sparkles,
  Scissors,
  Type,
  Music,
  Palette,
  Wand2,
  ArrowRight,
  FileVideo,
  X,
  Zap,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projectId, setProjectId] = useState<string | null>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      simulateUpload(file);
    }
  }, []);

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const newProjectId = `proj_${Date.now()}`;
    setProjectId(newProjectId);

    // Store file info in sessionStorage for the editor
    sessionStorage.setItem(
      `clipcraft_${newProjectId}`,
      JSON.stringify({
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      })
    );

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const features = [
    {
      icon: Scissors,
      title: "Smart Cutting",
      description:
        "Remove silences, trim clips, or cut to specific timestamps with natural commands",
      color: "from-spark-500/20 to-spark-600/10",
    },
    {
      icon: Type,
      title: "Auto Captions",
      description:
        "Generate accurate subtitles with speaker detection and custom styling",
      color: "from-mint-500/20 to-mint-600/10",
    },
    {
      icon: Palette,
      title: "Color Grading",
      description:
        "Apply cinematic looks, adjust colors, or match the style of reference videos",
      color: "from-purple-500/20 to-purple-600/10",
    },
    {
      icon: Music,
      title: "Audio Magic",
      description:
        "Add background music, remove noise, and auto-balance audio levels",
      color: "from-blue-500/20 to-blue-600/10",
    },
    {
      icon: Wand2,
      title: "AI Effects",
      description:
        "Generate thumbnails, add transitions, and apply intelligent enhancements",
      color: "from-amber-500/20 to-amber-600/10",
    },
    {
      icon: Zap,
      title: "Multi-Platform Export",
      description:
        "Export in any aspect ratio for TikTok, YouTube, Instagram, and more",
      color: "from-rose-500/20 to-rose-600/10",
    },
  ];

  const examplePrompts = [
    "Cut the first 10 seconds and add captions",
    "Remove all the ums and pauses",
    "Make it look cinematic with warm colors",
    "Create a 60-second highlight reel",
    "Add upbeat background music",
    "Export as 9:16 for TikTok",
  ];

  return (
    <div className="min-h-screen noise-overlay">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-void-800/50 bg-void-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-spark-400 to-spark-600 flex items-center justify-center shadow-lg shadow-spark-500/30">
              <Film className="w-5 h-5 text-void-950" />
            </div>
            <span className="text-xl font-semibold text-zinc-100 tracking-tight">
              ClipCraft
            </span>
            <span className="badge badge-spark ml-1">AI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
            >
              How it works
            </a>
            <a
              href="#"
              className="text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="btn-ghost text-sm">Sign in</button>
            <button className="btn-glow text-sm py-2.5">Get Started Free</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-24 px-6 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-spark-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-mint-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-spark-500/10 border border-spark-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-spark-400" />
              <span className="text-sm text-spark-300 font-medium">
                AI-Powered Video Editing
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Edit videos with
            <br />
            <span className="text-gradient">natural language</span>
          </motion.h1>

          <motion.p
            className="text-xl text-zinc-400 mb-14 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Just tell ClipCraft what you want. Cut, enhance, add captions, and
            export—all with simple prompts. No timeline wrestling required.
          </motion.p>

          {/* Upload Area */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative p-12 rounded-3xl border-2 border-dashed cursor-pointer
                transition-all duration-300 group
                ${
                  isDragActive
                    ? "border-spark-400 bg-spark-500/10 scale-[1.02]"
                    : "border-void-600 hover:border-spark-500/50 hover:bg-void-900/50"
                }
              `}
            >
              <input {...getInputProps()} />

              <AnimatePresence mode="wait">
                {uploadedFile ? (
                  <motion.div
                    key="uploaded"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-spark-500/20 flex items-center justify-center mx-auto mb-5 relative">
                          <FileVideo className="w-10 h-10 text-spark-400" />
                          <div className="absolute inset-0 rounded-2xl border-2 border-spark-500/50 animate-ping" />
                        </div>
                        <p className="text-zinc-100 font-medium mb-2 text-lg">
                          {uploadedFile.name}
                        </p>
                        <div className="max-w-xs mx-auto mb-4">
                          <div className="h-2 bg-void-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-spark-500 to-spark-400"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(uploadProgress, 100)}%`,
                              }}
                              transition={{ duration: 0.2 }}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500">
                          Processing... {Math.round(Math.min(uploadProgress, 100))}%
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-2xl bg-mint-500/20 flex items-center justify-center mx-auto mb-5">
                          <FileVideo className="w-10 h-10 text-mint-400" />
                        </div>
                        <p className="text-zinc-100 font-medium mb-2 text-lg">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-zinc-500 mb-6">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB •
                          Ready to edit
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/editor/${projectId}`);
                          }}
                          className="btn-glow inline-flex items-center gap-2 text-base"
                        >
                          <Play className="w-4 h-4" />
                          Start Editing
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                            setProjectId(null);
                          }}
                          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-void-800 transition-colors"
                        >
                          <X className="w-5 h-5 text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    <div
                      className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5
                      transition-all duration-300
                      ${
                        isDragActive
                          ? "bg-spark-500/30 scale-110"
                          : "bg-void-800 group-hover:bg-spark-500/20"
                      }
                    `}
                    >
                      <Upload
                        className={`w-10 h-10 transition-all duration-300 ${
                          isDragActive
                            ? "text-spark-400 scale-110"
                            : "text-zinc-500 group-hover:text-spark-400"
                        }`}
                      />
                    </div>
                    <p className="text-zinc-100 font-medium mb-2 text-lg">
                      {isDragActive
                        ? "Drop your video here"
                        : "Drag and drop your video"}
                    </p>
                    <p className="text-sm text-zinc-500">
                      or click to browse • MP4, MOV, AVI, WebM up to 2GB
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Example Prompts */}
          <motion.div
            className="mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-sm text-zinc-500 mb-5">Try prompts like:</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {examplePrompts.map((prompt, index) => (
                <motion.span
                  key={prompt}
                  className="px-4 py-2.5 rounded-full bg-void-800/60 border border-void-700/50 text-sm text-zinc-400 hover:text-zinc-100 hover:border-spark-500/30 hover:bg-void-800 cursor-pointer transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
                >
                  "{prompt}"
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge badge-spark mb-4">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
              Everything you need to edit
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Powerful AI tools that understand what you want and deliver
              professional results in seconds
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-7 group hover:border-spark-500/30 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-spark-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-28 px-6 bg-void-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="badge badge-mint mb-4">How it works</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight">
              Three steps to perfect video
            </h2>
            <p className="text-xl text-zinc-400">
              From raw footage to polished content in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Upload",
                description:
                  "Drop your video file into ClipCraft. We support all major formats up to 2GB.",
                icon: Upload,
              },
              {
                step: "02",
                title: "Prompt",
                description:
                  "Tell us what you want in plain English. Edit, enhance, or transform your video.",
                icon: Sparkles,
              },
              {
                step: "03",
                title: "Export",
                description:
                  "Preview your changes and export in any format or aspect ratio you need.",
                icon: Zap,
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="text-7xl font-bold text-spark-500/15 mb-5 leading-none">
                  {item.step}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-void-800 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-spark-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-zinc-100">
                    {item.title}
                  </h3>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  {item.description}
                </p>

                {index < 2 && (
                  <div className="hidden md:block absolute top-10 -right-5 translate-x-1/2">
                    <ArrowRight className="w-6 h-6 text-void-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4 tracking-tight">
              See it in action
            </h2>
            <p className="text-zinc-400 text-lg">
              Watch how ClipCraft transforms your editing workflow
            </p>
          </motion.div>

          <motion.div
            className="video-container shadow-2xl shadow-black/40"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-void-900 to-void-950">
              <button className="w-20 h-20 rounded-full bg-spark-500 hover:bg-spark-400 flex items-center justify-center transition-all hover:scale-110 shadow-2xl shadow-spark-500/50">
                <Play className="w-8 h-8 text-void-950 ml-1" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-12 relative overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-spark-500/10 via-transparent to-mint-500/10 pointer-events-none" />

            <h2 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight relative">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 relative">
              Join thousands of content creators who edit videos 10x faster with AI.
            </p>
            <button className="btn-glow text-lg px-10 py-4 relative">
              Start editing for free
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </button>
            <p className="text-sm text-zinc-500 mt-5 relative">
              No credit card required • 5 free exports per month
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-void-800 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spark-400 to-spark-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-void-950" />
            </div>
            <span className="text-sm text-zinc-500">
              © 2024 ClipCraft AI. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

