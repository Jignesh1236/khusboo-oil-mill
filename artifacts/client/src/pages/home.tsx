import { useListBanners, useListCategories, useListFeaturedProducts, useListProducts } from "@/lib/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Link, useSearch } from "wouter";
import {
  Box,
  Typography,
  Chip,
  Skeleton,
  Grid,
  Stack,
} from "@mui/material";

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
    <Box sx={{ pb: 5 }}>
      {!isFiltered && (
        <Box sx={{ mb: 4 }}>
          {loadingBanners ? (
            <Skeleton variant="rounded" sx={{ width: "100%", aspectRatio: "21/9" }} />
          ) : banners?.length ? (
            <Box
              sx={{
                width: "100%",
                aspectRatio: "21/9",
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "action.hover",
              }}
            >
              <Box
                component="img"
                src={banners[0].imageUrl || ""}
                alt={banners[0].title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ) : null}
        </Box>
      )}

      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Categories
          </Typography>
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 1 }} className="scrollbar-hide">
            {loadingCategories ? (
              Array(5)
                .fill(0)
                .map((_, i) => <Skeleton key={i} variant="rounded" width={90} height={36} sx={{ borderRadius: 99, flexShrink: 0 }} />)
            ) : (
              <>
                <Chip
                  component={Link}
                  href="/"
                  label="All"
                  clickable
                  color={!categoryFilter ? "primary" : "default"}
                  sx={{ flexShrink: 0 }}
                />
                {categories?.map((c) => (
                  <Chip
                    key={c._id}
                    component={Link}
                    href={`/?category=${encodeURIComponent(c.name)}`}
                    label={c.name}
                    clickable
                    color={categoryFilter === c.name ? "primary" : "default"}
                    sx={{ flexShrink: 0 }}
                  />
                ))}
              </>
            )}
          </Stack>
        </Box>
      )}

      {!isFiltered && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Featured
          </Typography>
          <Grid container spacing={2}>
            {loadingFeatured
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Skeleton variant="rounded" sx={{ aspectRatio: "3/4" }} />
                    </Grid>
                  ))
              : featuredProducts?.map((p) => (
                  <Grid key={p._id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <ProductCard product={p} />
                  </Grid>
                ))}
          </Grid>
        </Box>
      )}

      <Box>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {searchQuery
            ? `Results for "${searchQuery}"`
            : categoryFilter
            ? categoryFilter
            : "All Products"}
        </Typography>
        {loadingProducts ? (
          <Grid container spacing={2}>
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Skeleton variant="rounded" sx={{ aspectRatio: "3/4" }} />
                </Grid>
              ))}
          </Grid>
        ) : productsPage?.products.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography color="text.secondary" variant="h6" gutterBottom>
              No products found
            </Typography>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Try a different search term or category
            </Typography>
            <Box
              component={Link}
              href="/"
              sx={{ color: "primary.main", textDecoration: "underline", fontSize: "0.875rem", display: "inline-block", mt: 1 }}
            >
              Browse all products
            </Box>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {productsPage?.products.map((p) => (
              <Grid key={p._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
