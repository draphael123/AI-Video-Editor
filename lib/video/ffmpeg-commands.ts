/**
 * FFmpeg Command Generator
 * Converts parsed video commands into FFmpeg CLI commands
 */

import type { VideoCommand } from "../ai/prompt-parser";

export interface FFmpegOperation {
  command: string;
  description: string;
  estimatedDuration: number; // in seconds
  outputFile: string;
}

export interface FFmpegPipeline {
  operations: FFmpegOperation[];
  finalOutput: string;
}

export class FFmpegCommandGenerator {
  private inputFile: string;
  private outputDir: string;
  private tempCounter: number = 0;

  constructor(inputFile: string, outputDir: string = "/tmp/video-processing") {
    this.inputFile = inputFile;
    this.outputDir = outputDir;
  }

  /**
   * Generate FFmpeg commands for a list of video commands
   */
  generatePipeline(commands: VideoCommand[], videoDuration: number): FFmpegPipeline {
    const operations: FFmpegOperation[] = [];
    let currentInput = this.inputFile;

    for (const cmd of commands) {
      const operation = this.generateCommand(cmd, currentInput, videoDuration);
      if (operation) {
        operations.push(operation);
        currentInput = operation.outputFile;
      }
    }

    return {
      operations,
      finalOutput: currentInput,
    };
  }

  private getTempFile(extension: string = "mp4"): string {
    this.tempCounter++;
    return `${this.outputDir}/temp_${this.tempCounter}.${extension}`;
  }

