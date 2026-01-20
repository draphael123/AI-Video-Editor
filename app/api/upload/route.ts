import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

interface UploadResponse {
  success: boolean;
  projectId?: string;
  url?: string;
  metadata?: {
    name: string;
    size: number;
    type: string;
  };
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Supported: MP4, MOV, WebM, AVI" },
        { status: 400 }
      );
    }

    // Validate file size (2GB max)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 2GB" },
        { status: 400 }
      );
    }

    // Generate project ID
    const projectId = `proj_${generateId()}`;

    // Upload to Vercel Blob (if configured)
    let url: string | undefined;
    
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`projects/${projectId}/${file.name}`, file, {
        access: "public",
      });
      url = blob.url;
    }

    return NextResponse.json({
      success: true,
      projectId,
      url,
      metadata: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

