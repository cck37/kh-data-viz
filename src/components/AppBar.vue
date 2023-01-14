<template>
  <v-app-bar flat density="compact" class="appbar">
    <v-container class="fill-height d-flex align-center">
      <v-avatar class="mr-10 ml-4" size="32" image="/logo.png"> </v-avatar>
      <router-link
        v-for="(route, idx) in props.routes"
        :to="route.path"
        :key="idx"
      >
        <v-btn>
          {{ route.friendlyName }}
        </v-btn>
      </router-link>
    </v-container>
  </v-app-bar>
</template>

<script setup>
const props = defineProps(["routes", "base"]);
</script>

<style>
.appbar {
  /* theme really wants this as surface color */
  background-color: rgba(36, 39, 41, 0.4) !important;
  backdrop-filter: blur(5px);
}
</style>
