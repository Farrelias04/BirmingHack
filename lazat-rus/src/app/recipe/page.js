"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMealIngredients, getSteps } from "../../utils/filters";

export default function RecipePage() {
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedRecipe");
    if (stored) {
      setRecipe(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, []);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-yellow-100 flex items-center justify-center">
        <p className="text-orange-500 font-bold text-xl">Loading...</p>
      </div>
    );
  }

  const ingredients = getMealIngredients(recipe);
  const steps = getSteps(recipe);

  return (
    <div className="min-h-screen bg-yellow-100">
      <div className="bg-red-800 px-8 py-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-yellow-100 text-2xl font-bold hover:opacity-70"
        >
          ←
        </button>
        <h1 className="text-yellow-100 text-5xl font-bold" style={{ fontFamily: "cursive" }}>
          Lazat'Rus
        </h1>
      </div>

      <div className="flex">
        <div className="flex-1 p-6">
          <div className="rounded-xl overflow-hidden mb-6">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full object-cover h-64"
              onError={(e) => (e.target.src = "https://placehold.co/900x300/f5a623/fff?text=No+Image")}
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
              <li key={index} className="py-3 text-gray-800 border-b border-dotted border-yellow-400 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}