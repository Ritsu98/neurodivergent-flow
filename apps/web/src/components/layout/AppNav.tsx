'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isSunday } from '@neurodivergent-flow/core';

interface AppNavProps {
  showSundayBanner?: boolean;
}

export function AppNav({ showSundayBanner = true }: AppNavProps) {
  const pathname = usePathname();
  const isSundayToday = isSunday();

  const linkClass = (href: string) =>
    `rounded-lg px-4 py-2 text-sm font-medium ${
      pathname === href || pathname.startsWith(`${href}/`)
        ? 'bg-primary-500 text-white'
        : 'text-text-secondary hover:bg-gray-100'
    }`;

  return (
    <header className="border-b border-gray-200 bg-white">
      {showSundayBanner && isSundayToday && pathname !== '/sunday-setup' && (
        <div className="bg-primary-50 px-4 py-2 text-center text-sm">
          Sunday Minimum —{' '}
          <Link href="/sunday-setup" className="font-medium text-primary-600 hover:underline">
            set up your week
          </Link>
        </div>
      )}
      <nav
        className="mx-auto flex max-w-2xl items-center gap-2 p-4"
        aria-label="Main navigation"
      >
        <Link href="/today" className={linkClass('/today')}>
          Today
        </Link>
        <Link href="/week" className={linkClass('/week')}>
          Week
        </Link>
        <Link href="/sunday-setup" className={linkClass('/sunday-setup')}>
          Sunday Setup
        </Link>
        <Link href="/settings" className={`${linkClass('/settings')} ml-auto`}>
          Settings
        </Link>
      </nav>
    </header>
  );
}
