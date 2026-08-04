Drop video files you are LICENSED to stream in this folder, e.g.

  public/videos/neon-district/s1e1.mp4
  public/videos/neon-district/s1e2.mp4
  public/videos/hollow-point.mp4

Then point a title at them in src/data/catalog.js:

  film:    { id: 'hollow-point', ..., videoUrl: '/videos/hollow-point.mp4' }
  series:  { id: 'neon-district', ..., episodeVideos: ['/videos/neon-district/s1e1.mp4', ...] }

Remote URLs work too — including HLS (.m3u8) streams from your own CDN:

  videoUrl: 'https://cdn.example.com/licensed/master.m3u8'

Large media stays out of git (see .gitignore: public/videos/*.{mp4,mkv,webm,m3u8}).
For production, host media on object storage / a CDN and use absolute URLs here.
Legal sources to test with (verified live HLS, CC-BY Blender Foundation):
  https://cdn.theoplayer.com/video/big_buck_bunny/big_buck_bunny.m3u8
  https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
  https://cdn.theoplayer.com/video/elephants-dream/playlist.m3u8
Other legal sources: Blender Open Movies, Internet Archive public-domain films.
