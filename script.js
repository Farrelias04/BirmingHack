const ingredientNameInput = document.getElementById("ingredientName");
const expiryDateInput = document.getElementById("expiryDate");
const addBtn = document.getElementById("addBtn");
const ingredientList = document.getElementById("ingredientList");
const ingredientEmpty = document.getElementById("ingredientEmpty");
const findRecipesBtn = document.getElementById("findRecipesBtn");
const recipeResults = document.getElementById("recipeResults");
const recipeEmpty = document.getElementById("recipeEmpty");
const statusText = document.getElementById("status");

let ingredients = [];

function daysUntil(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(dateString);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function getExpiryMessage(dateString) {
  const days = daysUntil(dateString);

  if (days < 0) {
    return { text: `Expired ${Math.abs(days)} day(s) ago`, warning: true };
  }

  if (days === 0) {
    return { text: "Expires today", warning: true };
  }

  if (days <= 2) {
    return { text: `Expires in ${days} day(s)`, warning: true };
  }

  return { text: `Expires in ${days} day(s)`, warning: false };
}

function sortIngredientsByExpiry() {
  ingredients.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
}

function renderIngredients() {
  ingredientList.innerHTML = "";

  if (ingredients.length === 0) {
    ingredientEmpty.style.display = "block";
    return;
  }

  ingredientEmpty.style.display = "none";

  ingredients.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "ingredient-item";

    const infoDiv = document.createElement("div");
    infoDiv.className = "ingredient-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "ingredient-name";
    nameDiv.textContent = item.name;

    const expiryDiv = document.createElement("div");
    const expiryInfo = getExpiryMessage(item.expiry);
    expiryDiv.className = expiryInfo.warning ? "expiry-text warning" : "expiry-text";
    expiryDiv.textContent = `${item.expiry} — ${expiryInfo.text}`;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(expiryDiv);

    const removeBtn = document.createElement("button");
    removeBtn.className = "small-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      ingredients.splice(index, 1);
      renderIngredients();
    });

    li.appendChild(infoDiv);
    li.appendChild(removeBtn);
    ingredientList.appendChild(li);
  });
}

function addIngredient() {
  const name = ingredientNameInput.value.trim().toLowerCase();
  const expiry = expiryDateInput.value;

  if (!name || !expiry) {
    alert("Please enter both ingredient name and expiry date.");
    return;
  }

  ingredients.push({ name, expiry });
  sortIngredientsByExpiry();
  renderIngredients();

  ingredientNameInput.value = "";
  expiryDateInput.value = "";
  ingredientNameInput.focus();
}

async function fetchMealsByIngredient(ingredient) {
  const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch meals.");
  }

  const data = await response.json();
  return data.meals || [];
}

async function fetchMealDetails(mealId) {
  const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch meal details.");
  }

  const data = await response.json();
  return data.meals ? data.meals[0] : null;
}

function extractIngredientsFromMeal(meal) {
  const list = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      list.push(`${ingredient}${measure && measure.trim() ? ` — ${measure.trim()}` : ""}`);
    }
  }

  return list;
}

function renderRecipes(meals) {
  recipeResults.innerHTML = "";

  if (!meals.length) {
    recipeEmpty.style.display = "block";
    return;
  }

  recipeEmpty.style.display = "none";

  meals.forEach((meal) => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.src = meal.strMealThumb;
    img.alt = meal.strMeal;

    const content = document.createElement("div");
    content.className = "recipe-content";

    const title = document.createElement("h3");
    title.textContent = meal.strMeal;

    const meta = document.createElement("div");
    meta.className = "recipe-meta";
    meta.textContent = `${meal.strCategory || "Unknown category"} • ${meal.strArea || "Unknown cuisine"}`;

    const listTitle = document.createElement("strong");
    listTitle.textContent = "Ingredients:";

    const ul = document.createElement("ul");
    ul.className = "recipe-ingredients";

    const ingredientsList = extractIngredientsFromMeal(meal);
    ingredientsList.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(listTitle);
    content.appendChild(ul);

    card.appendChild(img);
    card.appendChild(content);
    recipeResults.appendChild(card);
  });
}

async function findRecipes() {
  if (ingredients.length === 0) {
    alert("Please add at least one ingredient first.");
    return;
  }

  statusText.textContent = "Searching recipes...";
  recipeResults.innerHTML = "";
  recipeEmpty.style.display = "none";

  try {
    const ingredientNames = ingredients.map((item) => item.name);

    const allMealResults = await Promise.all(
      ingredientNames.map((name) => fetchMealsByIngredient(name))
    );

    const mealCount = new Map();

    allMealResults.forEach((mealArray) => {
      mealArray.forEach((meal) => {
        mealCount.set(meal.idMeal, (mealCount.get(meal.idMeal) || 0) + 1);
      });
    });

    const commonMealIds = [];

    for (const [mealId, count] of mealCount.entries()) {
      if (count === ingredientNames.length) {
        commonMealIds.push(mealId);
      }
    }

    let selectedMealIds = commonMealIds;

    if (selectedMealIds.length === 0) {
      const sortedFallback = [...mealCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map((entry) => entry[0]);

      selectedMealIds = sortedFallback;
      statusText.textContent =
        "No recipe matched all ingredients. Showing closest matches instead.";
    } else {
      statusText.textContent = `Found ${selectedMealIds.length} recipe(s) matching all your ingredients.`;
    }

    const detailedMeals = await Promise.all(
      selectedMealIds.slice(0, 6).map((id) => fetchMealDetails(id))
    );

    const validMeals = detailedMeals.filter(Boolean);
    renderRecipes(validMeals);

    if (validMeals.length === 0) {
      statusText.textContent = "No recipes found.";
      recipeEmpty.style.display = "block";
    }
  } catch (error) {
    console.error(error);
    statusText.textContent = "Something went wrong while fetching recipes.";
    recipeEmpty.style.display = "block";
  }
}

addBtn.addEventListener("click", addIngredient);
findRecipesBtn.addEventListener("click", findRecipes);

ingredientNameInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addIngredient();
  }
});
