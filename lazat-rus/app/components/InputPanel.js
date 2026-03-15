"use client";

export default function InputPanel({
  ingredient,
  setIngredient,
  expiryDate,
  setExpiryDate,
  activeFilter,
  setActiveFilter,
  enteredIngredients,
  onEnter,
}) {
  // Input panel for entering ingredients, expiry date and selecting dietary filter
  return (
    <div className="w-96 bg-yellow-400 p-6 flex flex-col gap-4">
      <input
        type="text"
        placeholder="INSERT INGREDIENT"
        value={ingredient}
        onChange={(e) => setIngredient(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
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
          onClick={onEnter}
          className="bg-orange-400 hover:bg-orange-500 text-white font-bold uppercase tracking-widest px-6 py-2 rounded-full"
        >
          ENTER
        </button>
      </div>

      {/* Dietary filter dropdown */}
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

      {/* Display entered ingredients */}
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
  );
}