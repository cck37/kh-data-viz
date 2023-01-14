<template>
  <v-container>
    <v-row>
      <v-col cols="3">
        <v-sheet rounded="lg" class="sticky">
          <v-list rounded="lg">
            <v-list-item link color="grey-lighten-4">
              <v-list-item-title>What's left?</v-list-item-title>
              <v-autocomplete
                :items="recipes"
                label="Recipes"
                multiple
                :closable-chips="true"
                :menu-props="{ maxHeight: '400' }"
                variant="underlined"
                v-model="selectedRecipes"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index <= 3">
                    <span>{{ item.title }}</span>
                  </v-chip>
                  <span v-if="index === 5" class="grey--text text-caption">
                    (+{{ selectedRecipes.length - index }} other{{
                      selectedRecipes.length - index > 1 ? "s" : ""
                    }})
                  </span>
                </template>
              </v-autocomplete>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item link color="grey-lighten-4">
              <v-list-item-title> Refresh </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>

      <v-col>
        <v-sheet min-height="70vh" rounded="lg">
          <h1>Recipes Circle Packing</h1>
          <div id="circleChart"><svg></svg></div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { watchEffect, ref, onMounted } from "vue";
import { mapToFlat } from "../utils/mapper";
import KH1Data from "../data/KH1Data";
import * as d3 from "d3";

let data = mapToFlat(KH1Data);

const selectedRecipes = ref([]);
const recipes = [
  ...new Set(
    data
      .map((comp) => comp.recipes)
      .flat()
      .map((r) => r.recipeName)
  ),
]; // arr->set->arr to remove dupes
watchEffect(() => {
  chart(
    data.filter((comp) =>
      selectedRecipes.value.some((r) =>
        comp.recipes
          .flat()
          .map((r) => r.recipeName)
          .some((c) => c === r)
      )
    )
  );
});
function update(root) {
  const height = 932;
  const width = 932;
  let focus = root;
  let view;

  const svg = d3
    .select("#circleChart")
    .select("svg")
    .attr("viewBox", [-(width / 2), -(height / 2), width, height])
    .style("display", "block")
    .style("margin", "0 -14px")
    .style("cursor", "pointer")
    .attr("text-anchor", "middle")
    .on("click", (event) => zoom(event, root));

  const node = svg.selectAll("g").data(root.descendants()).join("g");

  const circle = node
    .append("circle")
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    .attr("pointer-events", (d) => (!d.children ? "none" : "auto"))
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  const label = node
    .append("text")
    .style("display", (d) => (d.parent === root ? "inline" : "none"))
    .text((d) =>
      d.parent === root
        ? d.data[0]
        : `${d.data[0]} - ${parseFloat(d.value).toFixed(3) * 100}%`
    )
    .on(
      "click",
      (event, d) =>
        focus !== d &&
        d.parent === root &&
        (zoom(event, d), event.stopPropagation())
    )
    .style("font-size", calculateTextFontSize)
    .attr("dy", ".35em");

  // clip paths
  // A unique identifier for clip paths (to avoid conflicts).
  const uid = `O-${Math.random().toString(16).slice(2)}`;
  const calcUid = (d) => {
    if (!d.data[0]) {
      return `${uid}-clip-root`;
    }
    if (d.parent == root) {
      return `${uid}-clip-${d.data[0]}`;
    }
    return `${uid}-clip-${d.data[0]}-${d.parent.data[0]}`;
  };

  const circleClipPath = node
    .append("clipPath")
    .attr("id", (d) => calcUid(d))
    .append("circle")
    .attr("r", (d) => d.r);

  label.attr("clip-path", (d) => `url(${new URL(`#${calcUid(d)}`, location)})`);

  var calculateTextFontSize = function (d) {
    var id = d3.select(this).text();
    var radius = 0;
    if (d.fontsize) {
      //if fontsize is already calculated use that.
      return d.fontsize;
    }
    if (!d.computed) {
      //if computed not present get & store the getComputedTextLength() of the text field
      d.computed = this.getComputedTextLength();
      if (d.computed != 0) {
        //if computed is not 0 then get the visual radius of DOM
        var r = d3.selectAll("#" + id).attr("r");
        //if radius present in DOM use that
        if (r) {
          radius = r;
        }
        //calculate the font size and store it in object for future
        d.fontsize = ((2 * radius - 8) / d.computed) * 24 + "px";
        return d.fontsize;
      }
    }
  };
  const zoomTo = (v) => {
    const k = width / v[2];

    view = v;

    circle.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    circle.attr("r", (d) => d.r * k);
    circleClipPath.attr("r", (d) => d.r * k);

    label.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
  };

  function zoom(event, d) {
    focus = d;

    const transition = d3
      .select("#circleChart")
      .select("svg")
      .transition()
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", () => {
        const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
        return (t) => zoomTo(i(t));
      });

    label
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });
    setTimeout(function () {
      d3.selectAll("text")
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .style("font-size", calculateTextFontSize);
    }, 500);

    /*
      FIX:
        - Stroke width transtion
        - Original label flickers behind (should disappear immediately)
        - Outter circle should still display?
    */

    circle
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .transition(transition)
      .style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
      .on("start", function (d) {
        if (d.parent === focus) this.style.display = "inline";
      })
      .on("end", function (d) {
        if (d.parent !== focus) this.style.display = "none";
      });
  }

  zoomTo([root.x, root.y, root.r * 2]);
}

// TODO: Mimic https://observablehq.com/@d3/pack (clip-path, text structuring, etc.)
function chart(data) {
  var pack = d3.pack().size([900, 900]);

  const round = (value, decimals) => {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  };

  const sumMaxDropRate = (group) => {
    return group.reduce((x, y) => round(x * (1 - y.drop_rate_max), 2), 1);
  };

  const groups = d3.rollup(
    data,
    sumMaxDropRate,
    function (d) {
      return d.locationName;
    },
    function (d) {
      return d.componentName;
    }
  );

  const root_hierarchy = d3
    .hierarchy(groups)
    .sum((d) => 1 - d[1])
    .sort((a, b) => d3.descending(a.value, b.value));

  const root = pack(root_hierarchy);

  update(root);
}

onMounted(() => {
  chart(data);
});
</script>

<style>
.chart > div {
  white-space: nowrap;
  text-align: right;
  padding: 3px;
  margin: 1px;
  color: white;
}
circle {
  stroke: darkblue;
  display: inline-block;
}

text {
  fill: gold;
  text-anchor: middle;
}

.node:hover {
  stroke-width: 7px;
  opacity: 1;
}
</style>
