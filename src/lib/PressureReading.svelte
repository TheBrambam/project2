<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { chair } from "../chair.svelte.js";

  import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera.js";
  import { Engine } from "@babylonjs/core/Engines/engine.js";
  import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js";
  import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
  import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder.js";
  import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder.js";
  import { Scene } from "@babylonjs/core/scene.js";

  import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial.js";
  import {
    Color3,
    CreateBox,
    DirectionalLight,
    Material,
    StandardMaterial,
  } from "@babylonjs/core";
  import { user } from "../user.svelte.js";

  let svg;
  let margin, width, height, x, y;
  onMount(() => {
    margin = { top: 30, right: 30, bottom: 30, left: 30 };
    width = 450 - margin.left - margin.right;
    height = 450 - margin.top - margin.bottom;
    svg = d3
      .select("#pressure")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  });

  const myColor = d3.scaleLinear().range(["blue", "red"]).domain([0, 100]);

  const update = () => {
    if (!svg || !x || !y || !width || !height) return;
    chair.pressureReadings = chair.pressureReadings.map((row, i) =>
      row.map(
        (value, j) =>
          user.posturePressure[i][j] -
          chair.zoneHeights[i][j] * 2 +
          (i - 3) * (chair.recline / 3) +
          -(i - 3) * ((chair.leg - 70) / 6)
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
  <div id="pressure"></div>
  <!-- <canvas id="pressure3D" width="450" height="450"></canvas> -->
</main>

<style>
</style>
