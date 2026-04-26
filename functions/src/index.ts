import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

export { mockVerifyAge } from './auth/mockVerifyAge';
export { onPhotoUploaded } from './imageProcessing/onPhotoUploaded';
export { generateIcebreaker } from './icebreaker/generate';
export { moderateMessage } from './moderation/moderateMessage';
export { computeMatch } from './matching/computeMatch';
