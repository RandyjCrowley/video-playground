<script lang="ts">
  export let data;

  $: console.log("data", data);
</script>

<ul>
  {#each data.videos as video}
    <a href={`videos/${video.slug}`}>
      <li>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
      </li>
    </a>
  {/each}
</ul>
