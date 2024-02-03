import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const projectId = 'peemtanapat-youtube-clone';
const storage = new Storage({
  projectId,
});

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const rawVideoBucketName = 'peemtanapat-yt-raw-videos';
const convertedVideoBucketName = 'peemtanapat-yt-processed-videos';
const rawVideoLocalPath = 'videos';
const convertedVideoLocalPath = 'outputs';

export function setupDirectories() {
  ensureLocalDirectoryExist(rawVideoLocalPath);
  ensureLocalDirectoryExist(convertedVideoLocalPath);
}

function ensureLocalDirectoryExist(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  }
}

export function convertVideo(rawVideoName: string, convertedVideoName: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(`${rawVideoLocalPath}/${rawVideoName}`)
      .outputOptions('-vf', 'scale=-1:360') // 360p
      .on('end', function () {
        console.log('Processing finished successfully');
        resolve('');
      })
      .on('error', function (err: any) {
        console.log('An error occurred: ' + err.message);
        reject(err);
      })
      .save(`${convertedVideoLocalPath}/${convertedVideoName}`);
  });
}

export async function downloadRawVideo(fileName: string) {
  const targetFileBucket = `${rawVideoBucketName}/${fileName}`;
  const localDestination = `${rawVideoLocalPath}/${fileName}`;

  console.log({ targetFileBucket, localDestination });

  await storage
    .bucket(rawVideoBucketName)
    .file(fileName)
    .download({ destination: localDestination });

  return {
    targetFileBucket,
    localDestination,
  };
}

export async function uploadVideoToBucket(
  bucketName: string,
  localFilePath: string,
  fileName: string,
  makeFilePublic = false
) {
  console.log({ uploadVideoToBucket: { bucketName, localFilePath, fileName } });
  const bucket = storage.bucket(bucketName);

  const destBucketPath = `${fileName}`;

  // const localFilePath = `${localFilePath}/${fileName}`;

  try {
    await bucket.upload(localFilePath, { destination: destBucketPath });
  } catch (error: any) {
    throw error;
  } finally {
    if (makeFilePublic) {
      await bucket.file(fileName).makePublic();
    }
  }

  // const resMessage = `${localFilePath} uploaded to '${destBucketPath}'`;
  const resMessage = {
    localFilePath,
    destBucketPath,
  };
  console.log(resMessage);

  return resMessage;
}

export async function uploadRawVideoToBucket(
  fileName: string,
  localFilePath = ''
) {
  return await uploadVideoToBucket(rawVideoBucketName, localFilePath, fileName);
}

export async function uploadProcessedVideoToBucket(fileName: string) {
  const localFilePath = `${convertedVideoLocalPath}/${fileName}`;
  const result = await uploadVideoToBucket(
    convertedVideoBucketName,
    localFilePath,
    fileName,
    true
  );
  console.log('%c⧭', 'color: #007300', { localFilePath, result });

  return result;
}

export function deleteLocalConvertedVideo(fileName: string) {
  return deleteFile(`${convertedVideoLocalPath}/${fileName}`);
}

export const deleteRawVideo = (fileName: string) => {
  return deleteFile(`${rawVideoLocalPath}/${fileName}`);
};

export function deleteFile(filePath: string): Promise<void> {
  console.log({ deleteFile: filePath });
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(`Failed to delete file ${filePath}`);
          reject(err);
        } else {
          console.log(`File deleted: ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log('deleteFile: File not exist!');
      resolve();
    }
  });
}
