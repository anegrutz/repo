import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  placeholder: string;
  sendLabel: string;
  onSend: (text: string) => Promise<void>;
};

export function Composer({ placeholder, sendLabel, onSend }: Props) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !busy;

  const submit = async () => {
    if (!canSend) return;
    setBusy(true);
    try {
      await onSend(trimmed);
      setValue('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="border-haze-600 flex-row items-end gap-2 border-t bg-bg p-3">
      <TextInput
        className="text-haze-200 max-h-32 flex-1 rounded-2xl bg-bg-elevated px-4 py-3"
        placeholder={placeholder}
        placeholderTextColor="#8a8a8a"
        value={value}
        onChangeText={setValue}
        multiline
        maxLength={2000}
      />
      <Pressable
        onPress={submit}
        disabled={!canSend}
        className={`rounded-2xl px-4 py-3 ${canSend ? 'bg-leaf-500' : 'bg-haze-600'}`}
        accessibilityRole="button"
        accessibilityLabel={sendLabel}
      >
        <Text className="text-bg text-sm font-semibold">{sendLabel}</Text>
      </Pressable>
    </View>
  );
}
