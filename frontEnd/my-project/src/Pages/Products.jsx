import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import axios from "@/lib/api";
import ProductSkeletonCard from "../components/ProductSkeletonCard";
import SidebarFilter from "./SidebarFilter";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

const Products = () => {
  const [allProducts, setAllProducts] = useState([]); // store all
  const [filteredProducts, setFilteredProducts] = useState([]); // filtered
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    search: "",
    sortBy: "",
  });

  // 🔥 Fetch Products Once
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiConfig = {
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("accessToken"),
          },
        };

        let res = await axios.get(
          "/api/v1/products/get-all-products",
          apiConfig,
        );

        if (res.data?.success && (!res.data.products || !res.data.products.length)) {
          await axios.post("/api/v1/products/seed-demo", {}, apiConfig);
          res = await axios.get(
            "/api/v1/products/get-all-products",
            apiConfig,
          );
        }

        if (res.data?.success) {
          const products = res.data.products;

          setAllProducts(products);
          setFilteredProducts(products);

          // 🔥 Extract Unique Categories
          const uniqueCategories = [
            ...new Set(products.map((p) => p.category)),
          ];

          // 🔥 Extract Unique Brands
          const uniqueBrands = [...new Set(products.map((p) => p.brand))];

          setCategories(uniqueCategories);
          setBrands(uniqueBrands);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const maxProductPrice = Math.max(
    ...allProducts.map((p) => p.productPrice),
    0,
  );

  // 🔥 Apply Filters Whenever filters Change
  useEffect(() => {
    let tempProducts = [...allProducts];

    if (filters.category) {
      tempProducts = tempProducts.filter(
        (p) => p.category === filters.category,
      );
    }

    // 🔍 Search Filter
    if (filters.search) {
      tempProducts = tempProducts.filter((p) =>
        p.productName.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    if (filters.brand) {
      tempProducts = tempProducts.filter((p) => p.brand === filters.brand);
    }

    if (filters.minPrice) {
      tempProducts = tempProducts.filter(
        (p) => p.productPrice >= Number(filters.minPrice),
      );
    }

    if (filters.maxPrice) {
      tempProducts = tempProducts.filter(
        (p) => p.productPrice <= Number(filters.maxPrice),
      );
    }

    if (filters.sortBy === "priceLowToHigh") {
      tempProducts.sort((a, b) => a.productPrice - b.productPrice);
    } else if (filters.sortBy === "priceHighToLow") {
      tempProducts.sort((a, b) => b.productPrice - a.productPrice);
    } else if (filters.sortBy === "newest") {
      tempProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(tempProducts);
  }, [filters, allProducts]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="mb-5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-100/80 via-orange-50/90 to-emerald-50/70 px-5 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Browse Products</h1>
        <p className="text-sm text-slate-600">
          Explore curated products with smart filters and quick actions.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
      <div className="hidden md:block">
        <SidebarFilter
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          brands={brands}
          maxPrice={maxProductPrice}
        />
      </div>

      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200/70 bg-white/85 px-4 py-3 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">All Products</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 md:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filters
            </Button>
            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : `${filteredProducts.length} result(s)`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <ProductSkeletonCard key={index} />
              ))
            : filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
        </div>
      </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileFiltersOpen(false)}
            aria-label="Close filters backdrop"
          />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
            <SidebarFilter
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
              maxPrice={maxProductPrice}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;


