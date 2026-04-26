import { View, Text } from 'react-native';

export default function AgeGate() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">18+ verification</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        Phase 1 wires this up with a real KYC provider (iDIN / Yoti / Onfido).
      </Text>
    </View>
  );
}
