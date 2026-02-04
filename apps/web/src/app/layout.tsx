import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neurodivergent Flow',
  description: 'A sustainable weekly rhythm planner for neurodivergent adults',
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
