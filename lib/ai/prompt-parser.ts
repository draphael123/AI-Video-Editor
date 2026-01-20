import Anthropic from "@anthropic-ai/sdk";

// Types for video editing commands
export type VideoCommand =
  | TrimCommand
  | CutCommand
  | AddCaptionsCommand
  | ColorCorrectionCommand
  | AudioCommand
  | TransitionCommand
  | ExportCommand
  | EffectCommand
  | SilenceRemovalCommand
  | ThumbnailCommand;

interface TrimCommand {
  type: "trim";
  startTime: number; // in seconds
  endTime: number;
}

interface CutCommand {
  type: "cut";
  segments: Array<{
    startTime: number;
    endTime: number;
  }>;
}

interface SilenceRemovalCommand {
  type: "remove_silence";
  threshold: number; // in dB, default -30
  minDuration: number; // minimum silence duration to remove, in seconds
  padding: number; // padding to keep around speech, in seconds
}

interface AddCaptionsCommand {
  type: "add_captions";
  style: {
    fontFamily: string;
    fontSize: number;
    fontColor: string;
    backgroundColor: string;
    position: "bottom" | "top" | "center";
    outline: boolean;
  };
  language: string;
}

interface ColorCorrectionCommand {
  type: "color_correction";
  adjustments: {
    brightness?: number; // -1 to 1
    contrast?: number; // -1 to 1
    saturation?: number; // -1 to 1
    temperature?: number; // -1 (cool) to 1 (warm)
    tint?: number; // -1 to 1
    exposure?: number; // -1 to 1
  };
  preset?: "cinematic" | "vintage" | "vibrant" | "moody" | "warm" | "cool" | "noir";
}

interface AudioCommand {
  type: "audio";
  action:
    | "normalize"
    | "reduce_noise"
    | "add_music"
    | "adjust_volume"
    | "ducking"
    | "fade_in"
    | "fade_out";
  params: {
    volume?: number; // 0 to 2 (1 is normal)
    musicUrl?: string;
    musicVolume?: number;
    fadeDuration?: number; // in seconds
    noiseReduction?: number; // 0 to 1
  };
}

interface TransitionCommand {
  type: "transition";
  transitionType: "fade" | "dissolve" | "wipe" | "slide" | "zoom" | "blur";
  duration: number; // in seconds
  position: "between_clips" | "start" | "end" | "all";
}

interface EffectCommand {
  type: "effect";
  effectName: string;
  intensity: number; // 0 to 1
  params?: Record<string, unknown>;
}

interface ExportCommand {
  type: "export";
  format: "mp4" | "mov" | "webm" | "gif";
  resolution: "4k" | "1080p" | "720p" | "480p" | "original";
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "21:9" | "original";
  quality: "high" | "medium" | "low";
  fps: number;
}

interface ThumbnailCommand {
  type: "thumbnail";
  count: number;
  style?: "auto" | "text_overlay" | "collage";
  timestamps?: number[]; // specific timestamps to capture
}

// Parsed result from AI
export interface ParsedPromptResult {
  commands: VideoCommand[];
  explanation: string;
  confidence: number;
  warnings?: string[];
}

// System prompt for Claude
const SYSTEM_PROMPT = `You are an AI assistant that parses natural language video editing requests into structured commands.

You must respond with valid JSON only, no other text. The response should match this structure:
{
  "commands": [...],
  "explanation": "Brief explanation of what will be done",
  "confidence": 0.95,
  "warnings": ["Optional warnings about the request"]
}

Available command types and their structures:

1. TRIM - Keep only a portion of the video
{
  "type": "trim",
  "startTime": <seconds>,
  "endTime": <seconds>
}

2. CUT - Remove specific segments
{
  "type": "cut",
  "segments": [{ "startTime": <seconds>, "endTime": <seconds> }]
}

3. REMOVE_SILENCE - Remove silent parts
{
  "type": "remove_silence",
  "threshold": -30,
  "minDuration": 1,
  "padding": 0.2
}

4. ADD_CAPTIONS - Generate and add subtitles
{
  "type": "add_captions",
  "style": {
    "fontFamily": "Arial",
    "fontSize": 24,
    "fontColor": "#FFFFFF",
    "backgroundColor": "#000000CC",
    "position": "bottom",
    "outline": true
  },
  "language": "en"
}

5. COLOR_CORRECTION - Adjust colors
{
  "type": "color_correction",
  "adjustments": {
    "brightness": <-1 to 1>,
    "contrast": <-1 to 1>,
    "saturation": <-1 to 1>,
    "temperature": <-1 to 1>,
    "exposure": <-1 to 1>
  },
  "preset": "cinematic" | "vintage" | "vibrant" | "moody" | "warm" | "cool" | "noir"
}

6. AUDIO - Audio adjustments
{
  "type": "audio",
  "action": "normalize" | "reduce_noise" | "add_music" | "adjust_volume" | "ducking" | "fade_in" | "fade_out",
  "params": {
    "volume": <0 to 2>,
    "musicVolume": <0 to 1>,
    "fadeDuration": <seconds>,
    "noiseReduction": <0 to 1>
  }
}

7. TRANSITION - Add transitions
{
  "type": "transition",
  "transitionType": "fade" | "dissolve" | "wipe" | "slide" | "zoom" | "blur",
  "duration": <seconds>,
  "position": "between_clips" | "start" | "end" | "all"
}

8. EFFECT - Apply visual effects
{
  "type": "effect",
  "effectName": "blur" | "sharpen" | "vignette" | "film_grain" | "slow_motion" | "speed_up" | "stabilize" | "zoom_in" | "zoom_out",
  "intensity": <0 to 1>,
  "params": {}
}

9. EXPORT - Export settings
{
  "type": "export",
  "format": "mp4" | "mov" | "webm" | "gif",
  "resolution": "4k" | "1080p" | "720p" | "480p" | "original",
  "aspectRatio": "16:9" | "9:16" | "1:1" | "4:5" | "21:9" | "original",
  "quality": "high" | "medium" | "low",
  "fps": 30
}

10. THUMBNAIL - Generate thumbnails
{
  "type": "thumbnail",
  "count": <number>,
  "style": "auto" | "text_overlay" | "collage"
}

Time format hints:
- "first 10 seconds" = startTime: 0, endTime: 10
- "from 1:30 to 2:15" = startTime: 90, endTime: 135
- "last 30 seconds" = requires video duration context
- "the beginning" = first ~5 seconds
- "the end" = last ~5 seconds

Parse the user's request and generate the appropriate commands. You can combine multiple commands for complex requests.`;

