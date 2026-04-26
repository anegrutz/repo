import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'europe-west1', maxInstances: 10 });

export { mockVerifyAge } from './auth/mockVerifyAge';
export { deleteMyAccount } from './account/deleteMyAccount';
export { requestDataExport } from './account/requestDataExport';
export { onPhotoUploaded } from './imageProcessing/onPhotoUploaded';
export { generateIcebreaker } from './icebreaker/generate';
export { moderateMessage } from './moderation/moderateMessage';
export { computeMatch } from './matching/computeMatch';
