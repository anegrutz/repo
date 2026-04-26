import { Text, View } from 'react-native';

import { formatTime, type Side } from '@/features/chat/helpers';

type Props = {
  text: string;
  createdAt: number;
  side: Side;
};

export function MessageBubble({ text, createdAt, side: position }: Props) {
  const isMe = position === 'me';
  return (
    <View
      className={`my-1 max-w-[78%] rounded-2xl px-4 py-2 ${isMe ? 'self-end bg-leaf-500' : 'self-start bg-bg-elevated'}`}
    >
      <Text className={isMe ? 'text-bg' : 'text-haze-200'}>{text}</Text>
      <Text className={`mt-1 text-[10px] ${isMe ? 'text-bg opacity-70' : 'text-haze-400'}`}>
        {formatTime(createdAt)}
      </Text>
    </View>
  );
}
