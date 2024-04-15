import { videos } from '../data'

export function load({ params }) {
  const video = videos.find(video => video.slug === params.slug)
  return video
}