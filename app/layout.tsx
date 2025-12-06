import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Neural Lofi - AI Lo-Fi Music Generator',
  description:
    'Generate unique Lo-Fi music tracks powered by AI. Choose from Classic, Indian, African, Asian, and Latino styles with customizable textures.',
  keywords: ['lofi', 'music', 'ai', 'generator', 'chill', 'study', 'beats'],
  authors: [{ name: 'Neural Lofi' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Neural Lofi',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased bg-neural-gradient`}
        suppressHydrationWarning
      >
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster position="bottom-center" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
