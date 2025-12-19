import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClassBridge',
  description: 'Rebuilt frontend — starting small, growing feature by feature.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
