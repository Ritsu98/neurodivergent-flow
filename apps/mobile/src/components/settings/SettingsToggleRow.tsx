import { Switch, View } from 'react-native';
import { AppText } from '@/components/ui/Text';

interface SettingsToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SettingsToggleRowProps) {
  return (
    <View className="min-h-12 flex-row items-center justify-between gap-4 py-2">
      <View className="flex-1">
        <AppText className="text-sm">{label}</AppText>
        {description ? (
          <AppText variant="muted" className="mt-0.5">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={checked}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: '#d1d5db', true: '#7dd3fc' }}
        thumbColor={checked ? '#0ea5e9' : '#f3f4f6'}
      />
    </View>
  );
}
