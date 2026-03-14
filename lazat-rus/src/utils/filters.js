// Utility functions for processing recipes and applying dietary filters
export const getMealIngredients = (recipe) => {
  if (recipe.isLocal) return recipe.ingredients;
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];
    if (ing && ing.trim() !== "") {
      list.push(`${measure ? measure.trim() : ""} ${ing.trim()}`.trim());
    }
  }
  return list;
};

// Extracts the first 6 steps from the recipe instructions
export const getSteps = (recipe) => {
  return recipe.strInstructions
    .split("\n")
    .filter((s) => s.trim() !== "")
    .slice(0, 6);
};

const halalBlacklist = ["pork", "bacon", "ham", "lard", "wine", "beer", "alcohol", "pig"];
const veganBlacklist = ["chicken", "beef", "pork", "lamb", "fish", "egg", "milk", "cheese", "cream", "butter", "bacon", "ham", "prawn", "shrimp", "meat"];
const vegetarianBlacklist = ["chicken", "beef", "pork", "lamb", "fish", "bacon", "ham", "prawn", "shrimp", "meat"];
const lactoseBlacklist = ["milk", "cheese", "cream", "butter", "yogurt", "dairy"];

// Checks if a recipe meets the criteria of the selected dietary filter
export const applyFilter = (recipe, activeFilter) => {
  const ingredientText = getMealIngredients(recipe).join(" ").toLowerCase();
  if (activeFilter === "Halal") return !halalBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Vegan") return !veganBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Vegetarian") return !vegetarianBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Lactose Free") return !lactoseBlacklist.some((w) => ingredientText.includes(w));
  return true;
};