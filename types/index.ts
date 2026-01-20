// Video command types (re-exported from parser)
export type {
  VideoCommand,
  ParsedPromptResult,
} from "@/lib/ai/prompt-parser";

// FFmpeg types (re-exported from commands)
export type { FFmpegOperation, FFmpegPipeline } from "@/lib/video/ffmpeg-commands";

// Editor types (re-exported from store)
export type {
  VideoMetadata,
  Edit,
  TimelineClip,
  ExportSettings,
} from "@/stores/editor-store";

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  projectId: string;
  url: string;
  metadata: {
    name: string;
    size: number;
    type: string;
  };
}

export interface ProcessResponse {
  commands: VideoCommand[];
  explanation: string;
  confidence: number;
  warnings?: string[];
  ffmpegCommands?: string[];
}

export interface ExportJobResponse {
  jobId: string;
  status: "queued" | "processing" | "complete" | "error";
  progress?: number;
  downloadUrl?: string;
  error?: string;
}

// Utility types
export type VideoFormat = "mp4" | "mov" | "webm" | "gif";
export type VideoResolution = "4k" | "1080p" | "720p" | "480p" | "original";
export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5" | "21:9" | "original";
export type QualityPreset = "high" | "medium" | "low";
export type ColorPreset = "cinematic" | "vintage" | "vibrant" | "moody" | "warm" | "cool" | "noir";

// Tool definitions for the editor sidebar
export interface EditorTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  prompt: string;
  description: string;
}

// Quick action definitions
export interface QuickAction {
  label: string;
  prompt: string;
}

// Video command types
import type { VideoCommand } from "@/lib/ai/prompt-parser";

