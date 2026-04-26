import { View, Text } from 'react-native';

export default function GeoBlock() {
  return (
    <View className="flex-1 items-center justify-center bg-bg px-6">
      <Text className="text-leaf-400 text-3xl font-bold">Coming soon</Text>
      <Text className="text-haze-200 mt-3 text-center text-base">
        PuffMatch is currently available only in the Netherlands.
      </Text>
      <Text className="text-haze-400 mt-6 text-center text-sm">
        Drop us a note at hello@puffmatch.app to be notified when we launch in your
        region.
      </Text>
    </View>
  );
}
