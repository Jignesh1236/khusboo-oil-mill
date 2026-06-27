import { useGetWishlist } from "@/lib/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { ProductCard } from "@/components/product-card";
import { Box, Typography, Grid, Skeleton } from "@mui/material";
import { Favorite } from "@mui/icons-material";

export default function Wishlist() {
  const { user } = useStoreUser();
  const { data: wishlistData, isLoading } = useGetWishlist(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["wishlist", user?._id] },
  });

  if (isLoading) {
    return (
      <Box sx={{ pb: 10 }}>
        <Skeleton variant="text" width={180} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
              <Skeleton variant="rounded" sx={{ aspectRatio: "3/4" }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const products = wishlistData || [];

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Favorite color="primary" />
        <Typography variant="h5" fontWeight={700}>
          My Wishlist
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, textAlign: "center" }}>
          <Favorite sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Save items you love to review them later.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid key={product._id} size={{ xs: 6, sm: 4, md: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
