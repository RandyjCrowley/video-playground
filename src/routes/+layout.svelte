<script>
  import "../app.css";
</script>
<nav class="bg-slate-800 p-4">
  <ul class="flex flex-wrap items-center">
    <li>
      <a
        href="/"
        class="text-white hover:text-teal-300 px-4 py-2 rounded-md text-lg font-medium"
        >Home</a
      >
    </li>
  </ul>
</nav>

<div class="pt-4 pb-8 px-8">
  <slot />
</div>
