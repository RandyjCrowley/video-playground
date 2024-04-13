<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let query: string = "";

  function updateQuery(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    dispatch("updateQuery", { query });
  }
</script>

<div class="ml-auto relative text-gray-600 focus-within:text-gray-400">
  <span class="absolute inset-y-0 left-0 flex items-center pl-2">
    <button class="p-1 focus:outline-none focus:shadow-outline">
      <svg
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        viewBox="0 0 24 24"
        class="w-6 h-6"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </button>
  </span>
  <input
    type="search"
    name="search"
    class="py-2 text-sm text-white bg-gray-900 rounded-md pl-10 pr-2 focus:outline-none"
    placeholder="Search"
    autocomplete="off"
    bind:value={query}
    on:input={updateQuery}
  />
</div>
