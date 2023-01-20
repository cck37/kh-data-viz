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

const cleanId = (t) => t.replaceAll(/\s+/gi, "").replaceAll("%", "");

const nodeToId = (d) => {
  return !d.children
    ? cleanId(
        `${d.data[0]} - ${parseFloat(d.value).toFixed(3) * 100}%-${
          d.parent.data[0]
        }`
      )
    : d.data[0]
    ? cleanId(d.data[0])
    : "undef";
};

function update(root) {
  const width = 932;
  let focus = root;
  let view;

  /*
    util functions that need to be in the context of the render pipeline
  */
  var calculateTextFontSize = function (d) {
    var id = nodeToId(d);
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
        //HACK: Seems like magic numbers and very finnicky.
        const calcFontSize = ((2 * radius - 8) / d.computed) * 17;
        d.fontsize = Math.min(Math.max(calcFontSize, 10), 42) + "px";
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

    transition
      .selectAll("text")
      .filter(function (d) {
        return d.parent === focus || this.style.display === "inline";
      })
      .style("fill-opacity", function (d) {
        return d.parent === focus ? 1 : 0;
      })
      .on("start", function (d) {
        if (d.parent === focus) {
          this.style.display = "inline";
        }
      })
      .on("end", function (d) {
        if (d.parent !== focus) {
          this.style.display = "none";
        }
      });

    setTimeout(function () {
      d3.selectAll("text")
        .filter(function (d) {
          return d.parent === focus || this.style.display === "inline";
        })
        .style("font-size", calculateTextFontSize);
    }, 500);

    transition
      .selectAll("circle")
      .filter(function (d) {
        return d.parent === focus || this.style.fillOpacity == 1;
      })
      .style("fill-opacity", function (d) {
        return d.parent === focus ? 1 : 0.5;
      });
  }

  const color = d3
    .scaleLinear()
    .domain([-1, 2])
    .range(["#020024", "#43BBD4"])
    .interpolate(d3.interpolateHcl);

  var circleFill = function (d) {
    if (d["color"]) {
      return d.color;
    } else {
      return color(d.depth);
    }
  };

  const svg = d3
    .select("#circleChart")
    .select("svg")
    .on("click", (event) => zoom(event, root));

  const circle = svg
    .selectAll("circle")
    .data(root.descendants())
    .join("circle")
    .attr("class", function (d) {
      return d.parent ? (d.children ? "node" : "node node--leaf") : "";
    })
    .style("fill", circleFill)
    // HACK: Render order prevents parent lables from rendering; make all children render at half opacity show the root label comes through
    // Looks pretty bad but 🤷‍♀️
    .style("fill-opacity", (d) =>
      d.parent ? (d.parent === root ? 1 : 0.5) : 0
    )
    .attr("pointer-events", (d) => (!d.children ? "none" : "auto"))
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    )
    .attr("id", (d) => (d === root ? "root" : nodeToId(d)));

  const label = svg
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .attr("class", "label")
    .style("fill-opacity", function (d) {
      return d.parent === root ? 1 : 0;
    })
    .style("display", function (d) {
      return d.parent === root ? null : "none";
    })
    .text((d) =>
      d.parent === root
        ? d.data[0]
        : `${d.data[0]} - ${parseFloat(d.value).toFixed(3) * 100}%`
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

  const circleClipPath = svg
    .selectAll("clipPath")
    .data(root.descendants())
    .join("clipPath")
    .attr("id", (d) => calcUid(d))
    .append("circle")
    .attr("r", (d) => d.r);

  label.attr("clip-path", (d) => `url(${new URL(`#${calcUid(d)}`, location)})`);

  zoomTo([root.x, root.y, root.r * 2]);
}

function chart(data) {
  const height = 950;
  const width = 950;
  var pack = d3.pack().size([900, 900]).padding(3);

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

  d3.select("#circleChart")
    .select("svg")
    .attr("viewBox", [-(width / 2), -(height / 2), width, height])
    .style("display", "block")
    .style("cursor", "pointer")
    .attr("text-anchor", "middle");

  update(root);
}

onMounted(() => {
  chart(data);
});
</script>

<style>
circle {
  padding: 5px;
}
text {
  fill: gold;
  text-anchor: middle;
}

.node:hover {
  stroke-width: 3px;
  opacity: 1;
  stroke: rgba(255, 255, 255, 0.781);
}
</style>
