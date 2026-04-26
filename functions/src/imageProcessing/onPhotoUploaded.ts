import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger } from 'firebase-functions/v2';

export const onPhotoUploaded = onObjectFinalized(
  { bucket: undefined, memory: '512MiB' },
  async (event) => {
    logger.info('Photo uploaded; resizing pipeline TODO', { name: event.data.name });
  },
);
