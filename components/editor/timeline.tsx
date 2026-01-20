"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Film, Music, Type, Image } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface TimelineClip {
  id: string;
  type: "video" | "audio" | "text" | "image";
  startTime: number;
  endTime: number;
  track: number;
  name: string;
}

interface TimelineProps {
  currentTime: number;
  duration: number;
  clips?: TimelineClip[];
  selectedClipId?: string | null;
  zoom?: number;
  onSeek: (time: number) => void;
  onClipSelect?: (id: string) => void;
  className?: string;
}

export function Timeline({
  currentTime,
  duration,
  clips = [],
  selectedClipId,
  zoom = 1,
  onSeek,
  onClipSelect,
  className,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      onSeek(percentage * duration);
    },
    [duration, onSeek]
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = x / rect.width;
      onSeek(percentage * duration);
    },
    [isDragging, duration, onSeek]
  );

  const getClipIcon = (type: string) => {
    switch (type) {
      case "video":
        return Film;
      case "audio":
        return Music;
      case "text":
        return Type;
      case "image":
        return Image;
      default:
        return Film;
    }
  };

  const timeMarkers = [];
  const markerCount = Math.ceil(duration / 10);
  for (let i = 0; i <= markerCount; i++) {
    timeMarkers.push(i * 10);
  }

  return (
    <div className={cn("timeline-track relative", className)}>
      <div
        ref={timelineRef}
        className="h-20 relative cursor-pointer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
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

        {/* Default video clip when no clips provided */}
        {clips.length === 0 && (
          <div className="timeline-clip absolute inset-y-3 left-0 right-0">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-spark-200" />
                <span className="text-xs font-medium text-spark-200">Main Video</span>
              </div>
            </div>

            {/* Waveform visualization */}
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
        )}

        {/* Render clips */}
        {clips.map((clip) => {
          const ClipIcon = getClipIcon(clip.type);
          const left = (clip.startTime / duration) * 100;
          const width = ((clip.endTime - clip.startTime) / duration) * 100;

          return (
            <motion.div
              key={clip.id}
              className={cn(
                "absolute rounded-lg border cursor-pointer transition-colors",
                clip.type === "video" && "bg-gradient-to-r from-spark-600/30 to-spark-500/20 border-spark-500/40",
                clip.type === "audio" && "bg-gradient-to-r from-mint-600/30 to-mint-500/20 border-mint-500/40",
                clip.type === "text" && "bg-gradient-to-r from-purple-600/30 to-purple-500/20 border-purple-500/40",
                clip.type === "image" && "bg-gradient-to-r from-blue-600/30 to-blue-500/20 border-blue-500/40",
                selectedClipId === clip.id && "ring-2 ring-white"
              )}
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${clip.track * 24 + 12}px`,
                height: "20px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClipSelect?.(clip.id);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
                <ClipIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="text-[10px] font-medium truncate">{clip.name}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
        </div>

        {/* Time markers */}
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-1 text-[10px] text-zinc-600">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i}>{formatTime((duration / 6) * i)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

