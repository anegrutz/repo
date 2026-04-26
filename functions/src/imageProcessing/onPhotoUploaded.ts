import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { logger } from 'firebase-functions/v2';
import { getStorage } from 'firebase-admin/storage';
import { initializeApp, getApps } from 'firebase-admin/app';
import sharp from 'sharp';

if (getApps().length === 0) initializeApp();

const PREVIEW_WIDTH = 256;
const DISPLAY_WIDTH = 1080;

const PHOTO_PATH = /^users\/[^/]+\/photos\/([^/]+)\.jpg$/;

export const onPhotoUploaded = onObjectFinalized(
  { memory: '512MiB', region: 'europe-west1' },
  async (event) => {
    const name = event.data.name;
    if (!name) return;

    const match = PHOTO_PATH.exec(name);
    if (!match) return;
    if (name.includes('_preview') || name.includes('_display')) return;

    const photoId = match[1];
    const bucket = getStorage().bucket(event.data.bucket);
    const original = bucket.file(name);

    const [buf] = await original.download();
    const previewBuf = await sharp(buf).resize({ width: PREVIEW_WIDTH }).jpeg({ quality: 75 }).toBuffer();
    const displayBuf = await sharp(buf).resize({ width: DISPLAY_WIDTH }).jpeg({ quality: 85 }).toBuffer();

    const dir = name.substring(0, name.lastIndexOf('/'));
    await Promise.all([
      bucket.file(`${dir}/${photoId}_preview.jpg`).save(previewBuf, {
        contentType: 'image/jpeg',
        metadata: { metadata: { variant: 'preview' } },
      }),
      bucket.file(`${dir}/${photoId}_display.jpg`).save(displayBuf, {
        contentType: 'image/jpeg',
        metadata: { metadata: { variant: 'display' } },
      }),
    ]);

    logger.info('Resized photo variants written', { photoId });
  },
);
