<template>
  <v-app-bar flat>
    <v-container class="fill-height d-flex align-center">
      <v-avatar class="mr-10 ml-4" color="grey-darken-1" size="32"></v-avatar>

      <v-btn v-for="(route, idx) in props.routes" :key="idx">
        <router-link :to="route.path">
          {{ route.friendlyName }}
        </router-link>
      </v-btn>

      <v-spacer></v-spacer>

      <v-responsive max-width="260">
        <v-text-field
          density="compact"
          hide-details
          variant="solo"
        ></v-text-field>
      </v-responsive>
    </v-container>
  </v-app-bar>
</template>

<script setup>
const props = defineProps(["routes", "base"]);
</script>
