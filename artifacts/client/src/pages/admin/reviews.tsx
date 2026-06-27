import {
  useListAllReviews, useDeleteReview, getListAllReviewsQueryKey,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Typography, CircularProgress,
} from "@mui/material";
import { Delete, Star as StarIcon, StarBorder } from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useListAllReviews();
  const deleteMutation = useDeleteReview();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this review?")) return;
    deleteMutation.mutate(
      { reviewId: id },
      { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAllReviewsQueryKey() }); toast({ title: "Review deleted" }); } }
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" fontWeight={700}>Product Reviews</Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
          <Table sx={{ minWidth: 540 }}>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews?.map((review) => (
                <TableRow key={review._id} hover>
                  <TableCell fontWeight={500}>{review.userName || "Anonymous"}</TableCell>
                  <TableCell><Typography variant="caption" fontFamily="monospace">{review.productId.slice(-8).toUpperCase()}</Typography></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex" }}>
                      {[1, 2, 3, 4, 5].map((star) =>
                        star <= review.rating ? (
                          <StarIcon key={star} sx={{ fontSize: 14, color: "primary.main" }} />
                        ) : (
                          <StarBorder key={star} sx={{ fontSize: 14, color: "action.disabled" }} />
                        )
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Typography variant="body2" noWrap>{review.comment || "—"}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{new Date(review.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => handleDelete(review._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!reviews?.length && (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No reviews found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
