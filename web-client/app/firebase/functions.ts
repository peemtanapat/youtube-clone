import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from './firebase';

const generateUploadUrlFunction = httpsCallable(
  firebaseFunctions,
  'generateUploadUrl'
);
const getVideosFunction = httpsCallable(firebaseFunctions, 'getVideos');

export async function uploadVideo(file: File) {
  const fileExtension = file.name.split('.').pop();
  const uploadUrlResponse: any = await generateUploadUrlFunction({
    fileExtension,
  });
  console.log('%c⧭', 'color: #ff6a00', { uploadUrlResponse });

  // Upload file via Signed URL
  const uploadResult = await fetch(uploadUrlResponse?.data?.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  console.log('%c⧭', 'color: #ffa640', { uploadResult });
  return uploadResult;
}

export interface Video {
  id?: string;
  uid?: string;
  filename?: string;
  status?: 'processing' | 'processed';
  title?: string;
  description?: string;
}

export async function getAllVideosFirestore() {
  const response = await getVideosFunction();
  console.log('%c⧭', 'color: #f200e2', {
    getAllVideosFirestoreZ: response.data,
  });
  return response.data as Video[];
}