import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { UserPrefsProvider } from '@/components/providers/UserPrefsProvider';
import { AppEffects } from '@/components/providers/AppEffects';

export const metadata: Metadata = {
  title: 'Neurodivergent Flow',
  description: 'A sustainable weekly rhythm planner for neurodivergent adults',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Neurodivergent Flow',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <QueryProvider>
          <AuthProvider>
            <UserPrefsProvider>
              <AppEffects />
              {children}
            </UserPrefsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
