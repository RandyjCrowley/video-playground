<script lang="ts">
  import BookmarkItem from "./Bookmark.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  export let video: Video;
  export let videoElement: any;

  const dispatch = createEventDispatcher();

  const bookmarksKey = `bookmarks:video_${video.slug}`;

  let bookmarks: Bookmark[] = [];

  function getBookmarksFromLocalStorage() {
    const storedBookmarksString = localStorage.getItem(bookmarksKey);
    if (!storedBookmarksString?.length) return;

    const storedBookmarks: Bookmark[] = JSON.parse(storedBookmarksString);

    const bookmarksForCurrentVideo = storedBookmarks.filter(
      (bookmark) => bookmark.videoSlug === video.slug,
    );

    bookmarks = bookmarksForCurrentVideo;
  }
  function addBookmark() {
    if (!video.slug) return;
    const bookmark: Bookmark = {
      videoSlug: video.slug,
      startTime: videoElement.currentTime == 0 ? 0 : videoElement.currentTime - 30,
      endTime: videoElement.currentTime + 30,
      createdAt: new Date(),
      title: "",
      note: "",
    };
    bookmarks = [...bookmarks, bookmark];
    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  }

  function updateBookmark(bookmarkUpdateParams: BookmarkUpdateParams) {
    const updatedBookmarks = bookmarks.map((bookmark) =>
      bookmark.createdAt === bookmarkUpdateParams.createdAt
        ? { ...bookmark, ...bookmarkUpdateParams }
        : bookmark,
    );
    bookmarks = updatedBookmarks;
    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  }

  function navigateToTimestamp(detail) {
    dispatch("navigateToTimestamp", detail);
    if (detail.endTime) {
      // If there's an end time, set up a timer to pause the video
      setTimeout(() => {
        if (videoElement.currentTime >= detail.endTime) {
          videoElement.pause();
        }
      }, (detail.endTime - detail.startTime) * 1000);
    }
  }

  function deleteBookmark(bookmark: Bookmark) {
    const updatedBookmarks = bookmarks.filter(
      (i) => i.createdAt !== bookmark.createdAt,
    );
    bookmarks = updatedBookmarks;

    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  }


  onMount(() => {
    getBookmarksFromLocalStorage();
  });
</script>

<div class="flex flex-col">
  <div class="flex justify-between items-center mb-2">
    <h2 class="text-xl text-white">Bookmarks</h2>
    <button
      on:click={addBookmark}
      class="flex text-center items-center border-slate-500 border rounded-md p-2 w-fit hover:bg-teal-800 hover:border-teal-800"
    >
      <img class="mr-2 h-4" src="../icons/bookmark.png" alt="bookmark" />
      <p class="text-white">Add bookmark</p>
    </button>
  </div>
  {#if bookmarks?.length}
    {#each bookmarks as bookmark (bookmark.createdAt)}
      <BookmarkItem
        {bookmark}
        on:navigateToTimestamp={({ detail }) => navigateToTimestamp(detail)}
        on:deleteBookmark={({ detail }) => deleteBookmark(detail.bookmark)}
        on:updateBookmark={({ detail }) => updateBookmark(detail)}
      />
    {/each}
  {/if}
</div>
