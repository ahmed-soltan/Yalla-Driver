import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

type DateFieldProps = {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date | null;
  defaultDate?: Date;
};

export function DateField({
  value,
  onChange,
  placeholder = 'تاريخ الميلاد',
  label,
  minimumDate,
  maximumDate = new Date(),
  defaultDate = new Date(2000, 0, 1),
}: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        className="min-h-14 w-full flex-row-reverse  items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4">
        <Text
          className={`text-sm ${value ? 'text-foreground' : 'text-muted-foreground'}`}
          style={{ fontFamily: 'Cairo' }}>
          {value ? value.toLocaleDateString('ar-EG') : placeholder}
        </Text>
        <Calendar size={14} />
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={value ?? defaultDate}
          mode="date"
          className="bg-primary"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          minimumDate={minimumDate}
          maximumDate={maximumDate ?? undefined}
          onChange={(_event, selectedDate) => {
            setShowPicker(false);

            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