// Main parser class
export class PromptParser {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });
  }

  async parse(
    userPrompt: string,
    videoContext?: {
      duration: number;
      hasAudio: boolean;
      resolution: { width: number; height: number };
    }
  ): Promise<ParsedPromptResult> {
    const contextInfo = videoContext
      ? `
Video context:
- Duration: ${videoContext.duration} seconds (${this.formatTime(videoContext.duration)})
- Has audio: ${videoContext.hasAudio}
- Resolution: ${videoContext.resolution.width}x${videoContext.resolution.height}
`
      : "";

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `${contextInfo}

User request: "${userPrompt}"

Parse this request into video editing commands. Respond with JSON only.`,
          },
        ],
      });

      // Extract the text content
      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text response from AI");
      }

      // Parse the JSON response
      const result = JSON.parse(textContent.text) as ParsedPromptResult;

      // Validate and sanitize commands
      result.commands = this.validateCommands(result.commands, videoContext?.duration);

      return result;
    } catch (error) {
      console.error("Error parsing prompt:", error);

      // Return a fallback response
      return {
        commands: [],
        explanation: "I couldn't understand that request. Please try rephrasing.",
        confidence: 0,
        warnings: ["Failed to parse the request. Please try again with a clearer description."],
      };
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private validateCommands(
    commands: VideoCommand[],
    videoDuration?: number
  ): VideoCommand[] {
    return commands.map((cmd) => {
      // Validate time-based commands
      if (cmd.type === "trim") {
        cmd.startTime = Math.max(0, cmd.startTime);
        if (videoDuration) {
          cmd.endTime = Math.min(videoDuration, cmd.endTime);
        }
      }

      if (cmd.type === "cut") {
        cmd.segments = cmd.segments.map((seg) => ({
          startTime: Math.max(0, seg.startTime),
          endTime: videoDuration ? Math.min(videoDuration, seg.endTime) : seg.endTime,
        }));
      }

      // Validate color correction values
      if (cmd.type === "color_correction") {
        const adj = cmd.adjustments;
        if (adj.brightness !== undefined) adj.brightness = this.clamp(adj.brightness, -1, 1);
        if (adj.contrast !== undefined) adj.contrast = this.clamp(adj.contrast, -1, 1);
        if (adj.saturation !== undefined) adj.saturation = this.clamp(adj.saturation, -1, 1);
        if (adj.temperature !== undefined) adj.temperature = this.clamp(adj.temperature, -1, 1);
        if (adj.exposure !== undefined) adj.exposure = this.clamp(adj.exposure, -1, 1);
      }

      // Validate audio values
      if (cmd.type === "audio") {
        if (cmd.params.volume !== undefined) {
          cmd.params.volume = this.clamp(cmd.params.volume, 0, 2);
        }
        if (cmd.params.musicVolume !== undefined) {
          cmd.params.musicVolume = this.clamp(cmd.params.musicVolume, 0, 1);
        }
        if (cmd.params.noiseReduction !== undefined) {
          cmd.params.noiseReduction = this.clamp(cmd.params.noiseReduction, 0, 1);
        }
      }

      // Validate effect intensity
      if (cmd.type === "effect") {
        cmd.intensity = this.clamp(cmd.intensity, 0, 1);
      }

      return cmd;
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

// Singleton instance for API routes
let parserInstance: PromptParser | null = null;

export function getPromptParser(): PromptParser {
  if (!parserInstance) {
    parserInstance = new PromptParser();
  }
  return parserInstance;
}

