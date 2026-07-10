import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YNC Admin - Lead Management',
  description: 'Lead management panel for YNC Courier',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
