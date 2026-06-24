import { Link } from 'expo-router';
import { View } from 'react-native';
import { isSunday } from '@neurodivergent-flow/core';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

interface AppHeaderProps {
  active?: 'today' | 'week';
  showSundayBanner?: boolean;
}

export function AppHeader({ active, showSundayBanner = true }: AppHeaderProps) {
  const isSundayToday = isSunday();

  const linkClass = (key: 'today' | 'week') =>
    cn(
      'rounded-lg px-4 py-2',
      active === key ? 'bg-primary-500' : 'bg-transparent'
    );

  const linkTextClass = (key: 'today' | 'week') =>
    cn('text-sm font-medium', active === key ? 'text-white' : 'text-gray-600');

  return (
    <View className="border-b border-gray-200 bg-white">
      {showSundayBanner && isSundayToday ? (
        <View className="bg-primary-50 px-4 py-2">
          <AppText variant="caption" className="text-center">
            Sunday Minimum —{' '}
            <Link href="/sunday-setup" className="font-medium text-primary-600">
              set up your week
            </Link>
          </AppText>
        </View>
      ) : null}
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Link href="/(tabs)/today" className={linkClass('today')}>
          <AppText className={linkTextClass('today')}>Today</AppText>
        </Link>
        <Link href="/(tabs)/week" className={linkClass('week')}>
          <AppText className={linkTextClass('week')}>Week</AppText>
        </Link>
        <View className="flex-1" />
        <Link href="/sunday-setup">
          <AppText variant="caption" className="px-2 py-2 text-primary-600">
            Sunday
          </AppText>
        </Link>
        <Link href="/settings">
          <AppText variant="caption" className="px-2 py-2 text-primary-600">
            Settings
          </AppText>
        </Link>
      </View>
    </View>
  );
}
