import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2';

export const moderateMessage = onDocumentCreated(
  'matches/{matchId}/messages/{messageId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    logger.info('Moderation pipeline TODO (Perspective API)', {
      matchId: event.params.matchId,
      messageId: event.params.messageId,
    });
  },
);
