import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import type { Product } from "@/lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";

export function ProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const imageUrl = product.images?.[0]
    ? product.images[0].replace(
        "/upload/",
        "/upload/w_400,h_400,c_fill,q_auto,f_auto/"
      )
    : "https://via.placeholder.com/400x400?text=No+Image";

  const discountedPrice = product.discountPercent
    ? product.price - (product.price * product.discountPercent) / 100
    : product.price;

  return (
    <Link href={`/product/${product._id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: 6,
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            sx={{ aspectRatio: "1 / 1", objectFit: "cover" }}
          />
          <Stack
            direction="column"
            spacing={0.5}
            sx={{ position: "absolute", top: 8, left: 8 }}
          >
            {product.discountPercent ? (
              <Chip
                label={`${product.discountPercent}% OFF`}
                size="small"
                color="error"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            ) : null}
            {product.freeDelivery ? (
              <Chip
                label="Free Delivery"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22, bgcolor: "background.paper" }}
              />
            ) : null}
          </Stack>
          {product.stock === 0 && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Chip
                label="Out of Stock"
                size="small"
                sx={{
                  bgcolor: "background.paper",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          )}
        </Box>
        <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 1.5 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            {product.category}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 1,
              lineHeight: 1.4,
            }}
          >
            {product.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: "auto" }}>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
              {format(discountedPrice)}
            </Typography>
            {product.discountPercent ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {format(product.price)}
              </Typography>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
