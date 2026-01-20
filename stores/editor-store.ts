import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Types
export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

export interface Edit {
  id: string;
  prompt: string;
  status: "pending" | "processing" | "complete" | "error";
  timestamp: Date;
  description?: string;
  commands?: string[];
  error?: string;
}

export interface TimelineClip {
  id: string;
  type: "video" | "audio" | "text" | "image";
  startTime: number;
  endTime: number;
  track: number;
  name: string;
  data?: unknown;
}

export interface ExportSettings {
  format: "mp4" | "mov" | "webm" | "gif";
  resolution: "4k" | "1080p" | "720p" | "480p" | "original";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "21:9" | "original";
  quality: "high" | "medium" | "low";
  fps: number;
}

// State interface
interface EditorState {
  // Project
  projectId: string | null;
  projectName: string;
  videoFile: File | null;
  videoUrl: string | null;
  videoMetadata: VideoMetadata | null;

  // Playback
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;

  // Timeline
  zoom: number;
  clips: TimelineClip[];
  selectedClipId: string | null;

  // Editing
  editHistory: Edit[];
  undoStack: Edit[][];
  redoStack: Edit[][];

  // UI
  activeTab: "tools" | "history";
  isProcessing: boolean;
  showExportModal: boolean;

  // Export
  exportSettings: ExportSettings;
}

// Actions interface
interface EditorActions {
  // Project actions
  setProject: (projectId: string, name: string) => void;
  setVideoFile: (file: File, url: string) => void;
  setVideoMetadata: (metadata: VideoMetadata) => void;
  setProjectName: (name: string) => void;

  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;

  // Timeline actions
  setZoom: (zoom: number) => void;
  addClip: (clip: TimelineClip) => void;
  updateClip: (id: string, updates: Partial<TimelineClip>) => void;
  removeClip: (id: string) => void;
  selectClip: (id: string | null) => void;

  // Edit actions
  addEdit: (edit: Edit) => void;
  updateEditStatus: (
    id: string,
    status: Edit["status"],
    description?: string,
    commands?: string[]
  ) => void;
  undo: () => void;
  redo: () => void;

  // UI actions
  setActiveTab: (tab: "tools" | "history") => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setShowExportModal: (show: boolean) => void;

  // Export actions
  setExportSettings: (settings: Partial<ExportSettings>) => void;

  // Reset
  reset: () => void;
}

// Initial state
const initialState: EditorState = {
  projectId: null,
  projectName: "Untitled Project",
  videoFile: null,
  videoUrl: null,
  videoMetadata: null,

  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,

  zoom: 1,
  clips: [],
  selectedClipId: null,

  editHistory: [],
  undoStack: [],
  redoStack: [],

  activeTab: "tools",
  isProcessing: false,
  showExportModal: false,

  exportSettings: {
    format: "mp4",
    resolution: "1080p",
    aspectRatio: "16:9",
    quality: "high",
    fps: 30,
  },
};

// Create store
export const useEditorStore = create<EditorState & EditorActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Project actions
        setProject: (projectId, name) => set({ projectId, projectName: name }),

        setVideoFile: (file, url) => set({ videoFile: file, videoUrl: url }),

        setVideoMetadata: (metadata) => set({ videoMetadata: metadata }),

        setProjectName: (name) => set({ projectName: name }),

        // Playback actions
        play: () => set({ isPlaying: true }),

        pause: () => set({ isPlaying: false }),

        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

        seek: (time) => {
          const { videoMetadata } = get();
          const duration = videoMetadata?.duration || 0;
          set({ currentTime: Math.max(0, Math.min(time, duration)) });
        },

        setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

        toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

        setPlaybackRate: (rate) => set({ playbackRate: rate }),

        toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

        // Timeline actions
        setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

        addClip: (clip) =>
          set((state) => ({
            clips: [...state.clips, clip],
          })),

        updateClip: (id, updates) =>
          set((state) => ({
            clips: state.clips.map((clip) =>
              clip.id === id ? { ...clip, ...updates } : clip
            ),
          })),

        removeClip: (id) =>
          set((state) => ({
            clips: state.clips.filter((clip) => clip.id !== id),
            selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
          })),

        selectClip: (id) => set({ selectedClipId: id }),

        // Edit actions
        addEdit: (edit) =>
          set((state) => ({
            editHistory: [edit, ...state.editHistory],
            undoStack: [state.editHistory, ...state.undoStack],
            redoStack: [],
          })),

        updateEditStatus: (id, status, description, commands) =>
          set((state) => ({
            editHistory: state.editHistory.map((edit) =>
              edit.id === id ? { ...edit, status, description, commands } : edit
            ),
          })),

        undo: () => {
          const { undoStack, editHistory, redoStack } = get();
          if (undoStack.length === 0) return;

          const [previousHistory, ...rest] = undoStack;
          set({
            editHistory: previousHistory,
            undoStack: rest,
            redoStack: [editHistory, ...redoStack],
          });
        },

        redo: () => {
          const { undoStack, editHistory, redoStack } = get();
          if (redoStack.length === 0) return;

          const [nextHistory, ...rest] = redoStack;
          set({
            editHistory: nextHistory,
            redoStack: rest,
            undoStack: [editHistory, ...undoStack],
          });
        },

        // UI actions
        setActiveTab: (tab) => set({ activeTab: tab }),

        setIsProcessing: (isProcessing) => set({ isProcessing }),

        setShowExportModal: (show) => set({ showExportModal: show }),

        // Export actions
        setExportSettings: (settings) =>
          set((state) => ({
            exportSettings: { ...state.exportSettings, ...settings },
          })),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: "clipcraft-editor",
        partialize: (state) => ({
          projectName: state.projectName,
          exportSettings: state.exportSettings,
        }),
      }
    ),
    { name: "EditorStore" }
  )
);

