<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let bookmark: Bookmark;

  const dispatch = createEventDispatcher();

  function navigateToTimestamp(timestamp: number, index: number) {
    dispatch("navigateToTimestamp", { timestamp, index });
  }

  function convertTimestampToTimeString(timestamp: number): string {
    const timeString = new Date(1000 * timestamp)
      .toISOString()
      .slice(0, -5)
      .split("T")[1]
      .replace("00:", "");

    return timeString;
  }

  function deleteBookmark(bookmark: Bookmark) {
    dispatch("deleteBookmark", { bookmark });
  }
</script>

<div class="bookmark flex items-center w-fit">
  <button
    class="mb-2 mt-2 mr-2 flex w-fit"
    on:click={() => navigateToTimestamp(bookmark.timestamp, 0)}
  >
    <img class="h-6 mr-4" src="../icons/bookmark.png" alt="bookmark" />
    <p class="text-teal-300">
      {convertTimestampToTimeString(Math.round(bookmark.timestamp))}
    </p>
  </button>
  <button
    on:click={() => deleteBookmark(bookmark)}
    class="delete-icon justify-center text-center align-top w-5 h-5 text-sm normalize-line-height text-gray-300 border-2 border-gray-300 rounded-full"
    >x</button
  >
</div>

<style>
  .bookmark .delete-icon {
    display: none;
  }

  .bookmark:hover .delete-icon {
    display: flex;
  }

  .normalize-line-height {
    line-height: 0.875rem;
  }
</style>
