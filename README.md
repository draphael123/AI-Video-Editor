# ClipCraft AI - AI-Powered Video Editor

An intelligent video editing platform that transforms natural language prompts into professional video edits. Built for content creators who need to produce high-quality video content at scale.

![ClipCraft AI](https://via.placeholder.com/1200x600/08090c/f94432?text=ClipCraft+AI)

## ✨ Features

### Natural Language Editing
- **Trim & Cut**: "Cut the first 10 seconds" / "Keep only 0:30 to 1:45"
- **Smart Cuts**: "Remove all the ums and pauses" / "Cut dead air"
- **Scene Detection**: "Split into individual scenes" / "Remove the third scene"

### AI-Powered Enhancements
- **Auto-Captions**: Generate accurate subtitles with speaker detection
- **Text Overlays**: "Add a title that says 'Welcome' in the first 3 seconds"
- **Color Correction**: "Make it warmer" / "Apply cinematic look" / "Boost contrast"
- **Filters**: "Make it look vintage" / "Add film grain"

### Audio Intelligence
- **Music**: "Add upbeat background music" / "Lower the music volume"
- **Audio Cleanup**: "Reduce background noise" / "Normalize audio levels"
- **Ducking**: "Lower music when someone speaks"

### Platform Optimization
- **Aspect Ratios**: "Create a 9:16 version for TikTok"
- **Thumbnails**: "Generate 5 thumbnail options"
- **Transitions**: "Add smooth transitions between clips"

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Upload    │  │   Prompt    │  │      Video Preview      │  │
│  │   Dropzone  │  │   Interface │  │      & Timeline         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Upload    │  │   Process   │  │      Export             │  │
│  │   Handler   │  │   Pipeline  │  │      Handler            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AI Processing Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Claude AI  │  │  Whisper    │  │      Replicate          │  │
│  │  (Prompts)  │  │  (Speech)   │  │      (Video Models)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Video Processing (FFmpeg)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Cutting   │  │   Filters   │  │      Encoding           │  │
│  │   & Merging │  │   & Effects │  │      & Export           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router with Server Components
- **React 18** - UI Components with hooks
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - Lightweight state management
- **Radix UI** - Accessible component primitives

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **FFmpeg (@ffmpeg/ffmpeg)** - Browser-based video processing
- **Vercel Blob** - Video file storage
- **Upstash Redis** - Job queue and caching

### AI Services
- **Anthropic Claude** - Natural language understanding & command parsing
- **OpenAI Whisper** - Speech-to-text for captions
- **Replicate** - Additional AI models (style transfer, upscaling)

## 📁 Project Structure

```
clipcraft-ai/
├── app/
│   ├── api/
│   │   ├── export/
│   │   │   └── route.ts
│   │   ├── process/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   ├── editor/
│   │   └── [projectId]/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── editor/
│   │   ├── prompt-input.tsx
│   │   ├── timeline.tsx
│   │   └── video-player.tsx
│   └── ui/
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── slider.tsx
│       └── tooltip.tsx
├── lib/
│   ├── ai/
│   │   └── prompt-parser.ts
│   ├── video/
│   │   └── ffmpeg-commands.ts
│   └── utils/
│       └── index.ts
├── stores/
│   └── editor-store.ts
├── types/
│   └── index.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/clipcraft-ai.git
cd clipcraft-ai

# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your API keys

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file with the following:

```env
# AI Services (required)
ANTHROPIC_API_KEY=your_anthropic_key

# Optional AI services
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token

# Storage (for production)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

## 📖 Usage

1. **Upload** - Drag and drop your video file
2. **Prompt** - Type what you want to do (e.g., "Remove the first 5 seconds and add captions")
3. **Preview** - Watch the AI apply your edits in real-time
4. **Refine** - Add more prompts to fine-tune
5. **Export** - Download in your preferred format and resolution

## 🎯 Prompt Examples

```
"Cut from 0:30 to 2:15"
"Remove all silent parts longer than 2 seconds"
"Add subtitles in English"
"Make the colors more vibrant and cinematic"
"Create a 15-second highlight reel"
"Add a fade transition between each scene"
"Generate a thumbnail for YouTube"
"Export as 1080p MP4 and also a 9:16 version for Reels"
```

## 🎨 Design System

ClipCraft uses a custom design system with:

- **Colors**: Deep void blacks with electric spark (red-orange) accents and cool mint secondary
- **Typography**: Geist Sans for UI, Geist Mono for code/timestamps
- **Components**: Glass-morphism cards, gradient buttons, smooth animations
- **Dark mode**: Optimized for dark theme only for video editing focus

## 📝 API Reference

### POST /api/process
Parse a natural language prompt into video commands.

```typescript
// Request
{
  "prompt": "Cut the first 10 seconds and add captions",
  "videoContext": {
    "duration": 120,
    "hasAudio": true,
    "resolution": { "width": 1920, "height": 1080 }
  }
}

// Response
{
  "success": true,
  "result": {
    "commands": [...],
    "explanation": "Will trim the video and generate captions",
    "confidence": 0.95,
    "ffmpegCommands": [...]
  }
}
```

### POST /api/upload
Upload a video file.

### POST /api/export
Start an export job.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Next.js, Claude AI, and FFmpeg
