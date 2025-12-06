import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Neural_Lofi - AI Lo-Fi Music Generator',
  description:
    'Generate unique Lo-Fi music tracks powered by AI. Choose from Classic, Indian, African, Asian, and Latino styles with customizable textures.',
  keywords: ['lofi', 'music', 'ai', 'generator', 'chill', 'study', 'beats'],
  authors: [{ name: 'Neural_Lofi' }],
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
        </TooltipProvider>
      </body>
    </html>
  );
}
