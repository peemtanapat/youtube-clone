import express from 'express';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import {
  convertVideo,
  deleteLocalConvertedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideoToBucket,
  uploadRawVideoToBucket,
} from './storage';
import { isVideoNew, setVideo } from './firestore';

setupDirectories();
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/process-video', async (req, res) => {
  let inputFileName: string;

  console.log({
    'process-video': {
      inputFileName: req.body.inputFileName,
      message: req.body.message?.data,
      messageId: req.body.message?.messageId,
      publishTime: req.body.message?.publishTime,
    },
  });

  if (req.body.inputFileName) {
    inputFileName = req.body.inputFileName;
  } else {
    try {
      const message = Buffer.from(req.body.message.data, 'base64').toString(
        'utf8'
      );
      const data = JSON.parse(message);

      if (!data.name) {
        throw new Error('Invalid message payload received.');
      }

      inputFileName = data.name;
    } catch (error) {
      console.error(error);
      return res.status(400).send('Bad Request: missing filename.');
    }
  }

  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split('.')[0];

  console.log({
    inputFileName,
    outputFileName,
    videoId,
  });

  if (!inputFileName || !outputFileName) {
    res.status(400).send('Bad Request: Missing file path.');
  }

  try {
    const isNewVideo = await isVideoNew(videoId);
    console.log({ isNewVideo });
    if (!isNewVideo) {
      res
        .status(400)
        .send('Bad Request: video already processing or processed');
      return;
    } else {
      await setVideo(videoId, {
        id: videoId,
        uid: videoId.split('-')[0],
        status: 'processing',
      });
    }

    // Download uploaded raw video
    await downloadRawVideo(inputFileName);

    // Convert raw video to be 360p
    await convertVideo(inputFileName, outputFileName);

    // upload converted video to Cloud Storage
    await uploadProcessedVideoToBucket(outputFileName);

    await setVideo(videoId, {
      status: 'processed',
      filename: outputFileName,
    });

    console.log('Video Processing completed');

    res.status(200).send({ processedFileName: outputFileName });
    return;
  } catch (error: any) {
    res.status(500).send('An error occurred: ' + error.message);
  } finally {
    // delete files;
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteLocalConvertedVideo(outputFileName),
    ]);
  }
});

app.post('/upload-raw-video', async (req, res) => {
  const inputFilePath = req.body.inputFilePath;
  const fileName = path.basename(inputFilePath);

  try {
    const resMessage = await uploadRawVideoToBucket(fileName, inputFilePath);
    res.status(200).send(resMessage);
  } catch (error: any) {
    res.status(500).send('An error occurred: ' + error.message);
  }
});

app.get('/', (req, res) => {
  res.send('Hello Human!');
});

app.listen(PORT, () => {
  console.log(`Video Processing Service listening http://localhost:${PORT}`);
});
