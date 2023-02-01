<template>
  <v-container class="bg rounded-e-xl">
    <v-row align="start" no-gutters>
      <v-col cols="11">
        <div class="text-h3 content">{{ props.title }}</div>
      </v-col>
      <v-col cols="1">
        <img src="/logo.png" class="header-img" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps(["title", "img"]);
</script>

<style scoped>
.content {
  text-shadow: black 2px 2px 2px;
}

.bg {
  background-image: linear-gradient(
      90deg,
      rgba(2, 0, 36, 0.7) 0%,
      rgba(9, 9, 121, 0.7) 0%,
      rgba(67, 187, 212, 0.7) 100%
    ),
    url("/background_default.png");
  background-position: center;
  background-repeat: repeat;
}
.header-img {
  aspect-ratio: 1 / 1;
  height: 5vmin;
}
</style>
