import { useState, useRef, useEffect } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Composer } from '@/components/chat/Composer';
import { IcebreakerButton } from '@/components/chat/IcebreakerButton';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { generateIcebreakerForMatch, sendMessage } from '@/features/chat/api';
import { side } from '@/features/chat/helpers';
import { useChat } from '@/features/chat/useChat';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { t } = useTranslation();
  const { messages, isLoading, myUid } = useChat(matchId ?? '');
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const onSend = async (text: string) => {
    if (!matchId) return;
    await sendMessage(matchId, text);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color="#7cd25a" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-bg"
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0b0f0a' },
          headerTitleStyle: { color: '#7cd25a' },
          headerTintColor: '#7cd25a',
          title: t('chat.title'),
        }}
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        renderItem={({ item }) => (
          <MessageBubble
            text={item.text}
            createdAt={item.createdAt}
            side={side(item.senderId, myUid)}
          />
        )}
      />

      <IcebreakerButton
        label={icebreaker ?? t('chat.icebreaker')}
        onGenerate={() => generateIcebreakerForMatch(matchId ?? '')}
        onPick={setIcebreaker}
      />

      <Composer
        placeholder={t('chat.placeholder')}
        sendLabel={t('chat.send')}
        onSend={onSend}
      />
    </KeyboardAvoidingView>
  );
}
