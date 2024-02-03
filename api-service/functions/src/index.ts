import * as admin from 'firebase-admin';

import { UserRecord } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import * as logger from 'firebase-functions/logger';
import { Firestore } from 'firebase-admin/firestore';
import { Storage } from '@google-cloud/storage';
import { onCall } from 'firebase-functions/v2/https';

const rawVideoBucketName = 'peemtanapat-yt-raw-videos';
const videoCollectionId = 'videos';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp();

const firestore = new Firestore();
const storage = new Storage();

const MY_REGION = 'asia-southeast1';
const myFunctions = functions.region(MY_REGION);

export const createUser = myFunctions.auth
  .user()
  .onCreate((user: UserRecord) => {
    const userId = user.uid;
    const userInfo = {
      uid: userId,
      email: user.email,
      photoUrl: user.photoURL,
    };

    firestore.collection('users').doc(userId).set(userInfo);

    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
  });

export const generateUploadUrl = onCall(
  { maxInstances: 1, region: MY_REGION, cors: '*' },
  async (request) => {
    console.log({ generateUploadUrl: request });
    // Check if the user is authenticated
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called while authenticated.'
      );
    }

    const auth = request.auth as any;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);
    console.log({ auth, data, bucket });

    const fileName = `${auth?.uid}-${Date.now()}.${data.fileExtension}`;
    console.log({ fileName });

    const [url] = await bucket.file(fileName).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
    });

    return { url, fileName };
  }
);

export const getVideos = onCall(
  { maxInstances: 1, region: MY_REGION, cors: '*' },
  async () => {
    const snapshot = await firestore
      .collection(videoCollectionId)
      .limit(10)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }
);
