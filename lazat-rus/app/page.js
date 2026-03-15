"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import localRecipes from "./data/localRecipes";
import { applyFilter } from "./utils/filters";
import RecipeCard from "./components/RecipeCard";
import InputPanel from "./components/InputPanel";

export default function Home() {
  const router = useRouter();
  const [ingredient, setIngredient] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [enteredIngredients, setEnteredIngredients] = useState([]);
  const [mealDbRecipes, setMealDbRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // Fetches recipes from TheMealDB API based on the last entered ingredient
  const fetchMealDb = async (ingredientList) => {
    setLoading(true);
    try {
      const lastIngredient = ingredientList[ingredientList.length - 1];
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${lastIngredient}`
      );
      const data = await res.json();
      if (!data.meals) { setMealDbRecipes([]); setLoading(false); return; }
      const detailed = await Promise.all(
        data.meals.slice(0, 4).map(async (meal) => {
          const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const d = await r.json();
          return { ...d.meals[0], isLocal: false };
        })
      );
      setMealDbRecipes(detailed);
    } catch (err) { console.error(err); }
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

  // Filters local recipes based on entered ingredients and active dietary filter
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

  const filteredLocalFinal = filteredLocal.filter((r) => applyFilter(r, activeFilter));
  const filteredMealDb = mealDbRecipes.filter((r) => applyFilter(r, activeFilter));

  const handleCardClick = (recipe) => {
    sessionStorage.setItem("selectedRecipe", JSON.stringify(recipe));
    router.push(`/recipe/${recipe.idMeal}`);
  };

  // Main layout of the home page with header, input panel and recipe results
  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="bg-red-800 px-8 py-6">
        <h1 className="text-yellow-100 text-5xl font-bold" style={{ fontFamily: "cursive" }}>
          Lazat'Rus
        </h1>
      </div>

      <div className="flex h-full">
        <InputPanel
          ingredient={ingredient}
          setIngredient={setIngredient}
          expiryDate={expiryDate}
          setExpiryDate={setExpiryDate}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          enteredIngredients={enteredIngredients}
          onEnter={handleEnter}
        />

        {/* Recipe results section with loading and empty states */}
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
              {filteredLocalFinal.length > 0 && <p className="text-gray-500 text-sm">⭐ Local picks</p>}
              {filteredLocalFinal.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} onClick={() => handleCardClick(recipe)} />
              ))}
              {filteredMealDb.length > 0 && <p className="text-gray-500 text-sm mt-2">🌍 More recipes</p>}
              {filteredMealDb.map((recipe) => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} onClick={() => handleCardClick(recipe)} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}