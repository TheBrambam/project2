<script>
  import ChairHUD from "./lib/ChairHUD.svelte";
</script>

<main>
  <ChairHUD />
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0b1016;
    color: #d9f2ff;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
  }
  main {
    min-height: 100dvh;
    display: grid;
    place-items: center;
  }
</style>
