'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment } from 'react';

export default function Watch() {
  const videoBucketPrefixUrl =
    'https://storage.googleapis.com/peemtanapat-yt-processed-videos';
  const videoSrc = useSearchParams().get('v');

  return (
    <Fragment>
      <h1>Watch Page</h1>
      <video controls src={`${videoBucketPrefixUrl}/${videoSrc}`}></video>
    </Fragment>
  );
}
