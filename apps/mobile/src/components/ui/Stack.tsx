import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/cn';

type StackDirection = 'vertical' | 'horizontal';

interface StackProps extends ViewProps {
  direction?: StackDirection;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function Stack({
  direction = 'vertical',
  gap = 'md',
  className,
  children,
  ...props
}: StackProps) {
  return (
    <View
      className={cn(
        direction === 'vertical' ? 'flex-col' : 'flex-row items-center',
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
