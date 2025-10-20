<script>
  import ChairHUD from "./lib/ChairHUD.svelte";
  import PressureReading from "./lib/PressureReading.svelte";
  import UserActions from "./lib/UserActions.svelte";
</script>

<main>
  <div class="vert-splitter">
    <ChairHUD />
    <div class="horiz-splitter">
      <UserActions />
      <PressureReading width={250} height={250} />
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #0b1016;
    color: #d9f2ff;
    font-family:
      system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      "Helvetica Neue",
      Arial,
      "Noto Sans",
      "Liberation Sans",
      sans-serif;
  }
  main {
    width: 100vw;
    min-height: 100dvh;
    display: grid;
    place-items: center;
  }
  #app {
    padding: 0;
  }
  .vert-splitter {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .horiz-splitter {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    width: 35vw;
  }
</style>
