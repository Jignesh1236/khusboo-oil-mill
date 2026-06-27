import { useParams } from "wouter";
import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";
import {
  useGetProduct,
  useListProducts,
  useGetProductReviews,
  useCreateReview,
  useGetWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
  getGetProductReviewsQueryKey,
  getGetWishlistQueryKey,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser } from "@/hooks/use-store-user";
import { ProductCard } from "@/components/product-card";
import {
  Box,
  Button,
  Chip,
  Typography,
  Grid,
  Skeleton,
  Divider,
  Paper,
  IconButton,
  TextField,
  Stack,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Remove,
  Add,
  ShoppingCart,
  Star as StarIcon,
  StarBorder,
} from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";

function RatingDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <Box sx={{ display: "flex" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          sx={{ fontSize: size, color: star <= Math.round(rating) ? "primary.main" : "action.disabled" }}
        />
      ))}
    </Box>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useStoreUser();
  const { addItem } = useCart();
  const { format } = useCurrency();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useGetProduct(id || "");
  const { data: relatedProducts } = useListProducts(
    { category: product?.category, limit: 5 },
    { query: { enabled: !!product?.category, queryKey: ["products", "related", product?.category] } }
  );
  const { data: reviews } = useGetProductReviews(id || "");
  const { data: wishlist } = useGetWishlist(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["wishlist", user?._id] },
  });

  const isWishlisted = wishlist?.some((w) => w._id === id);
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const createReviewMutation = useCreateReview();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      qty,
      image: product.images?.[0],
      discountPercent: product.discountPercent || undefined,
    });
    toast({ title: "Added to cart", description: `${qty}x ${product.name} added.` });
  };

  const toggleWishlist = () => {
    if (!user?._id || !product) return;
    if (isWishlisted) {
      removeFromWishlistMutation.mutate(
        { data: { userId: user._id, productId: product._id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey(user._id) });
            toast({ title: "Removed from wishlist" });
          },
        }
      );
    } else {
      addToWishlistMutation.mutate(
        { data: { userId: user._id, productId: product._id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey(user._id) });
            toast({ title: "Added to wishlist" });
          },
        }
      );
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id || !product) return;
    createReviewMutation.mutate(
      {
        data: {
          userId: user._id,
          productId: product._id,
          orderId: "guest",
          rating: reviewRating,
          comment: reviewComment,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(product._id) });
          setReviewComment("");
          toast({ title: "Review submitted", description: "Thank you for your feedback!" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ pb: 10 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" sx={{ aspectRatio: "1/1" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="80%" height={48} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="40%" height={40} sx={{ mt: 2 }} />
            <Skeleton variant="rounded" height={120} sx={{ mt: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h6" color="text.secondary">
          Product not found
        </Typography>
      </Box>
    );
  }

  const discountedPrice = product.discountPercent
    ? product.price - (product.price * product.discountPercent) / 100
    : product.price;
  const images = product.images?.length
    ? product.images
    : ["https://via.placeholder.com/800x800?text=No+Image"];

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Grid container spacing={{ xs: 3, md: 6 }} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              aspectRatio: "1/1",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Box
              component="img"
              src={images[activeImage].replace("/upload/", "/upload/w_800,q_auto,f_auto/")}
              alt={product.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          {images.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, overflowX: "auto", pb: 1 }} className="scrollbar-hide">
              {images.map((img, i) => (
                <Box
                  key={i}
                  component="button"
                  onClick={() => setActiveImage(i)}
                  sx={{
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor: activeImage === i ? "primary.main" : "transparent",
                    cursor: "pointer",
                    bgcolor: "action.hover",
                    p: 0,
                  }}
                >
                  <Box
                    component="img"
                    src={img.replace("/upload/", "/upload/w_200,h_200,c_fill,q_auto,f_auto/")}
                    alt=""
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {product.category}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 16, color: "primary.main" }} />
              <Typography variant="body2" fontWeight={700}>
                {product.avgRating?.toFixed(1) || "0.0"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({product.reviewCount || 0})
              </Typography>
            </Box>
          </Box>

          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            {product.name}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              {format(discountedPrice)}
            </Typography>
            {product.discountPercent ? (
              <>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ textDecoration: "line-through" }}
                >
                  {format(product.price)}
                </Typography>
                <Chip
                  label={`${product.discountPercent}% OFF`}
                  color="error"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </>
            ) : null}
          </Box>

          {product.description && (
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {product.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
            {product.stock > 0 ? (
              <Chip
                label={`In Stock (${product.stock})`}
                color="success"
                variant="outlined"
                size="small"
              />
            ) : (
              <Chip label="Out of Stock" color="error" size="small" />
            )}
            {product.freeDelivery && (
              <Chip label="Free Delivery" color="primary" variant="outlined" size="small" />
            )}
            {product.deliveryTime && (
              <Chip label={`Delivery: ${product.deliveryTime}`} variant="outlined" size="small" />
            )}
          </Stack>

          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "action.hover",
                borderRadius: 99,
                px: 1.5,
                py: 0.5,
              }}
            >
              <IconButton
                size="small"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography fontWeight={700} sx={{ minWidth: 24, textAlign: "center" }}>
                {qty}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setQty(qty + 1)}
                disabled={qty >= product.stock}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              startIcon={<ShoppingCart />}
              sx={{ flex: 1, borderRadius: 99, py: 1.5, fontWeight: 700, fontSize: "1rem" }}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <IconButton
              onClick={toggleWishlist}
              sx={{
                width: 48,
                height: 48,
                border: "1px solid",
                borderColor: isWishlisted ? "primary.main" : "divider",
                bgcolor: isWishlisted ? "primary.light" : "transparent",
                color: isWishlisted ? "white" : "text.secondary",
                "&:hover": { bgcolor: isWishlisted ? "primary.main" : "action.hover" },
              }}
            >
              {isWishlisted ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 6 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
        Customer Reviews
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          {reviews?.length ? (
            <Stack spacing={2}>
              {reviews.map((review) => (
                <Paper key={review._id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography fontWeight={700}>{review.userName || "Anonymous"}</Typography>
                    <RatingDisplay rating={review.rating} size={14} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">{review.comment}</Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, bgcolor: "action.hover" }}
            component="form"
            onSubmit={submitReview}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Write a Review
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                Rating
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <IconButton
                    key={star}
                    type="button"
                    size="small"
                    onMouseEnter={() => setReviewHover(star)}
                    onMouseLeave={() => setReviewHover(0)}
                    onClick={() => setReviewRating(star)}
                    sx={{ p: 0.25 }}
                  >
                    {star <= (reviewHover || reviewRating) ? (
                      <StarIcon sx={{ color: "primary.main", fontSize: 28 }} />
                    ) : (
                      <StarBorder sx={{ color: "action.active", fontSize: 28 }} />
                    )}
                  </IconButton>
                ))}
              </Box>
            </Box>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="What did you like about this product?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              sx={{ mb: 2, "& .MuiInputBase-root": { bgcolor: "background.paper" } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {relatedProducts && relatedProducts.products.filter((p) => p._id !== product._id).length > 0 && (
        <>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            You Might Also Like
          </Typography>
          <Grid container spacing={2}>
            {relatedProducts.products
              .filter((p) => p._id !== product._id)
              .slice(0, 4)
              .map((p) => (
                <Grid key={p._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <ProductCard product={p} />
                </Grid>
              ))}
          </Grid>
        </>
      )}
    </Box>
  );
}
