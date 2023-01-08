<template>
  <v-app id="inspire">
    <app-bar :routes="routes" base="" />

    <v-main class="bg-grey-lighten-3">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppBar from "./components/AppBar.vue";
import { RouterView } from "vue-router";
import { routes } from "./router/index.js";
</script>
