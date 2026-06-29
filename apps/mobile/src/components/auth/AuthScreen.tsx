import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

export function AuthScreen({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="flex-grow justify-center p-4">
        <View className="rounded-lg bg-white p-6 shadow-sm">
          <AppText variant="title">{title}</AppText>
          <AppText variant="muted" className="mt-1">
            {subtitle}
          </AppText>
          <View className="mt-6">{children}</View>
          {footer ? <View className="mt-6">{footer}</View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function AuthField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <View className="mb-4">
      <AppText variant="caption" className="mb-1 font-medium">
        {label}
      </AppText>
      {children}
      {error ? (
        <AppText variant="caption" className="mt-1 text-red-600" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function authInputClass(className?: string) {
  return cn(
    'rounded-lg border border-gray-300 px-3 py-3 text-base text-gray-900',
    className
  );
}

export function AuthTextInput(props: ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={authInputClass()}
      placeholderTextColor="#9ca3af"
      autoCapitalize="none"
      {...props}
    />
  );
}
