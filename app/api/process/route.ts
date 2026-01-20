import { NextRequest, NextResponse } from "next/server";
import { getPromptParser, type ParsedPromptResult } from "@/lib/ai/prompt-parser";
import { FFmpegCommandGenerator } from "@/lib/video/ffmpeg-commands";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ProcessRequest {
  prompt: string;
  videoContext?: {
    duration: number;
    hasAudio: boolean;
    resolution: {
      width: number;
      height: number;
    };
  };
}

interface ProcessResponse {
  success: boolean;
  result?: ParsedPromptResult & {
    ffmpegCommands?: string[];
  };
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<ProcessResponse>> {
  try {
    const body: ProcessRequest = await req.json();
    const { prompt, videoContext } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Parse the prompt using Claude AI
    const parser = getPromptParser();
    const parseResult = await parser.parse(prompt, videoContext);

    // Generate FFmpeg commands if we have valid commands
    let ffmpegCommands: string[] = [];
    if (parseResult.commands.length > 0 && videoContext) {
      const generator = new FFmpegCommandGenerator("input.mp4", "/tmp/output");
      const pipeline = generator.generatePipeline(parseResult.commands, videoContext.duration);
      ffmpegCommands = pipeline.operations.map((op) => op.command);
    }

    return NextResponse.json({
      success: true,
      result: {
        ...parseResult,
        ffmpegCommands,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 }
    );
  }
}

