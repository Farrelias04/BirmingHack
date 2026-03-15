"use client";

// displays recipe card with an image, title, category and a local badge if applicable
export default function RecipeCard({ recipe, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex bg-orange-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
    >
      {/* Recipe image section */}
      <img
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        className="w-56 h-44 object-cover"
        onError={(e) =>
          (e.target.src = `https://placehold.co/224x176/f5a623/fff?text=No+Image`)
        }
      />
      {/* Recipe details section */}
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