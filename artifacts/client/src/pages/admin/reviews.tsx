import { 
  useListAllReviews, 
  useDeleteReview,
  getListAllReviewsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminReviews() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useListAllReviews();
  const deleteMutation = useDeleteReview();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate(
        { reviewId: id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListAllReviewsQueryKey() });
            toast({ title: "Review deleted" });
          }
        }
      );
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Reviews</h1>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews?.map((review) => (
              <TableRow key={review._id}>
                <TableCell className="font-medium">{review.userName || "Anonymous"}</TableCell>
                <TableCell className="font-mono text-xs">{review.productId.slice(-8).toUpperCase()}</TableCell>
                <TableCell>
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{review.comment || "-"}</TableCell>
                <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(review._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!reviews || reviews.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No reviews found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
