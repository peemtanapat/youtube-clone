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
  const inputFilePath = req.body.inputFilePath;
  const fileName = path.basename(inputFilePath);
  console.log('%c⧭', 'color: #733d00', { fileName });
  const outputFilePath = req.body.outputFilePath;
  const videoId = inputFilePath.split('.')[0];

  console.log('%c⧭', 'color: #00b300', {
    inputFilePath,
    fileName,
    outputFilePath,
    videoId,
  });

  if (!inputFilePath || !outputFilePath) {
    res.status(400).send('Bad Request: Missing file path.');
  }

  try {
    const isNewVideo = await isVideoNew(videoId);
    console.log('%c⧭', 'color: #1d5673', { isNewVideo });
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

    await downloadRawVideo(fileName);

    // Convert raw video to be 360p
    await convertVideo(inputFilePath, outputFilePath);

    // upload converted video to Cloud Storage
    const processedFileName = path.basename(outputFilePath);
    await uploadProcessedVideoToBucket(processedFileName);

    await setVideo(videoId, {
      status: 'processed',
      filename: outputFilePath,
    });

    console.log('Video Processing completed');

    res.status(200).send({ processedFileName });
    return;
  } catch (error: any) {
    res.status(500).send('An error occurred: ' + error.message);
    return;
  } finally {
    // delete files
    await Promise.all([
      deleteRawVideo(inputFilePath),
      deleteLocalConvertedVideo(outputFilePath),
    ]);
  }
});

app.post('/upload-raw-video', async (req, res) => {
  const inputFilePath = req.body.inputFilePath;
  const fileName = path.basename(inputFilePath);
  const inputDir = inputFilePath.replace(`/${fileName}`, '');

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
