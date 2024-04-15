<script lang="ts">
  import VideoItem from "./Video.svelte";

  export let data: Video;
</script>

<VideoItem video={data} />
