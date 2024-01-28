'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const VIDEO_BUCKET_URL =
  'https://storage.googleapis.com/peemtanapat-yt-processed-videos';

export default function Watch() {
  return (
    <Suspense>
      <h1>Watch Page</h1>
      <VideoPlayer />
    </Suspense>
  );
}

function VideoPlayer() {
  const searchParams = useSearchParams();
  const videoSrc = searchParams.get('v');

  return <video controls src={`${VIDEO_BUCKET_URL}/${videoSrc}`} />;
}