  private generateCommand(
    cmd: VideoCommand,
    inputFile: string,
    videoDuration: number
  ): FFmpegOperation | null {
    switch (cmd.type) {
      case "trim":
        return this.generateTrimCommand(cmd, inputFile);
      case "cut":
        return this.generateCutCommand(cmd, inputFile, videoDuration);
      case "remove_silence":
        return this.generateSilenceRemovalCommand(cmd, inputFile);
      case "add_captions":
        return this.generateCaptionsCommand(cmd, inputFile);
      case "color_correction":
        return this.generateColorCorrectionCommand(cmd, inputFile);
      case "audio":
        return this.generateAudioCommand(cmd, inputFile);
      case "transition":
        return this.generateTransitionCommand(cmd, inputFile);
      case "effect":
        return this.generateEffectCommand(cmd, inputFile);
      case "export":
        return this.generateExportCommand(cmd, inputFile);
      case "thumbnail":
        return this.generateThumbnailCommand(cmd, inputFile, videoDuration);
      default:
        return null;
    }
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  private hexToASS(hex: string): string {
    // Convert hex color to ASS format (AABBGGRR)
    const clean = hex.replace("#", "");
    if (clean.length === 6) {
      const r = clean.substring(0, 2);
      const g = clean.substring(2, 4);
      const b = clean.substring(4, 6);
      return `00${b}${g}${r}`.toUpperCase();
    }
    return "00FFFFFF";
  }

  private generateTrimCommand(
    cmd: { type: "trim"; startTime: number; endTime: number },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();
    const duration = cmd.endTime - cmd.startTime;

    return {
      command: `ffmpeg -i "${inputFile}" -ss ${cmd.startTime} -t ${duration} -c copy "${outputFile}"`,
      description: `Trim video from ${this.formatTime(cmd.startTime)} to ${this.formatTime(cmd.endTime)}`,
      estimatedDuration: duration * 0.1,
      outputFile,
    };
  }

  private generateCutCommand(
    cmd: { type: "cut"; segments: Array<{ startTime: number; endTime: number }> },
    inputFile: string,
    videoDuration: number
  ): FFmpegOperation {
    const outputFile = this.getTempFile();

    const keepSegments: Array<{ start: number; end: number }> = [];
    let lastEnd = 0;

    const sortedSegments = [...cmd.segments].sort((a, b) => a.startTime - b.startTime);

    for (const seg of sortedSegments) {
      if (seg.startTime > lastEnd) {
        keepSegments.push({ start: lastEnd, end: seg.startTime });
      }
      lastEnd = seg.endTime;
    }

    if (lastEnd < videoDuration) {
      keepSegments.push({ start: lastEnd, end: videoDuration });
    }

    const filterParts: string[] = [];
    const concatInputs: string[] = [];

    keepSegments.forEach((seg, i) => {
      filterParts.push(
        `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}]`
      );
      filterParts.push(
        `[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`
      );
      concatInputs.push(`[v${i}][a${i}]`);
    });

    const filterComplex = `${filterParts.join("; ")}; ${concatInputs.join("")}concat=n=${keepSegments.length}:v=1:a=1[outv][outa]`;

    return {
      command: `ffmpeg -i "${inputFile}" -filter_complex "${filterComplex}" -map "[outv]" -map "[outa]" "${outputFile}"`,
      description: `Cut ${cmd.segments.length} segment(s) from video`,
      estimatedDuration: videoDuration * 0.3,
      outputFile,
    };
  }

  private generateSilenceRemovalCommand(
    cmd: {
      type: "remove_silence";
      threshold: number;
      minDuration: number;
      padding: number;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();

    const silenceFilter = `silenceremove=start_periods=1:start_duration=${cmd.minDuration}:start_threshold=${cmd.threshold}dB:detection=peak,areverse,silenceremove=start_periods=1:start_duration=${cmd.minDuration}:start_threshold=${cmd.threshold}dB:detection=peak,areverse`;

    return {
      command: `ffmpeg -i "${inputFile}" -af "${silenceFilter}" -c:v copy "${outputFile}"`,
      description: `Remove silent parts (threshold: ${cmd.threshold}dB, min duration: ${cmd.minDuration}s)`,
      estimatedDuration: 30,
      outputFile,
    };
  }

  private generateCaptionsCommand(
    cmd: {
      type: "add_captions";
      style: {
        fontFamily: string;
        fontSize: number;
        fontColor: string;
        backgroundColor: string;
        position: "bottom" | "top" | "center";
      };
      language: string;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();

    const subtitleStyle = `FontName=${cmd.style.fontFamily},FontSize=${cmd.style.fontSize},PrimaryColour=&H${this.hexToASS(cmd.style.fontColor)},BackColour=&H${this.hexToASS(cmd.style.backgroundColor)}`;

    return {
      command: `ffmpeg -i "${inputFile}" -vf "subtitles=captions.srt:force_style='${subtitleStyle}'" "${outputFile}"`,
      description: `Add ${cmd.language} captions with ${cmd.style.fontFamily} font`,
      estimatedDuration: 60,
      outputFile,
    };
  }

  private getColorPresetFilters(preset: string): string[] {
    const presets: Record<string, string[]> = {
      cinematic: [
        "eq=contrast=1.1:brightness=0.05:saturation=0.9",
        "curves=preset=cross_process",
        "colorbalance=rs=0.1:gs=-0.05:bs=-0.1",
      ],
      vintage: [
        "eq=saturation=0.7:contrast=1.1",
        "colorbalance=rs=0.2:gs=0.1:bs=-0.1",
        "curves=preset=vintage",
      ],
      vibrant: [
        "eq=saturation=1.4:contrast=1.1:brightness=0.02",
        "vibrance=intensity=0.3",
      ],
      moody: [
        "eq=contrast=1.2:brightness=-0.05:saturation=0.7",
        "colorbalance=rs=-0.1:gs=-0.1:bs=0.15",
      ],
      warm: [
        "colortemperature=temperature=6500",
        "eq=saturation=1.1",
        "colorbalance=rs=0.1:gs=0.05:bs=-0.1",
      ],
      cool: [
        "colortemperature=temperature=4500",
        "eq=saturation=0.95",
        "colorbalance=rs=-0.1:gs=0:bs=0.1",
      ],
      noir: [
        "eq=saturation=0:contrast=1.3:brightness=-0.1",
        "curves=preset=darker",
      ],
    };

    return presets[preset] || [];
  }

  private generateColorCorrectionCommand(
    cmd: {
      type: "color_correction";
      adjustments: {
        brightness?: number;
        contrast?: number;
        saturation?: number;
        temperature?: number;
      };
      preset?: string;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();
    const filters: string[] = [];

    if (cmd.preset) {
      filters.push(...this.getColorPresetFilters(cmd.preset));
    }

    const adj = cmd.adjustments;
    const eqParts: string[] = [];

    if (adj.brightness !== undefined) {
      eqParts.push(`brightness=${adj.brightness}`);
    }
    if (adj.contrast !== undefined) {
      eqParts.push(`contrast=${1 + adj.contrast}`);
    }
    if (adj.saturation !== undefined) {
      eqParts.push(`saturation=${1 + adj.saturation}`);
    }

    if (eqParts.length > 0) {
      filters.push(`eq=${eqParts.join(":")}`);
    }

    if (adj.temperature !== undefined) {
      const temp = adj.temperature > 0 ? 6500 + adj.temperature * 3000 : 6500 + adj.temperature * 2500;
      filters.push(`colortemperature=temperature=${temp}`);
    }

    const filterString = filters.join(",");

    return {
      command: `ffmpeg -i "${inputFile}" -vf "${filterString}" -c:a copy "${outputFile}"`,
      description: cmd.preset
        ? `Apply ${cmd.preset} color preset`
        : "Apply color adjustments",
      estimatedDuration: 45,
      outputFile,
    };
  }

  private generateAudioCommand(
    cmd: {
      type: "audio";
      action: string;
      params: {
        volume?: number;
        musicVolume?: number;
        fadeDuration?: number;
        noiseReduction?: number;
      };
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();
    let filter = "";
    let description = "";

    switch (cmd.action) {
      case "normalize":
        filter = "loudnorm=I=-16:TP=-1.5:LRA=11";
        description = "Normalize audio levels";
        break;
      case "reduce_noise":
        const reduction = cmd.params.noiseReduction || 0.5;
        filter = `afftdn=nf=-${20 + reduction * 30}`;
        description = "Reduce background noise";
        break;
      case "adjust_volume":
        const vol = cmd.params.volume || 1;
        filter = `volume=${vol}`;
        description = `Adjust volume to ${Math.round(vol * 100)}%`;
        break;
      case "fade_in":
        const fadeInDur = cmd.params.fadeDuration || 1;
        filter = `afade=t=in:st=0:d=${fadeInDur}`;
        description = `Add ${fadeInDur}s audio fade in`;
        break;
      case "fade_out":
        const fadeOutDur = cmd.params.fadeDuration || 1;
        filter = `afade=t=out:st=0:d=${fadeOutDur}`;
        description = `Add ${fadeOutDur}s audio fade out`;
        break;
      default:
        filter = "anull";
        description = "Process audio";
    }

    return {
      command: `ffmpeg -i "${inputFile}" -af "${filter}" -c:v copy "${outputFile}"`,
      description,
      estimatedDuration: 20,
      outputFile,
    };
  }

  private generateTransitionCommand(
    cmd: {
      type: "transition";
      transitionType: string;
      duration: number;
      position: string;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();
    let filter = "";

    switch (cmd.transitionType) {
      case "fade":
        if (cmd.position === "start" || cmd.position === "all") {
          filter = `fade=t=in:st=0:d=${cmd.duration}`;
        }
        if (cmd.position === "end" || cmd.position === "all") {
          filter += filter ? "," : "";
          filter += `fade=t=out:st=0:d=${cmd.duration}`;
        }
        break;
      case "blur":
        filter = `boxblur=luma_radius=min(h\\,w)/20:luma_power=1:enable='between(t,0,${cmd.duration})'`;
        break;
      default:
        filter = `fade=t=in:st=0:d=${cmd.duration}`;
    }

    return {
      command: `ffmpeg -i "${inputFile}" -vf "${filter}" -c:a copy "${outputFile}"`,
      description: `Add ${cmd.transitionType} transition`,
      estimatedDuration: 15,
      outputFile,
    };
  }

  private generateEffectCommand(
    cmd: {
      type: "effect";
      effectName: string;
      intensity: number;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = this.getTempFile();
    let filter = "";

    switch (cmd.effectName) {
      case "blur":
        const blurAmount = Math.round(cmd.intensity * 10);
        filter = `boxblur=${blurAmount}:${blurAmount}`;
        break;
      case "sharpen":
        const sharpAmount = cmd.intensity * 2;
        filter = `unsharp=5:5:${sharpAmount}:5:5:${sharpAmount}`;
        break;
      case "vignette":
        const vigAngle = 0.5 + cmd.intensity * 0.5;
        filter = `vignette=angle=${vigAngle}`;
        break;
      case "film_grain":
        const grainAmount = Math.round(cmd.intensity * 50);
        filter = `noise=alls=${grainAmount}:allf=t`;
        break;
      case "slow_motion":
        const slowFactor = 1 + cmd.intensity;
        filter = `setpts=${slowFactor}*PTS`;
        break;
      case "speed_up":
        const speedFactor = 1 - cmd.intensity * 0.5;
        filter = `setpts=${speedFactor}*PTS`;
        break;
      case "stabilize":
        filter = "vidstabdetect,vidstabtransform";
        break;
      default:
        filter = "null";
    }

    return {
      command: `ffmpeg -i "${inputFile}" -vf "${filter}" -c:a copy "${outputFile}"`,
      description: `Apply ${cmd.effectName} effect`,
      estimatedDuration: 30,
      outputFile,
    };
  }

  private generateExportCommand(
    cmd: {
      type: "export";
      format: string;
      resolution: string;
      aspectRatio: string;
      quality: string;
      fps: number;
    },
    inputFile: string
  ): FFmpegOperation {
    const outputFile = `${this.outputDir}/output.${cmd.format}`;
    const filters: string[] = [];

    // Resolution scaling
    const resolutions: Record<string, string> = {
      "4k": "3840:2160",
      "1080p": "1920:1080",
      "720p": "1280:720",
      "480p": "854:480",
    };

    if (cmd.resolution !== "original" && resolutions[cmd.resolution]) {
      filters.push(`scale=${resolutions[cmd.resolution]}:force_original_aspect_ratio=decrease`);
    }

    // Aspect ratio
    if (cmd.aspectRatio !== "original") {
      const ratios: Record<string, string> = {
        "16:9": "16/9",
        "9:16": "9/16",
        "1:1": "1/1",
        "4:5": "4/5",
        "21:9": "21/9",
      };
      if (ratios[cmd.aspectRatio]) {
        filters.push(`crop=ih*${ratios[cmd.aspectRatio]}:ih`);
      }
    }

    // Quality presets
    const qualityPresets: Record<string, string> = {
      high: "-crf 18 -preset slow",
      medium: "-crf 23 -preset medium",
      low: "-crf 28 -preset fast",
    };

    const qualityFlags = qualityPresets[cmd.quality] || qualityPresets.medium;
    const filterString = filters.length > 0 ? `-vf "${filters.join(",")}"` : "";

    return {
      command: `ffmpeg -i "${inputFile}" ${filterString} -r ${cmd.fps} ${qualityFlags} -c:a aac "${outputFile}"`,
      description: `Export as ${cmd.resolution} ${cmd.format.toUpperCase()} (${cmd.aspectRatio})`,
      estimatedDuration: 60,
      outputFile,
    };
  }

  private generateThumbnailCommand(
    cmd: {
      type: "thumbnail";
      count: number;
      style?: string;
      timestamps?: number[];
    },
    inputFile: string,
    videoDuration: number
  ): FFmpegOperation {
    const outputFile = `${this.outputDir}/thumbnail_%03d.jpg`;

    let command: string;

    if (cmd.timestamps && cmd.timestamps.length > 0) {
      // Generate thumbnails at specific timestamps
      const selectExpr = cmd.timestamps.map((t) => `eq(t,${t})`).join("+");
      command = `ffmpeg -i "${inputFile}" -vf "select='${selectExpr}',scale=1920:-1" -vsync vfr "${outputFile}"`;
    } else {
      // Generate evenly spaced thumbnails
      const interval = videoDuration / (cmd.count + 1);
      command = `ffmpeg -i "${inputFile}" -vf "fps=1/${interval},scale=1920:-1" -frames:v ${cmd.count} "${outputFile}"`;
    }

    return {
      command,
      description: `Generate ${cmd.count} thumbnail(s)`,
      estimatedDuration: 10,
      outputFile,
    };
  }
}

/**
 * Browser-compatible FFmpeg execution using @ffmpeg/ffmpeg
 */
export async function executeBrowserFFmpeg(
  operation: FFmpegOperation,
  ffmpeg: unknown,
  inputData: Uint8Array,
  inputFileName: string
): Promise<Uint8Array> {
  // Type assertion for FFmpeg interface
  const ff = ffmpeg as {
    writeFile: (name: string, data: Uint8Array) => Promise<void>;
    exec: (args: string[]) => Promise<void>;
    readFile: (name: string) => Promise<Uint8Array>;
  };

  // Parse the command to extract arguments
  const args = parseFFmpegCommand(operation.command);

  // Write input file
  await ff.writeFile(inputFileName, inputData);

  // Execute FFmpeg
  await ff.exec(args);

  // Read output file
  const outputFileName = operation.outputFile.split("/").pop() || "output.mp4";
  const data = await ff.readFile(outputFileName);

  return data;
}

function parseFFmpegCommand(command: string): string[] {
  // Simple command parser - extracts arguments from FFmpeg command
  const args: string[] = [];
  const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

  for (let i = 1; i < parts.length; i++) {
    // Skip 'ffmpeg'
    const part = parts[i].replace(/"/g, "");
    args.push(part);
  }

  return args;
}

