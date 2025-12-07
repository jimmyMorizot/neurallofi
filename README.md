# Neural Lofi

A Lo-Fi music generator powered by AI (MusicGPT). Generate unique, chill beats with customizable styles and textures.

## Features

- **5 Music Styles**: Classic Lo-Fi, Indian, African, Asian, Latino
- **4 Ambient Textures**: Rain, Vinyl, City, Typing sounds
- **AI Vocals**: Optional AI-generated vocals with custom lyrics support
- **Audio Visualization**: Real-time frequency visualizer
- **Crossfade Playback**: Smooth 3-second transitions between tracks
- **Library Management**: Browse, play, and delete generated tracks
- **PWA Support**: Install as a desktop/mobile app
- **Responsive Design**: Works on desktop and mobile
- **User API Key**: Use your own MusicGPT API key (stored locally)

## Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI Components |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI Components |
| Vercel Blob | 2.x | Audio Storage |
| Jest | 30.x | Unit Testing |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/neurallofi.git
cd neurallofi

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with:

```env
# MusicGPT API (optional - enables mock mode if not set)
MUSICGPT_API_URL=https://api.musicgpt.com
MUSICGPT_API_KEY=your_api_key_here

# Vercel Blob Storage (required for production)
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

## Commands

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Linting

```bash
# Run ESLint
pnpm lint
```

## Project Structure

```
neural-lofi/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── generate/       # POST - Start generation
│   │   ├── status/         # GET - Check status
│   │   └── library/        # Library management
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── generator/          # Generation panel
│   ├── library/            # Track library
│   └── player/             # Audio player
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & API clients
├── types/                  # TypeScript definitions
├── __tests__/              # Unit tests
└── public/                 # Static assets
```

## Architecture

### Stateless Design

The application is designed to be stateless for serverless deployment:

- **No server-side state**: All generation state is tracked client-side
- **Vercel Blob Storage**: MP3 files are stored in Vercel Blob
- **LocalStorage**: User preferences and API keys stored locally
- **Polling**: Client polls for generation status using conversion IDs

### File Naming Convention

Generated tracks follow this pattern:
```
{taskId}_{style}_v{version}.mp3
```

Example: `abc123_classic_v1.mp3`

### API Flow

1. Client sends generation request to `/api/generate`
2. Server returns `taskId` and `conversionId`
3. Client polls `/api/status/{taskId}?conversionId={id}`
4. On completion, tracks are uploaded to Vercel Blob
5. Library fetches from `/api/library`

## API Credits

When server API credits are exhausted:

1. A modal appears prompting for your API key
2. Your key is stored **only in localStorage** (never sent to our servers)
3. Future requests use your personal API key
4. Get your API key at [musicgpt.com/pricing](https://musicgpt.com/pricing)

## Deployment

### Vercel (Recommended)

```bash
# Link to Vercel project
vercel link

# Pull environment variables
vercel env pull

# Deploy
vercel deploy
```

### Environment Setup

Required environment variables for Vercel:
- `MUSICGPT_API_KEY`: Your MusicGPT API key
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token (auto-added)

## Design

- **Cyberpunk/Neural aesthetic** with neon accents (cyan, magenta, purple)
- **JetBrains Mono** font throughout
- **Glassmorphism** effects and glow shadows
- **Scanline overlay** for retro feel

## License

MIT

## Credits

- Music generation powered by [MusicGPT](https://musicgpt.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
