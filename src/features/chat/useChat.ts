import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/store';
import type { ChatMessage } from '@/types';

import { subscribeMessages } from './api';

export function useChat(matchId: string): {
  messages: ChatMessage[];
  isLoading: boolean;
  myUid: string | null;
} {
  const authState = useAuth((s) => s.state);
  const myUid = authState.kind === 'authenticated' ? authState.uid : null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!myUid) return;
    const unsubscribe = subscribeMessages(matchId, (next) => {
      setMessages(next);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [matchId, myUid]);

  return { messages, isLoading, myUid };
}
