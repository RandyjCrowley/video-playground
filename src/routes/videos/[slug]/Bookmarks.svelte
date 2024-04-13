<script lang="ts">
  import BookmarkItem from "./Bookmark.svelte";
  import { createEventDispatcher, onMount } from "svelte";

  export let video: Video;
  export let currentTime: number;

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
      timestamp: currentTime,
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

  function deleteBookmark(bookmark: Bookmark) {
    const updatedBookmarks = bookmarks.filter(
      (i) => i.createdAt !== bookmark.createdAt,
    );
    bookmarks = updatedBookmarks;

    localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
  }

  function navigateToTimestamp(detail) {
    dispatch("navigateToTimestamp", detail);
  }

  onMount(() => {
    getBookmarksFromLocalStorage();
  });
</script>

<div class="flex flex-col">
  <h2 class="mb-2 text-xl text-white">Bookmarks</h2>
  <button
    on:click={addBookmark}
    class="flex text-center mt-2 mb-6 items-center border-slate-500 border rounded-md p-2 w-fit hover:bg-teal-800 hover:border-teal-800"
  >
    <img class="mr-2 h-4" src="../icons/bookmark.png" alt="bookmark" />
    <p class="text-white">Add bookmark</p>
  </button>

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
