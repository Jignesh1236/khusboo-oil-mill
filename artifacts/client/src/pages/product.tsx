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
  getGetWishlistQueryKey
} from "./lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser } from "@/hooks/use-store-user";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Minus, Plus, ShoppingCart, Star, StarHalf } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useStoreUser();
  const { addItem } = useCart();
  
  const { format } = useCurrency();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useGetProduct(id || "");
  const { data: relatedProducts } = useListProducts(
    { category: product?.category, limit: 4 },
    { query: { enabled: !!product?.category, queryKey: ["products", "related", product?.category] } }
  );
  const { data: reviews } = useGetProductReviews(id || "");

  const { data: wishlist } = useGetWishlist(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["wishlist", user?._id] }
  });

  const isWishlisted = wishlist?.some(w => w._id === id);
  
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
      discountPercent: product.discountPercent || undefined
    });
    toast({ title: "Added to cart", description: `${qty}x ${product.name} added to your cart.` });
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
          }
        }
      );
    } else {
      addToWishlistMutation.mutate(
        { data: { userId: user._id, productId: product._id } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey(user._id) });
            toast({ title: "Added to wishlist" });
          }
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
          orderId: "guest", // Placeholder as per simple logic
          rating: reviewRating,
          comment: reviewComment
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetProductReviewsQueryKey(product._id) });
          setReviewComment("");
          toast({ title: "Review submitted", description: "Thank you for your feedback!" });
        }
      }
    );
  };

  if (isLoading) return <div className="p-4"><Skeleton className="h-96 w-full" /></div>;
  if (!product) return <div className="p-4 text-center">Product not found</div>;

  const discountedPrice = product.discountPercent 
    ? product.price - (product.price * product.discountPercent / 100)
    : product.price;

  const images = product.images?.length ? product.images : ["https://via.placeholder.com/800x800?text=No+Image"];

  return (
    <div className="pb-24 lg:pb-10 space-y-12">
      {/* Product Details */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-2xl overflow-hidden border">
            <img 
              src={images[activeImage].replace('/upload/', '/upload/w_800,q_auto,f_auto/')} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === i ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/')} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{product.category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-bold">{product.avgRating?.toFixed(1) || "0.0"}</span>
              <span className="text-sm text-muted-foreground">({product.reviewCount || 0})</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">{format(discountedPrice)}</span>
            {product.discountPercent && (
              <>
                <span className="text-xl text-muted-foreground line-through">{format(product.price)}</span>
                <Badge variant="destructive" className="text-sm px-2 py-1">{product.discountPercent}% OFF</Badge>
              </>
            )}
          </div>

          <div className="prose prose-sm dark:prose-invert mb-8 max-w-none">
            <p>{product.description || "No description available."}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              {product.stock > 0 ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200">In Stock ({product.stock})</Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
            {product.deliveryTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Delivery:</span> {product.deliveryTime}
              </div>
            )}
            {product.freeDelivery && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 w-fit">Free Delivery Eligible</Badge>
            )}
          </div>

          <div className="mt-auto space-y-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-secondary rounded-full p-1 border">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button 
                className="flex-1 rounded-full h-12 text-base font-bold" 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className={`h-12 w-12 rounded-full shrink-0 ${isWishlisted ? 'border-primary bg-primary/5' : ''}`}
                onClick={toggleWishlist}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            {reviews?.length ? (
              reviews.map(review => (
                <div key={review._id} className="border rounded-xl p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{review.userName || "Anonymous"}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'fill-primary text-primary' : 'text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground block mb-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
          </div>

          <div className="bg-muted/30 p-6 rounded-2xl h-fit border">
            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(star => (
                    <button type="button" key={star} onClick={() => setReviewRating(star)}>
                      <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-primary text-primary' : 'text-muted hover:text-primary/50'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Review</label>
                <Textarea 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="What did you like about this product?"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={createReviewMutation.isPending} className="w-full">
                {createReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.products.length > 0 && (
        <div className="pt-8 border-t">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.products.filter(p => p._id !== product._id).slice(0, 4).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
