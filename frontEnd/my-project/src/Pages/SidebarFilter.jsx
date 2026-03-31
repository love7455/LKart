import React from "react";
import { Filter, IndianRupee, RotateCcw, Search } from "lucide-react";

const SidebarFilter = ({
  filters,
  setFilters,
  categories,
  brands,
  maxPrice = 50000,
  onClose,
}) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handlePriceChange = (e) => {
    setFilters({
      ...filters,
      maxPrice: Number(e.target.value),
    });
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "",
    });
  };

  return (
    <aside className="h-fit w-full rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200/70 backdrop-blur md:sticky md:top-24 md:w-[300px]">
      <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
            <Filter className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 md:hidden"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search Product
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="Try laptop, shoes..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
          >
            <option value="">All Categories</option>
            {categories?.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Brand
          </label>
          <select
            name="brand"
            value={filters.brand}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
          >
            <option value="">All Brands</option>
            {brands?.map((brand, index) => (
              <option key={index} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Sort By
          </label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white"
          >
            <option value="">Default</option>
            <option value="newest">Newest First</option>
            <option value="priceLowToHigh">Price: Low to High</option>
            <option value="priceHighToLow">Price: High to Low</option>
          </select>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <label className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <IndianRupee className="h-3.5 w-3.5" />
            Max Price
          </label>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Rs. {filters.maxPrice || maxPrice}
          </p>
          <input
            type="range"
            min="0"
            max={maxPrice}
            step="500"
            value={filters.maxPrice || maxPrice}
            onChange={handlePriceChange}
            className="w-full cursor-pointer accent-amber-600"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>Rs. 0</span>
            <span>Rs. {maxPrice}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarFilter;
