import { useState, useRef, useEffect, useMemo } from 'react';
import { Alert, ActivityIndicator, FlatList, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ChatHeaderMenu } from '@/components/chat/ChatHeaderMenu';
import { Composer } from '@/components/chat/Composer';
import { IcebreakerButton } from '@/components/chat/IcebreakerButton';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { generateIcebreakerForMatch, sendMessage } from '@/features/chat/api';
import { side } from '@/features/chat/helpers';
import { useChat } from '@/features/chat/useChat';
import { reportUser, unmatch } from '@/features/moderation/api';
import { REPORT_REASONS, type ReportReason } from '@/features/moderation/helpers';
import { useMatches } from '@/features/matching/useMatches';

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { t } = useTranslation();
  const { messages, isLoading, myUid } = useChat(matchId ?? '');
  const { matches } = useMatches();
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const otherUid = useMemo(
    () => matches.find((m) => m.id === matchId)?.otherUid ?? null,
    [matches, matchId],
  );

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const onSend = async (text: string) => {
    if (!matchId) return;
    await sendMessage(matchId, text);
  };

  const reasonLabels = REPORT_REASONS.reduce<Record<ReportReason, string>>(
    (acc, r) => {
      acc[r] = t(`moderation.reasons.${r}`);
      return acc;
    },
    { harassment: '', inappropriate_photos: '', underage: '', spam: '', other: '' },
  );

  const handleAction = async (action: 'report' | 'unmatch', reason?: ReportReason) => {
    if (!matchId) return;
    if (action === 'report' && reason && otherUid) {
      try {
        await reportUser({ reportedUid: otherUid, reason, matchId });
        Alert.alert(t('moderation.reportThanksTitle'), t('moderation.reportThanksBody'));
      } catch {
        Alert.alert(t('moderation.errorTitle'), t('moderation.errorBody'));
      }
      return;
    }
    if (action === 'unmatch') {
      try {
        await unmatch(matchId);
        router.back();
      } catch {
        Alert.alert(t('moderation.errorTitle'), t('moderation.errorBody'));
      }
    }
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
          headerRight: () => (
            <ChatHeaderMenu
              reportLabels={reasonLabels}
              triggerLabel={t('moderation.menu')}
              reportLabel={t('moderation.report')}
              unmatchLabel={t('moderation.unmatch')}
              cancelLabel={t('moderation.cancel')}
              unmatchConfirmTitle={t('moderation.unmatchConfirmTitle')}
              unmatchConfirmBody={t('moderation.unmatchConfirmBody')}
              onAction={handleAction}
            />
          ),
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
