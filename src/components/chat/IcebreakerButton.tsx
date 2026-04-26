import { useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onGenerate: () => Promise<string>;
  onPick: (question: string) => void;
};

export function IcebreakerButton({ label, onGenerate, onPick }: Props) {
  const [busy, setBusy] = useState(false);

  const click = async () => {
    setBusy(true);
    try {
      const q = await onGenerate();
      onPick(q);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={click}
      disabled={busy}
      className="bg-bg-card border-leaf-500 mx-3 my-2 flex-row items-center justify-center rounded-2xl border px-4 py-2"
      accessibilityRole="button"
    >
      {busy ? (
        <ActivityIndicator color="#7cd25a" />
      ) : (
        <Text className="text-leaf-400 text-sm">{label}</Text>
      )}
    </Pressable>
  );
}
