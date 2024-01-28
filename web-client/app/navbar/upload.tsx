'use client';

import { Fragment } from 'react';

import styles from './upload.module.css';
import { uploadVideo } from '../firebase/functions';

export default function Upload() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const uploadResponse = await uploadVideo(file);
      alert(`Upload File Successfully: ${JSON.stringify(uploadResponse)}`);
    } catch (error) {
      alert(`Upload File Failed: ${error}`);
    }
  };

  return (
    <Fragment>
      <input
        id="upload"
        className={styles.uploadInput}
        type="file"
        accept="video/*"
        placeholder="Click to browse your files"
        onChange={handleFileChange}
      />
      <label htmlFor="upload" className={styles.uploadButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </label>
    </Fragment>
  );
}
