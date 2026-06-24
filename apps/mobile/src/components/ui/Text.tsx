import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { cn } from '@/lib/cn';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'muted';

interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
}

const variantClasses: Record<TextVariant, string> = {
  title: 'text-2xl font-bold text-gray-900',
  subtitle: 'text-lg font-semibold text-gray-900',
  body: 'text-base text-gray-900',
  caption: 'text-sm text-text-secondary text-gray-600',
  muted: 'text-sm text-text-muted text-gray-500',
};

export function AppText({ variant = 'body', className, children, ...props }: AppTextProps) {
  return (
    <RNText className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </RNText>
  );
}
