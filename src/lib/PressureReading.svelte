<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { chair } from "../chair.svelte.js";

  import { Engine } from "@babylonjs/core/Engines/engine.js";
  import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
  import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
  import { Scene } from "@babylonjs/core/scene.js";
  import {
    Color3,
    Color4,
    MeshBuilder,
    StandardMaterial,
    TargetCamera,
  } from "@babylonjs/core";
  import { user } from "../user.svelte.js";

  let svg;
  let { width, height } = $props();
  let x, y;
  let scene, engine;
  onMount(() => {
    svg = d3
      .select("#pressure")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g");

    const myGroups = ["1", "2", "3", "4", "5", "6"];
    const myVars = ["1", "2", "3", "4", "5", "6"];
    x = d3.scaleBand().range([0, width]).domain(myGroups).padding(0.01);
    svg.append("g").attr("transform", "translate(0," + height + ")");

    // Build X scales and axis:
    y = d3.scaleBand().range([height, 0]).domain(myVars).padding(0.01);
    svg.append("g");

    svg
      .selectAll()
      .data(
        chair.pressureReadings.flatMap((row, i) =>
          row.map((value, j) => ({ group: j + 1, variable: i + 1, value }))
        )
      )
      .enter()
      .append("rect")
      .attr("x", (d) => (d.group - 1) * x.bandwidth())
      .attr("y", (d) => (d.variable - 1) * y.bandwidth())
      .attr("width", x.bandwidth() + 1)
      .attr("height", y.bandwidth() + 1)
      .style("fill", (d) => myColor(d.value));

    const canvas = document.getElementById("heights");
    engine = new Engine(canvas);
    scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 0);
    // This creates and positions a free camera (non-mesh)
    const camera = new TargetCamera("camera1", new Vector3(10, 5, 0), scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    // create rectangular prism
    chair.zoneHeights.forEach((row, i) => {
      row.forEach((height, j) => {
        const box = MeshBuilder.CreateBox(
          `zone-${i}-${j}`,
          { size: 1, height: (height + 10) / 10 },
          scene
        );
        box.position = new Vector3(i - 2.5, height / 20, j - 2.5);
        const boxMaterial = new StandardMaterial(`boxMat-${i}-${j}`, scene);
        const color = myColor(chair.pressureReadings[i][j]);
        const hexColor = color
          .toString()
          .replace("rgb(", "")
          .replace(")", "")
          .split(",")
          .map((c) => parseInt(c, 10).toString(16).padStart(2, "0"))
          .join("");
        boxMaterial.diffuseColor = Color3.FromHexString(`#${hexColor}`);
        box.material = boxMaterial;
      });
    });
    engine.runRenderLoop(() => {
      scene.render();
    });
  });

  const myColor = d3.scaleLinear().range(["blue", "red"]).domain([0, 100]);

  const update = () => {
    let scale = 1;
    if (!svg || !x || !y || !width || !height) return;
    chair.zoneHeights.forEach((row, i) => {
      row.forEach((height, j) => {
        const box = scene.getMeshByName(`zone-${i}-${j}`);
        box.position = new Vector3(i - 2.5, height / 20, j - 2.5);
        const boxMaterial = scene.getMaterialByName(`boxMat-${i}-${j}`);
        const color = myColor(chair.pressureReadings[i][j]);
        const hexColor = color
          .toString()
          .replace("rgb(", "")
          .replace(")", "")
          .split(",")
          .map((c) => parseInt(c, 10).toString(16).padStart(2, "0"))
          .join("");
        boxMaterial.diffuseColor = Color3.FromHexString(`#${hexColor}`);
        box.material = boxMaterial;
      });
    });
    if (user.posturePressure.flat().reduce((a, b) => a + b, 0) === 0) {
      if (chair.postureAlert) {
        chair.postureAlert = false;
      }
      chair.zoneHeights = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ];
      if (chair.timer) {
        clearInterval(chair.timer);
        chair.timer = null;
        chair.activePositionTime = 0;
      }
      scale = 0;
    } else {
      if (!chair.timer) {
        chair.postureAlert = true;
        chair.activePositionTime = 0;
        chair.timer = setInterval(() => {
          chair.activePositionTime = chair.activePositionTime + 1;
        }, 1000);
      }
    }
    chair.pressureReadings = chair.pressureReadings.map((row, i) =>
      row.map(
        (value, j) =>
          user.posturePressure[i][j] -
          chair.zoneHeights[i][j] * 2 +
          (i - 3) * (chair.recline / 3) * scale +
          -(i - 3) * ((chair.leg - 80) / 6) * scale
      )
    );
    svg.selectAll("*").remove();
    svg
      .selectAll()
      .data(
        chair.pressureReadings.flatMap((row, i) =>
          row.map((value, j) => ({ group: j + 1, variable: i + 1, value }))
        )
      )
      .enter()
      .append("rect")
      .attr("x", (d) => (d.group - 1) * x.bandwidth())
      .attr("y", (d) => (d.variable - 1) * y.bandwidth())
      .attr("width", x.bandwidth() + 1)
      .attr("height", y.bandwidth() + 1)
      .style("fill", (d) => myColor(d.value));
  };

  const render = () => {
    update();
    requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
</script>

<main>
  <div class="splitter">
    <div id="pressure"></div>
    <canvas id="heights" {width} {height}></canvas>
  </div>
</main>

<style>
  #pressure {
    height: 50vh;
  }
  .splitter {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-left: 8rem;
  }
</style>
