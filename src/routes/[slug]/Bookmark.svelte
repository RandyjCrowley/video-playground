<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let bookmark: Bookmark;
  const dispatch = createEventDispatcher();

  let title = bookmark.title;
  let note = bookmark.note;
  let startTime = bookmark.startTime;
  let endTime = bookmark.endTime;

  function navigateToTimestamp(timestamp: number) {
    dispatch("navigateToTimestamp", { timestamp });
  }

  function convertTimestampToTimeString(timestamp: number): string {
    console.log(timestamp)
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

  function updateBookmark({ title, note, startTime, endTime }: BookmarkUpdateParams) {
    dispatch("updateBookmark", { title, note, startTime, endTime, createdAt: bookmark.createdAt });
  }

  $: updateBookmark({ title, note, startTime, endTime });

</script>

<div class="bookmark">
  <div class="flex items-center w-fit">
    <button
      class="mb-2 mt-2 mr-2 flex w-fit"
      on:click={() => navigateToTimestamp(bookmark.startTime)}
    >
      <img class="h-6 mr-4" src="../icons/bookmark.png" alt="bookmark" />
      <p class="text-teal-300">
        {convertTimestampToTimeString(Math.round(bookmark.startTime))} -
        {convertTimestampToTimeString(Math.round(bookmark.endTime))}
      </p>
    </button>
    <button
      on:click={() => deleteBookmark(bookmark)}
      class="delete-icon justify-center text-center align-top w-5 h-5 text-sm normalize-line-height text-gray-300 border-2 border-gray-300 rounded-full"
      >x</button
    >
  </div>
  <div class="flex flex-col">
    <input
      type="text"
      name="title"
      id={`title_${bookmark.createdAt}`}
      bind:value={title}
      placeholder="Title"
      class="my-1 py-2 text-sm text-white bg-gray-900 rounded-md px-2 focus:outline-none"
    />
    <div class="flex justify-between">
      <input
        type="text"
        name="startTime"
        id={`startTime_${bookmark.createdAt}`}
        bind:value={startTime}
        on:change={() => {
          startTime = parseFloat(startTime);
          if (startTime > endTime) endTime = startTime;
        }}
        placeholder="Start Time"
        class="my-1 py-2 text-sm text-white bg-gray-900 rounded-md px-2 focus:outline-none w-24"
      />
      <input
        type="text"
        name="endTime"
        id={`endTime_${bookmark.createdAt}`}
        bind:value={endTime}
        on:change={() => {
          endTime = parseFloat(endTime);
          if (endTime < startTime) startTime = endTime;
        }}
        placeholder="End Time"
        class="my-1 py-2 text-sm text-white bg-gray-900 rounded-md px-2 focus:outline-none w-24"
      />
    </div>
    <textarea
      name="note"
      id={`note_${bookmark.createdAt}`}
      bind:value={note}
      rows="4"
      placeholder="Note"
      class="my-1 py-2 text-sm text-white bg-gray-900 rounded-md px-2 focus:outline-none"
    ></textarea>
  </div>
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
