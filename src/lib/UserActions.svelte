<script>
  import { chair } from "../chair.svelte";
  import {
    user,
    goodPosture,
    leanLeft,
    leanRight,
    standing,
  } from "../user.svelte";
</script>

<main>
  <div class="buttons">
    <div class="button-list">
      <button
        on:click={() => {
          user.posturePressure = goodPosture;
        }}>Sit</button
      >
      <button
        on:click={() => {
          user.posturePressure = leanLeft;
        }}>Sit With Left Lean</button
      >
      <button
        on:click={() => {
          user.posturePressure = leanRight;
        }}>Sit With Right Lean</button
      >
      <button
        on:click={() => {
          user.posturePressure = standing;
        }}>Stand</button
      >
    </div>
  </div>
</main>

<style>
  .buttons {
    display: flex;
    flex-direction: column;
    height: 50vh;
  }
  .button-list {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    button {
      width: 250px;
    }
  }
</style>
