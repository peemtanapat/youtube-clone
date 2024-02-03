# youtube-clone

1. User click upload video on Web Client via URL from generateUploadUrl
2. Video saved to Raw video bucket
3. TopicSubscription is triggered and PUSH message
   to CloudRun (POST /process-video)

## Future Work

Below is a list of future work that can be done to improve our app.

- [ ] Add unit and integration tests
- [ ] Add user's profile picture and email to Web Client
- [ ] (Bug fix) Allow users to upload multiple videos without refreshing the page
- [ ] Allow users to upload thumbnails for their videos
- [ ] Allow user's to add a title and description to their videos
- [ ] Show the uploader of a video
- [ ] Allow user's to subscribe to other user's channels
- [ ] Clean up raw videos in Cloud Storage after processing
- [ ] Use a CDN to serve videos

## video-processing-service

### 0. Configure gcloud

```shell
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### 1. Docker build and push (example) \* remove --platform linux/amd64, if you aren't using it

```shell
docker buildx build --platform linux/amd64 -t asia-docker.pkg.dev/peemtanapat-youtube-clone/video-processing-repo/video-processing-service . && docker push asia-docker.pkg.dev/peemtanapat-youtube-clone/video-processing-repo/video-processing-service
```

### 2. Deploy (example)

```shell
gcloud services enable run.googleapis.com

gcloud run deploy video-processing-service --image asia-docker.pkg.dev/peemtanapat-youtube-clone/video-processing-repo/video-processing-service \
--region=asia-southeast1 \
--platform managed \
--timeout=3600 \
--memory=2Gi \
--cpu=1 \
--min-instances=0 \
--max-instances=1 \
--ingress=all
```
