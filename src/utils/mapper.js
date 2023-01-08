// Mushrooms have a more complex relationship with their environment
// https://www.khguides.com/kh/combat/enemies/mushroom-heartless/
const mushroomNames = [
  "White Mushroom",
  "Rare Truffle",
  "Black Fungus",
  "Pink Agaricus",
];
const isMushroom = (name) => mushroomNames.some((mush) => mush === name);

export const mapToFlat = (data) => {
  const { recipes, components, enemies } = data;
  let flat_loc_arr = [];
  for (let i in enemies) {
    let enemy = enemies[i];
    enemy.locations.forEach((j) => {
      if (!isMushroom(enemy.name)) {
        flat_loc_arr.push({
          locationName: j.split(":")[0],
          enemyName: enemy.name,
        });
      }
    });
  }
  let flat_comp_arr = [];
  for (let i in components) {
    let component = components[i];
    component.enemies.forEach((j) => {
      if (!isMushroom(j.name)) {
        flat_comp_arr.push({
          ...j,
          componentName: component.name,
          enemyName: j.name,
        });
      }
    });
  }
  let flat_recipe_arr = [];
  for (let i in recipes) {
    let recipe = recipes[i];
    recipe.components.forEach((j) => {
      flat_recipe_arr.push({
        recipeName: recipe.name,
        componentName: j.name,
        quantity: j.quantity,
      });
    });
  }

  let joined = flat_comp_arr
    .map((t) => {
      var locs = flat_loc_arr.filter((l) => l.enemyName === t.enemyName);
      return locs.map((l) => ({ ...l, ...t }));
    })
    .flat();

  joined = joined.map((t) => {
    return {
      ...t,
      recipes: flat_recipe_arr.filter(
        (r) => r.componentName === t.componentName
      ),
    };
  });

  return joined;
};
