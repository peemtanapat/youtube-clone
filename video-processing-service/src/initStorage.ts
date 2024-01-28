import { Storage } from '@google-cloud/storage';

const projectId = 'peemtanapat-youtube-clone';

export async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId,
  });

  const [buckets] = await storage.getBuckets();
  console.log('Bucket:');

  for (const bucket of buckets) {
    console.log(`- ${bucket.name}`);
  }

  console.log('Listed all storage buckets.');

  return storage;
}
