import { useState } from 'react';
import { Pressable, View } from 'react-native';
import type { OnboardingData } from '@/types/onboarding';
import { StepActions } from '@/components/onboarding/StepActions';
import { AppText } from '@/components/ui/Text';
import { Stack } from '@/components/ui/Stack';
import { Checkbox } from '@/components/ui/Checkbox';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

interface SupplementsStepProps {
  data: Partial<OnboardingData>;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const supplementTemplates = {
  basics: {
    name: 'Basics',
    description: 'Very conservative: Vitamin D, Magnesium PM, Hydration',
    items: ['Vitamin D (if you already take it)', 'Magnesium (PM)', 'Hydration anchor'],
  },
  sleep: {
    name: 'Sleep Support',
    description: 'Magnesium timing, Caffeine cutoff, Downshift checklist',
    items: ['Magnesium timing', 'No caffeine after X', 'Downshift checklist'],
  },
  focus: {
    name: 'Focus-Friendly Day',
    description: 'Caffeine timing, optional L-theanine, Protein reminder',
    items: ['Caffeine timing rules', 'L-theanine (if you use it)', 'Protein-with-breakfast reminder'],
  },
  busy: {
    name: 'Busy / Low Appetite Day',
    description: 'Electrolytes, Easy protein, Minimum nutrition',
    items: ['Electrolytes reminder', 'Easy protein prompt', 'Minimum nutrition counts'],
  },
} as const;

export function SupplementsStep({
  data,
  onUpdate,
  onNext,
  onBack,
  loading,
}: SupplementsStepProps) {
  const [supplementsEnabled, setSupplementsEnabled] = useState(data.supplementsEnabled || false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(
    data.selectedSupplements || []
  );

  const handleToggleTemplate = (templateId: string) => {
    if (selectedTemplates.includes(templateId)) {
      setSelectedTemplates(selectedTemplates.filter((t) => t !== templateId));
    } else {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
  };

  const handleNext = () => {
    onUpdate({
      supplementsEnabled,
      selectedSupplements: selectedTemplates,
    });
    onNext();
  };

  return (
    <View>
      <AppText variant="title">Supplements (Optional)</AppText>
      <AppText variant="caption" className="mb-6 mt-2">
        Enable supplement reminders? These are reminders only, not medical advice.
      </AppText>

      <Checkbox
        label="Enable supplement reminders"
        description="You can always change this later in settings."
        checked={supplementsEnabled}
        onToggle={setSupplementsEnabled}
      />

      {supplementsEnabled ? (
        <Stack gap="md" className="mt-6">
          <Card className="border-2 border-energy-yellow bg-yellow-50">
            <AppText variant="caption" className="font-medium text-yellow-800">
              Not medical advice. Verify interactions and suitability with a clinician.
            </AppText>
          </Card>

          <AppText className="font-medium">Select templates (optional):</AppText>

          {(Object.keys(supplementTemplates) as Array<keyof typeof supplementTemplates>).map(
            (templateId) => {
              const template = supplementTemplates[templateId];
              const isSelected = selectedTemplates.includes(templateId);
              return (
                <Pressable
                  key={templateId}
                  onPress={() => handleToggleTemplate(templateId)}
                  className={cn(
                    'rounded-lg border-2 p-4',
                    isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  )}
                >
                  <View className="flex-row items-start">
                    <View
                      className={cn(
                        'mr-3 mt-1 h-5 w-5 items-center justify-center rounded border-2',
                        isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
                      )}
                    >
                      {isSelected ? (
                        <AppText className="text-xs font-bold text-white">✓</AppText>
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <AppText className="font-medium">{template.name}</AppText>
                      <AppText variant="caption" className="mt-1">
                        {template.description}
                      </AppText>
                      {template.items.map((item) => (
                        <AppText key={item} variant="muted" className="mt-1">
                          • {item}
                        </AppText>
                      ))}
                    </View>
                  </View>
                </Pressable>
              );
            }
          )}
        </Stack>
      ) : null}

      <StepActions
        onBack={onBack}
        onNext={handleNext}
        nextLabel="Complete Setup"
        loading={loading}
      />
    </View>
  );
}
