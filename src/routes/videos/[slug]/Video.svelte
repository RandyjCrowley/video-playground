<script lang="ts">
  import BookmarkItem from "./Bookmark.svelte";
  import { onMount } from "svelte";

  export let video: Video;

  let transcriptURL = "";
  let transcriptText = "";
  let sections: Section[] = [];
  let bookmarks: Bookmark[] = [];
  let videoElement: HTMLVideoElement;
  let transcriptContainer: HTMLElement;
  let autoScrollEnabled = true;
  let isAutoScroll = false;

  function constructVideoUrl() {
    if (!video.slug) return "";

    return `${video.slug}/video.mp4`;
  }

  async function fetchTranscript() {
    if (!video.slug) return "";

    const transcript = await fetch(transcriptURL);
    return transcript.text();
  }

  function splitTranscript() {
    const chunks = transcriptText.split("\n\n").slice(1); // remove 'WEBVTT' header

    const sections = chunks.reduce((acc: Section[], chunk) => {
      const pieces = chunk.split("\n").filter((piece) => !!piece.length);
      if (!pieces.length) return acc;

      const id = parseInt(pieces[0]);
      const timeString = pieces[1];
      const text = pieces[2];

      const timestampSeconds = convertTimeStringtoTimestamp(timeString);
      const timestamp = timestampSeconds * 1000;

      const obj: Section = {
        id,
        timeString,
        timestamp,
        text,
      };

      acc = [...acc, obj];
      return acc;
    }, []);

    return sections;
  }

  function convertTimeStringtoTimestamp(timeString: string): number {
    const timeIntervals = timeString.split(":");
    const hours = parseInt(timeIntervals[0]);
    const minutes = parseInt(timeIntervals[1]);
    const seconds = parseInt(timeIntervals[2]);

    const targetTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return targetTimeInSeconds;
  }

  function convertSectionToTimestamp(section: string): number {
    const timeString = section.split(" ")[0];
    const timestamp = convertTimeStringtoTimestamp(timeString);

    return timestamp;
  }

  function navigateToTimestamp(timestamp: number, index: number): void {
    if (!video.slug) return;

    videoElement.currentTime = timestamp;
    videoElement.play();

    scrollToCurrentSection(index);
    // re-enable auto scrolling (otherwise there would be no way to reset it)
    autoScrollEnabled = true;
  }

  function findCurrentSectionIndex(currentTime: number): number {
    for (let i = 0; i < sections.length; i++) {
      const sectionTimeStart = sections[i].timestamp / 1000;

      if (currentTime < sectionTimeStart) {
        return Math.max(0, i - 1);
      }
    }
    return sections.length - 1;
  }

  function scrollToCurrentSection(sectionIndex: number) {
    isAutoScroll = true;

    const currentSectionElement = document.getElementById(
      `section-${sectionIndex}`,
    );

    if (currentSectionElement && transcriptContainer) {
      // Calculate the offset of the section relative to the transcriptContainer
      const sectionOffsetTop = currentSectionElement.offsetTop;
      const containerOffsetTop = transcriptContainer.offsetTop;
      const relativeOffsetTop = sectionOffsetTop - containerOffsetTop;

      const scrollOptions = {
        top: relativeOffsetTop,
        left: 0,
        behavior: "smooth",
      };

      transcriptContainer.scrollTo(scrollOptions);
    }

    setTimeout(() => {
      isAutoScroll = false;
    }, 500);
  }

  function handleScroll() {
    // disable auto scroll when the user manually scrolls the transcript container
    if (!isAutoScroll) autoScrollEnabled = false;
  }

  function addBookmark() {
    if (!video.slug) return;

    // Don't create duplicate bookmarks for the same timestamp
    const preexistingBookmark = bookmarks.find((b) => {
      console.log("b", b);
      return b.timestamp === videoElement.currentTime;
    });
    if (preexistingBookmark) return;

    const bookmark: Bookmark = {
      videoSlug: video.slug,
      timestamp: videoElement.currentTime,
      createdAt: new Date(),
    };

    bookmarks = [...bookmarks, bookmark];
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  function getBookmarksFromLocalStorage() {
    const storedBookmarks = localStorage.getItem("bookmarks");
    if (!storedBookmarks?.length) return;

    bookmarks = JSON.parse(storedBookmarks);
  }

  function deleteBookmark(bookmark: Bookmark) {
    const updatedBookmarks = bookmarks.filter(
      (i) => i.createdAt !== bookmark.createdAt,
    );
    bookmarks = updatedBookmarks;

    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }

  onMount(async () => {
    if (video.slug) {
      // fetch and format transcript
      transcriptURL = video.slug ? `${video.slug}/transcript.vtt` : "";
      transcriptText = await fetchTranscript();
      sections = splitTranscript();

      // bind video to var and turn on captions
      videoElement = document.getElementById(video.slug) as HTMLVideoElement;
      videoElement.textTracks[0].mode = "showing";

      getBookmarksFromLocalStorage();
    }
  });
</script>

<div class="m-8 h-screen">
  <div class="header mb-8">
    <h1
      class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-200 md:text-3xl lg:text-3xl dark:text-white"
    >
      {video.title}
    </h1>
    <p class="text-gray-300">{video.description}</p>
  </div>

  <div class="grid grid-cols-2 gap-4 h-1/3">
    {#if video.slug}
      <div class="video-container">
        <video
          controls
          id={video.slug}
          class="h-auto w-full"
          crossorigin="anonymous"
          on:timeupdate={() => {
            if (autoScrollEnabled) {
              const index = findCurrentSectionIndex(videoElement.currentTime);
              scrollToCurrentSection(index);
            }
          }}
        >
          <track
            kind="captions"
            src={transcriptURL}
            srclang="en"
            label="English"
            default
          />
          <source src={constructVideoUrl()} type="video/mp4" />
        </video>
      </div>
    {/if}

    {#if transcriptText?.length}
      <div
        id="transcript"
        bind:this={transcriptContainer}
        class="h-full overflow-auto"
        on:scroll={handleScroll}
      >
        {#each sections as section, index}
          <div id={`section-${index}`} class="mb-6">
            <button
              class="text-teal-300 mb-2"
              on:click={() =>
                navigateToTimestamp(
                  convertSectionToTimestamp(section.timeString),
                  index,
                )}
            >
              {section.timeString}
            </button>
            <p class="text-gray-300">{section.text}</p>
          </div>
        {/each}
      </div>
    {/if}

    <div class="flex flex-col">
      <button on:click={addBookmark} class="flex text-center mt-2">
        <img class="mr-2 h-6" src="../icons/bookmark.png" alt="bookmark" />
        <p class="text-white">Add bookmark</p>
      </button>

      {#if bookmarks?.length}
        <h2 class="mt-16 mb-4 text-xl text-white">Bookmarks</h2>
        {#each bookmarks as bookmark}
          <BookmarkItem
            {bookmark}
            on:navigateToTimestamp={({ detail }) =>
              navigateToTimestamp(detail.timestamp, detail.index)}
            on:deleteBookmark={({ detail }) => deleteBookmark(detail.bookmark)}
          />
        {/each}
      {/if}
    </div>
  </div>
</div>
