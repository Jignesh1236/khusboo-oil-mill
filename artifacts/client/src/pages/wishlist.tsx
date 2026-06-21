import { useGetWishlist } from "./lib/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";

export default function Wishlist() {
  const { user } = useStoreUser();
  const { data: wishlistData, isLoading } = useGetWishlist(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["wishlist", user?._id] }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      </div>
    );
  }

  const products = wishlistData || [];

  return (
    <div className="pb-24 lg:pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="h-6 w-6 text-primary fill-primary" />
        <h1 className="text-2xl font-bold">My Wishlist</h1>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground">Save items you love to review them later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
