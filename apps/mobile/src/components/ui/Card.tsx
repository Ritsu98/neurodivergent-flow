import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={cn('bg-surface rounded-lg border border-gray-200 p-4', className)}
      {...props}
    >
      {children}
    </View>
  );
}
