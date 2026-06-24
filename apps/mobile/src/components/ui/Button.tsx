import { forwardRef } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';
import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'border border-gray-300 bg-white active:bg-gray-50',
  ghost: 'bg-transparent active:bg-gray-100',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-gray-900 font-medium',
  ghost: 'text-primary-600 font-medium',
};

export const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  function Button({ label, variant = 'primary', className, disabled, ...props }, ref) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        className={cn(
          'tap-target items-center justify-center rounded-lg px-4 py-3',
          variantClasses[variant],
          disabled && 'opacity-50',
          className
        )}
        {...props}
      >
        <Text className={cn('text-base', labelClasses[variant])}>{label}</Text>
      </Pressable>
    );
  }
);
