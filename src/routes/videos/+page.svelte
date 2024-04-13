<script lang="ts">
  export let data;
</script>

<h2 class="mb-4 text-2xl font-bold text-white">Videos</h2>
<ul class="list-none m-0 p-0">
  {#each data.videos as video}
    <li class="mb-4">
      <a
        href={`videos/${video.slug}`}
        class="flex flex-col no-underline hover:text-teal-300"
      >
        <h3 class="text-xl text-white font-bold">{video.title}</h3>
        <p class="text-gray-300">{video.description}</p>
      </a>
    </li>
  {/each}
</ul>
