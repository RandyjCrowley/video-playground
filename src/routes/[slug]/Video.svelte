<script lang="ts">
  import { onMount } from "svelte";
  import Bookmarks from "./Bookmarks.svelte";
  import SearchInput from "./SearchInput.svelte";

  export let video: Video;

  let transcriptURL = "";
  let transcriptText = "";
  let sections: Section[] = [];
  let videoElement: HTMLVideoElement;
  let transcriptContainer: HTMLElement;
  let autoScrollEnabled = true;
  let isAutoScroll = false;

  function constructVideoUrl() {
    if (!video.slug) return "";

    return `videos/${video.slug}/video.mp4`;
  }

  async function fetchTranscript() {
    if (!video.slug) return "";

    const transcript = await fetch(transcriptURL);
    return transcript.text();
  }

  function splitTranscript() {
    const chunks = transcriptText.split("\n\n").slice(1); // remove 'WEBVTT' header

    const sections = chunks.reduce((acc: Section[], chunk, index) => {
      const pieces = chunk.split("\n").filter((piece) => !!piece.length);
      if (!pieces.length) return acc;

      const id = index + 1;
      const timeRange = pieces[0];
      const text = pieces[1];

      const [initTimeString] = timeRange.split(" ");
      const timestampSeconds = convertTimeStringToTimestamp(initTimeString);
      const timestamp = timestampSeconds * 1000;

      const obj: Section = {
        id,
        timeString: initTimeString,
        timestamp,
        text,
        active: false,
      };

      acc = [...acc, obj];
      return acc;
    }, []);

    return sections;
  }

  function convertTimeStringToTimestamp(timeString: string): number {
    const timeIntervals = timeString.split(":");

    const seconds = parseInt(timeIntervals[timeIntervals.length - 1]) || 0;
    const minutes = parseInt(timeIntervals[timeIntervals.length - 2]) || 0;
    const hours = parseInt(timeIntervals[timeIntervals.length - 3]) || 0;

    const targetTimeInSeconds = hours * 3600 + minutes * 60 + seconds;
    return targetTimeInSeconds;
  }

  function convertSectionToTimestamp(section: string): number {
    const timeString = section.split(" ")[0];
    const timestamp = convertTimeStringToTimestamp(timeString);

    return timestamp;
  }

  function navigateToTimestamp(timestamp: number, index: number) {
    if (!video.slug) return;

    videoElement.currentTime = timestamp;
    videoElement.play();

    scrollToCurrentSection(index);
    // re-enable auto scrolling (otherwise there would be no way to reset it)
    autoScrollEnabled = true;
  }

  function findCurrentSectionIndex(currentTime: number): number {
    for (let i = 0; i < sections.length; i++) {
      const sectionStartTimeInSeconds = sections[i].timestamp / 1000;

      if (currentTime < sectionStartTimeInSeconds) {
        return Math.max(0, i - 1);
      }
    }

    return sections.length - 1;
  }

  function setActiveSection(index: number) {
    const updatedSections: Section[] = sections.reduce(
      (acc, section, currentIndex) => {
        section.active = index === currentIndex;
        acc.push(section);

        return acc;
      },
      [] as Section[],
    );

    sections = updatedSections;
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

  function searchTranscript(query: string) {
    let hits: Section[] = [];

    sections = sections.reduce((acc, section) => {
      if (query.length > 2 && section.text.includes(query)) {
        hits.push(section);

        section.highlightedText = section.text.replace(
          query,
          `<mark>${query}</mark>`,
        );
      } else section.highlightedText = "";

      acc.push(section);
      return acc;
    }, [] as Section[]);

    // scroll to first section that contains a hit
    if (hits.length) scrollToCurrentSection(hits[0].id);
  }

  onMount(async () => {
    if (video.slug) {
      // fetch and format transcript
      transcriptURL = video.slug ? `videos/${video.slug}/transcript.vtt` : "";
      transcriptText = await fetchTranscript();
      sections = splitTranscript();

      // bind video to var and turn on captions
      videoElement = document.getElementById(video.slug) as HTMLVideoElement;
      videoElement.textTracks[0].mode = "showing";
    }
  });
</script>

<div class="lg:h-screen">
  <div class="header mb-8">
    <h1
      class="mb-4 text-3xl font-extrabold leading-none tracking-tight text-gray-200 lg:text-3xl dark:text-white"
    >
      {video.title}
    </h1>
    <p class="text-gray-300">{video.description}</p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 h-screen lg:h-1/3">
    {#if video.slug}
      <div class="video-container">
        <video
          controls
          id={video.slug}
          class="h-auto w-full"
          crossorigin="anonymous"
          on:timeupdate={() => {
            const index = findCurrentSectionIndex(videoElement.currentTime);
            setActiveSection(index);

            if (autoScrollEnabled) scrollToCurrentSection(index);
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
        bind:this={transcriptContainer}
        class="h-64 lg:h-full border-slate-400 overflow-auto relative"
        on:scroll={handleScroll}
      >
        <div
          class="flex flex-row align-middle sticky top-0 bg-slate-800 pb-2 mb-2"
        >
          <h2 class="text-xl text-white">Transcript</h2>
          <SearchInput
            on:updateQuery={({ detail }) => searchTranscript(detail.query)}
          />
        </div>

        <div>
          {#each sections as section, index}
            <div
              id={`section-${index}`}
              class="mb-6"
              class:bg-teal-900={section.active}
            >
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
              {#if section.highlightedText?.length}
                <p class="text-gray-200 bg-teal-900">
                  {@html section.highlightedText}
                </p>
              {:else}
                <p class="text-gray-300">
                  {section.text}
                </p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if videoElement}
      <Bookmarks
        {video}
        currentTime={videoElement.currentTime}
        on:navigateToTimestamp={({ detail }) =>
          navigateToTimestamp(detail.timestamp, detail.index)}
      />
    {/if}
  </div>
</div>
