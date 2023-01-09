<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <v-sheet rounded="lg" class="sticky">
          <v-list rounded="lg">
            <v-list-item link color="grey-lighten-4">
              <v-list-item-title>What's left?</v-list-item-title>
              <v-autocomplete
                :items="recipes"
                label="Recipes"
                multiple
                :menu-props="{ maxHeight: '400' }"
                variant="underlined"
                v-model="selectedRecipes"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip v-if="index <= 5">
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
          <router-view />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup></script>
