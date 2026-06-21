import { useListBanners, useListCategories, useListFeaturedProducts, useListProducts } from "./lib/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useSearch } from "wouter";

export default function Home() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const searchQuery = params.get("search") || "";
  const categoryFilter = params.get("category") || "";

  const { data: banners, isLoading: loadingBanners } = useListBanners();
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: featuredProducts, isLoading: loadingFeatured } = useListFeaturedProducts();
  const { data: productsPage, isLoading: loadingProducts } = useListProducts({
    limit: 20,
    ...(searchQuery ? { search: searchQuery } : {}),
    ...(categoryFilter ? { category: categoryFilter } : {}),
  });

  const isFiltered = !!searchQuery || !!categoryFilter;

  return (
    <div className="space-y-10 pb-10">
      {/* Banners — hide when searching */}
      {!isFiltered && (
        <section>
          {loadingBanners ? (
            <Skeleton className="w-full aspect-[21/9] rounded-xl" />
          ) : banners?.length ? (
            <div className="w-full aspect-[21/9] rounded-xl bg-muted overflow-hidden relative">
              <img src={banners[0].imageUrl || ""} alt={banners[0].title} className="w-full h-full object-cover" />
            </div>
          ) : null}
        </section>
      )}

      {/* Categories */}
      {!searchQuery && (
        <section>
          <h2 className="text-xl font-bold mb-4">Categories</h2>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
            {loadingCategories ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />)
            ) : (
              <>
                <Link
                  href="/"
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    !categoryFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  All
                </Link>
                {categories?.map(c => (
                  <Link
                    key={c._id}
                    href={`/?category=${encodeURIComponent(c.name)}`}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === c.name ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Products — hide when filtering */}
      {!isFiltered && (
        <section>
          <h2 className="text-xl font-bold mb-4">Featured</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loadingFeatured ? (
              Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
            ) : (
              featuredProducts?.map(p => <ProductCard key={p._id} product={p} />)
            )}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          {searchQuery
            ? `Results for "${searchQuery}"`
            : categoryFilter
            ? categoryFilter
            : "All Products"}
        </h2>
        {loadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
          </div>
        ) : productsPage?.products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try a different search term or category</p>
            <Link href="/" className="mt-4 inline-block text-primary underline text-sm">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsPage?.products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
