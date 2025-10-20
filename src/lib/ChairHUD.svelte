<script>
  import { onMount, onDestroy } from "svelte";
  // Separate interactive controls
  import { chair } from "../chair.svelte.js";
  import { goodPosture, user } from "../user.svelte.js";
  let glow = 0.65; // UI glow intensity for the HUD

  // blips for motion
  const blips = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    r: 80 + Math.random() * 230,
    a: Math.random() * 360,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 3,
  }));

  // Start the timer fresh every time
  function startTimer() {
    resetTimer(); // clear and reset
    chair.timer = setInterval(() => {
      chair.activePositionTime = chair.activePositionTime + 1; // keep this reactive
    }, 1000);
  }

  function stopTimer() {
    if (chair.timer) {
      clearInterval(chair.timer);
      chair.timer = null; // <- important so startTimer() knows there's no running timer
    }
  }

  function resetTimer() {
    stopTimer();
    chair.activePositionTime = 0;
    chair.postureAlert = true;
  }

  // reactive computed time string — re-runs when `seconds` changes

  function getTimeElapsed(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  // Called whenever a slider is changed
  function onSliderChange() {
    startTimer();
  }

  $effect(() => {
    console.log(chair.postureAlert);
  });
</script>

<div class="hud" style="--glow:{glow}">
  <div class="dial">
    <div class="rings"></div>
    <div class="grid"></div>

    {#each blips as b}
      <div
        class="blip"
        style="
          --r:{b.r}px;
          --a:{b.a}deg;
          --s:{b.size}px;
          --d:{b.delay}s;
        "
      ></div>
    {/each}

    <div class="center">
      {#if !chair.postureAlert}
        <!-- Chair SVG -->
        <svg
          class="chair"
          viewBox="0 0 220 170"
          width="240"
          height="164"
          aria-label="Reclining chair"
        >
          <!-- base platform + pedestal -->
          <!-- <g opacity="0.9">
          <rect x="28" y="126" width="164" height="10" rx="5" class="line" />
          <rect x="96" y="119" width="28" height="6" rx="2" class="line" />
          <ellipse
            cx="110"
            cy="127"
            rx="7"
            ry="3.5"
            fill="hsl(190 100% 80% / 0.35)"
          />
        </g>

        <!-- Seat -->
          <rect x="62" y="96" width="96" height="20" rx="7" class="panel" />
          <g class="hair">
            <line x1="72" y1="106" x2="148" y2="106" />
            <line x1="72" y1="102" x2="148" y2="102" />
          </g>

          <!-- Backrest -->
          <g transform="translate(62,96) rotate({-chair.recline})">
            <rect x="-6" y="-72" width="20" height="72" rx="9" class="panel" />
            <rect x="2" y="-88" width="10" height="16" rx="8" class="panel" />
            <!-- <ellipse cx="16" cy="-34" rx="14" ry="8" class="panel" /> -->
            <g class="hair" opacity="0.9">
              <line x1="4" y1="-66" x2="4" y2="-8" />
            </g>
          </g>

          <!-- Armrest -->
          <!-- <path d="M70,92 h62 a7,7 0 0 1 7,7 v4 h-14 v-2 a3,3 0 0 0-3-3 H70 z"
              class="line" opacity="0.85"/> -->

          <!-- Leg rest -->
          <g transform="translate(158,106) rotate({chair.leg})">
            <rect x="0" y="-14" width="54" height="14" rx="6" class="panel" />
            <g class="hair">
              <line x1="8" y1="-12" x2="8" y2="-4" />
              <line x1="18" y1="-12" x2="18" y2="-4" />
              <line x1="28" y1="-12" x2="28" y2="-4" />
              <line x1="38" y1="-12" x2="38" y2="-4" />
              <line x1="48" y1="-12" x2="48" y2="-4" />
            </g>
          </g>

          <path d="M74,116 h72" class="line" opacity="0.6" />
        </svg>

        <!-- Sliders under labels -->
        <div class="readouts">
          <div class="metric">
            <div class="label">RECLINE <span>{chair.recline}&deg;</span></div>
            <input
              class="mini-range"
              type="range"
              min="0"
              max="60"
              bind:value={chair.recline}
              onchange={onSliderChange}
            />
          </div>
          <div class="metric">
            <div class="label">LEG REST <span>{chair.leg}&deg;</span></div>
            <input
              class="mini-range"
              type="range"
              min="0"
              max="80"
              bind:value={chair.leg}
              onchange={onSliderChange}
            />
          </div>
          <div class="timer">
            <div class="label">TIME ELAPSED:</div>
            <div class="value">{getTimeElapsed(chair.activePositionTime)}</div>
          </div>
        </div>
      {:else}
        <div class="alert-message">
          <strong>Posture Alert</strong>
          <p>Would you like to automatically adjust your posture?</p>
          <div class="buttons">
            <button
              onclick={() => {
                chair.zoneHeights = [
                  [0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0, 0],
                ];
                chair.pressureReadings = chair.pressureReadings.map((row, i) =>
                  row.map(
                    (value, j) =>
                      user.posturePressure[i][j] -
                      chair.zoneHeights[i][j] * 2 +
                      (i - 3) * (chair.recline / 3) +
                      -(i - 3) * ((chair.leg - 80) / 6)
                  )
                );
                chair.zoneHeights = chair.pressureReadings.map((row, i) =>
                  row.map((value, j) =>
                    Math.max(
                      Math.min(value - goodPosture[i][j], chair.maxAdjust),
                      chair.minAdjust
                    )
                  )
                );
                chair.postureAlert = false;
              }}>Yes</button
            >
            <button
              onclick={() => {
                chair.postureAlert = false;
              }}>No</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Glow control -->
  <!-- <div class="controls">
    <label
      >Glow
      <input type="range" min="0" max="1" step="0.05" bind:value={glow} />
    </label>
  </div> -->
</div>

<style>
  .hud {
    border-right: solid white 3px;
    padding-right: 5rem;
    height: 90%;
    aspect-ratio: 1/1;
    position: relative;
    display: grid;
    place-items: center;
    filter: drop-shadow(0 0 40px hsl(190 90% 50% / calc(0.15 * var(--glow))));
  }

  .dial {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: radial-gradient(
        closest-side,
        hsl(200 80% 8%) 0 40%,
        transparent 70%
      ),
      radial-gradient(closest-side, hsl(200 80% 6%) 0 85%, transparent 86%),
      radial-gradient(closest-side, hsl(200 80% 4%) 0 99%, transparent 100%);
    box-shadow:
      inset 0 0 0 2px hsl(190 100% 50% / 0.2),
      0 0 0 1px hsl(190 100% 50% / 0.15);
  }

  .rings {
    position: absolute;
    inset: 0;
    background: repeating-radial-gradient(
      circle at 50% 50%,
      hsl(190 100% 55% / 0.06),
      hsl(190 100% 55% / 0.06) 2px,
      transparent 2px,
      transparent 36px
    );
    mask: radial-gradient(circle at 50% 50%, transparent 0 30px, #000 40px);
  }

  .grid {
    position: absolute;
    inset: 0;
    background: repeating-conic-gradient(
      from 0deg,
      hsl(190 100% 55% / 0.06) 0 1deg,
      transparent 1deg 15deg
    );
    mask: radial-gradient(circle at 50% 50%, transparent 0 26px, #000 32px);
  }

  .tick {
    position: absolute;
    left: 50%;
    top: 50%;
    translate: -50% -50%;
    width: calc(var(--r) * 2);
    height: calc(var(--r) * 2);
    border: 1px dashed hsl(190 100% 55% / 0.18);
    border-radius: 50%;
    pointer-events: none;
    font-size: 10px;
    color: hsl(190 100% 70% / 0.7);
    display: grid;
    place-items: start end;
    padding: 6px;
  }

  .blip {
    position: absolute;
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    background: hsl(190 100% 60%);
    left: 50%;
    top: 50%;
    transform: translate(calc(var(--r) * 1px), 0) rotate(var(--a))
      translateX(-50%) translateY(-50%);
    transform-origin: 0 0;
    box-shadow:
      0 0 6px 2px hsl(190 100% 60% / 0.6),
      0 0 16px 4px hsl(190 100% 60% / 0.25);
    animation: ping 2.4s ease-out infinite;
    animation-delay: var(--d);
    mix-blend-mode: screen;
  }
  @keyframes ping {
    0% {
      opacity: 0;
      transform: scale(0.9) translate(-50%, -50%);
    }
    12% {
      opacity: 1;
    }
    60% {
      opacity: 0.2;
    }
    100% {
      opacity: 0;
      transform: scale(1.8) translate(-50%, -50%);
    }
  }
  .alert-message {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .center {
    position: absolute;
    inset: 50% auto auto 50%;
    translate: -50% -50%;
    width: 56%;
    aspect-ratio: 1.35 / 1;
    border-radius: 16px;
    padding: 14px 16px;
    background: linear-gradient(
        180deg,
        hsl(200 80% 12% / 0.7),
        hsl(200 80% 7% / 0.7)
      ),
      radial-gradient(
        120% 100% at 50% 0%,
        hsl(190 100% 60% / 0.12),
        transparent 60%
      );
    box-shadow:
      inset 0 0 0 1px hsl(190 100% 55% / 0.25),
      0 10px 30px hsl(190 100% 50% / 0.08);
    display: grid;
    grid-template-rows: auto auto;
    gap: 10px;
    place-items: center;
  }

  .chair {
    display: block;
    filter: drop-shadow(
      0 0 12px hsl(190 100% 60% / calc(0.35 + var(--glow) * 0.4))
    );
  }
  .panel {
    fill: hsl(190 100% 60% / 0.12);
    stroke: hsl(190 100% 65% / 0.85);
    stroke-width: 1.8;
    paint-order: stroke fill;
  }
  .line {
    fill: none;
    stroke: hsl(190 100% 65% / 0.7);
    stroke-width: 2.2;
  }
  .hair line {
    stroke: hsl(190 100% 65% / 0.55);
    stroke-width: 1;
    opacity: 0.9;
  }

  .readouts {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
    font-size: 12px;
    letter-spacing: 0.12em;
    color: hsl(190 100% 80%);
    align-items: start;
  }
  .metric {
    display: grid;
    gap: 6px;
  }
  .label {
    width: 100%;
  }
  .label span {
    float: right;
    color: hsl(190 100% 70%);
  }
  .timer {
    grid-column: span 2;
    text-align: center;
  }

  .mini-range {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      hsl(190 100% 60% / 0.25),
      hsl(190 100% 60% / 0.55)
    );
    outline: none;
    box-shadow: inset 0 0 0 1px hsl(190 100% 60% / 0.35);
  }
  .mini-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    box-shadow:
      0 0 0 3px hsl(190 100% 60%),
      0 0 14px 2px hsl(190 100% 60% / 0.6);
    cursor: pointer;
  }

  .controls {
    position: absolute;
    bottom: -74px;
    width: 36%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    font-size: 12px;
    letter-spacing: 0.06em;
    color: hsl(190 100% 85%);
  }
  .controls label {
    display: grid;
    gap: 6px;
  }
  .controls input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      hsl(190 100% 60% / 0.3),
      hsl(190 100% 60% / 0.6)
    );
    outline: none;
    box-shadow: inset 0 0 0 1px hsl(190 100% 60% / 0.35);
  }
  .controls input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    box-shadow:
      0 0 0 3px hsl(190 100% 60%),
      0 0 18px 2px hsl(190 100% 60% / 0.6);
    cursor: pointer;
  }

  @media (max-width: 760px) {
    .controls {
      width: 82%;
      bottom: -96px;
    }
  }
</style>
