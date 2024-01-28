import Image from 'next/image';
import styles from './page.module.css';
import { getAllVideosFirestore } from './firebase/functions';
import Link from 'next/link';

export default async function Home() {
  const allVideos = await getAllVideosFirestore();

  return (
    <main>
      {allVideos.map((video) => {
        return (
          <Link key={video.id} href={`/watch?v=${video.filename}`}>
            <Image
              className={styles.thumbnail}
              src="/thumbnail.png"
              alt="video"
              width={120}
              height={80}
            ></Image>
          </Link>
        );
      })}
    </main>
  );
}

export const revalidate = 30;
