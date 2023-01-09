<template>
  <v-app class="bg-transparent">
    <app-bar :routes="routes" base="" />

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import AppBar from "./components/AppBar.vue";
import { RouterView } from "vue-router";
import { routes } from "./router/index.js";
</script>
