import { View, Text, Pressable } from 'react-native';

export default function Welcome() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-5xl font-bold">PuffMatch</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        Find your vibe in the Netherlands.
      </Text>
      <Pressable
        className="bg-leaf-500 mt-12 w-full items-center rounded-2xl py-4"
        accessibilityRole="button"
        accessibilityLabel="Get started"
      >
        <Text className="text-bg text-base font-semibold">Get started</Text>
      </Pressable>
      <Text className="text-haze-400 mt-6 text-center text-xs">
        18+ only. By continuing you accept our Terms and Privacy Policy.
      </Text>
    </View>
  );
}
