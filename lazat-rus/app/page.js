"use client";
import { useState } from "react";

const localRecipes = [
  {
    id: "local-1",
    idMeal: "local-1",
    strMeal: "Nasi Lemak",
    strCategory: "Malaysian classic",
    strMealThumb: "/nasi-lemak.jpg",
    strInstructions:
      "Cook rice with coconut milk and a pinch of salt.\nFry anchovies until crispy and set aside.\nHard boil the egg and slice in half.\nServe rice with egg, anchovies, chili sambal and cucumber slices.",
    ingredients: [
      "2 cups Rice",
      "1 cup Coconut Milk",
      "2 Eggs",
      "100g Anchovies",
      "3 tbsp Chili Sambal",
      "1 Cucumber",
      "Salt to taste",
    ],
    keywords: ["rice", "coconut milk", "egg", "anchovies", "chili", "cucumber"],
    isLocal: true,
  },
];

export default function Home() {
  const [ingredient, setIngredient] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [enteredIngredients, setEnteredIngredients] = useState([]);
  const [mealDbRecipes, setMealDbRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [hasSearched, setHasSearched] = useState(false);

  const fetchMealDb = async (ingredientList) => {
    setLoading(true);
    try {
      const lastIngredient = ingredientList[ingredientList.length - 1];
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${lastIngredient}`
      );
      const data = await res.json();

      if (!data.meals) {
        setMealDbRecipes([]);
        setLoading(false);
        return;
      }

      const detailed = await Promise.all(
        data.meals.slice(0, 4).map(async (meal) => {
          const r = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
          );
          const d = await r.json();
          return { ...d.meals[0], isLocal: false };
        })
      );

      setMealDbRecipes(detailed);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEnter = () => {
    if (ingredient.trim() === "") return;
    const updated = [...enteredIngredients, ingredient.trim()];
    setEnteredIngredients(updated);
    setIngredient("");
    setHasSearched(true);
    fetchMealDb(updated);
  };

  const filteredLocal =
    enteredIngredients.length === 0
      ? localRecipes
      : localRecipes.filter((recipe) =>
          enteredIngredients.some((ing) =>
            recipe.keywords.some((k) =>
              k.toLowerCase().includes(ing.toLowerCase())
            )
          )
        );

const getMealIngredients = (recipe) => {
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

  const halalBlacklist = ["pork", "bacon", "ham", "lard", "wine", "beer", "alcohol", "pig"];
const veganBlacklist = ["chicken", "beef", "pork", "lamb", "fish", "egg", "milk", "cheese", "cream", "butter", "bacon", "ham", "prawn", "shrimp", "meat"];
const vegetarianBlacklist = ["chicken", "beef", "pork", "lamb", "fish", "bacon", "ham", "prawn", "shrimp", "meat"];
const lactoseBlacklist = ["milk", "cheese", "cream", "butter", "yogurt", "dairy"];

const applyFilter = (recipe) => {
  const ingredientText = getMealIngredients(recipe).join(" ").toLowerCase();
  if (activeFilter === "Halal") return !halalBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Vegan") return !veganBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Vegetarian") return !vegetarianBlacklist.some((w) => ingredientText.includes(w));
  if (activeFilter === "Lactose Free") return !lactoseBlacklist.some((w) => ingredientText.includes(w));
  return true;
};

const filteredLocalFinal = filteredLocal.filter(applyFilter);
const filteredMealDb = mealDbRecipes.filter(applyFilter);


  const getSteps = (recipe) => {
    return recipe.strInstructions
      .split("\n")
      .filter((s) => s.trim() !== "")
      .slice(0, 6);
  };

  // --- Recipe Detail Page ---
  if (selectedRecipe) {
    const ingredients = getMealIngredients(selectedRecipe);
    const steps = getSteps(selectedRecipe);

    return (
      <div className="min-h-screen bg-yellow-100">
        <div className="bg-red-800 px-8 py-6 flex items-center gap-4">
          <button
            onClick={() => setSelectedRecipe(null)}
            className="text-yellow-100 text-2xl font-bold hover:opacity-70"
          >
            ←
          </button>
          <h1
            className="text-yellow-100 text-5xl font-bold"
            style={{ fontFamily: "cursive" }}
          >
            Lazat'Rus
          </h1>
        </div>

        <div className="flex">
          <div className="flex-1 p-6">
            <div className="rounded-xl overflow-hidden mb-6">
              <img
                src={selectedRecipe.strMealThumb}
                alt={selectedRecipe.strMeal}
                className="w-full object-cover h-64"
                onError={(e) =>
                  (e.target.src =
                    "https://placehold.co/900x300/f5a623/fff?text=No+Image")
                }
              />
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 shadow">
              <h2 className="text-orange-700 font-extrabold text-xl mb-2 uppercase tracking-widest">
                Steps:
              </h2>
              <p className="text-gray-600 mb-4">⏰ 40 minutes</p>
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="bg-yellow-500 text-white font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="w-64 bg-yellow-50 p-6 shadow-inner">
            <h2 className="text-red-800 font-extrabold uppercase tracking-widest mb-4">
              Ingredient
            </h2>
            <ul>
              {ingredients.map((item, index) => (
                <li
                  key={index}
                  className="py-3 text-gray-800 border-b border-dotted border-yellow-400 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Page ---
  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="bg-red-800 px-8 py-6">
        <h1
          className="text-yellow-100 text-5xl font-bold"
          style={{ fontFamily: "cursive" }}
        >
          Lazat'Rus
        </h1>
      </div>

      <div className="flex h-full">
        {/* Left: Input Panel */}
        <div className="w-96 bg-yellow-400 p-6 flex flex-col gap-4">
          <input
            type="text"
            placeholder="INSERT INGREDIENT"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
            className="w-full rounded-full px-5 py-3 text-sm font-bold uppercase tracking-widest bg-white outline-none placeholder-gray-400 text-black"
          />

          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-full px-5 py-3 text-sm font-bold uppercase tracking-widest bg-white outline-none text-black"
          />

          <div className="flex justify-end">
            <button
              onClick={handleEnter}
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold uppercase tracking-widest px-6 py-2 rounded-full"
            >
              ENTER
            </button>
          </div>
          <div className="flex flex-col gap-1">
  <label className="text-white font-bold uppercase text-xs tracking-widest">
    Dietary Filter
  </label>
  <select
    value={activeFilter}
    onChange={(e) => setActiveFilter(e.target.value)}
    className="w-full rounded-full px-5 py-3 text-sm font-bold bg-white outline-none text-black"
  >
    <option value="All">All</option>
    <option value="Halal">Halal</option>
    <option value="Vegan">Vegan</option>
    <option value="Vegetarian">Vegetarian</option>
    <option value="Lactose Free">Lactose Free</option>
  </select>
  </div>
  <hr className="border-white" />

          <div className="bg-yellow-50 rounded-xl p-4 min-h-48">
            <p className="text-red-800 font-extrabold uppercase tracking-widest mb-3">
              Your Ingredient :
            </p>
            <ul className="space-y-1">
              {enteredIngredients.map((item, index) => (
                <li key={index} className="text-gray-700 text-sm">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Recipe Cards */}
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">

          {!hasSearched && (
            <p className="text-center text-gray-400 mt-10">
              Enter an ingredient to find recipes!
            </p>
          )}

          {loading && (
            <p className="text-center text-orange-500 font-bold mt-10">
              Finding recipes...
            </p>
          )}

          {!loading && hasSearched && filteredLocalFinal.length === 0 && filteredMealDb.length === 0 && (
            <p className="text-center text-gray-500 mt-10">
              No recipes found. Try a different ingredient!
            </p>
          )}

          {!loading && hasSearched && (
            <>
              {filteredLocalFinal.length > 0 && (
                <p className="text-gray-500 text-sm">⭐ Local picks</p>
              )}
              {filteredLocalFinal.map((recipe) => (
                <RecipeCard
                  key={recipe.idMeal}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
              {filteredMealDb.length > 0 && (
                <p className="text-gray-500 text-sm mt-2">🌍 More recipes</p>
              )}
              {filteredMealDb.map((recipe) => (
                <RecipeCard
                  key={recipe.idMeal}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecipeCard({ recipe, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex bg-orange-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
    >
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="w-56 h-44 object-cover"
        onError={(e) =>
          (e.target.src = `https://placehold.co/224x176/f5a623/fff?text=No+Image`)
        }
      />
      <div className="p-5 flex flex-col justify-center">
        <h2 className="text-2xl font-extrabold text-gray-900">
          {recipe.strMeal}
        </h2>
        <p className="text-gray-600 mt-1">{recipe.strCategory}</p>
        {recipe.isLocal && (
          <span className="mt-2 text-xs bg-yellow-400 text-white font-bold px-2 py-1 rounded-full w-fit">
            ⭐ Local
          </span>
        )}
        <p className="text-gray-500 mt-3">⏰ 40 minutes</p>
      </div>
    </div>
  );
}