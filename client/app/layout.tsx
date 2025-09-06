import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Optimistic Oracle - Stacks Blockchain',
  description: 'Decentralized Oracle Network on Stacks with AI Validation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  );
}