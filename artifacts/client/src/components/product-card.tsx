import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "./lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";

export function ProductCard({ product }: { product: Product }) {
  const { format } = useCurrency();
  const imageUrl = product.images?.[0] 
    ? product.images[0].replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/')
    : "https://via.placeholder.com/400x400?text=No+Image";

  const discountedPrice = product.discountPercent 
    ? product.price - (product.price * product.discountPercent / 100)
    : product.price;

  return (
    <Link href={`/product/${product._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
        <div className="relative aspect-square">
          <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discountPercent ? (
              <Badge variant="destructive">{product.discountPercent}% OFF</Badge>
            ) : null}
            {product.freeDelivery ? (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Free Delivery</Badge>
            ) : null}
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg py-1 px-3 shadow-md backdrop-blur-md">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
            <h3 className="font-medium line-clamp-2 mb-2">{product.name}</h3>
          </div>
          <div className="flex items-center gap-2 mt-auto">
            <span className="font-bold text-lg">{format(discountedPrice)}</span>
            {product.discountPercent ? (
              <span className="text-sm text-muted-foreground line-through">{format(product.price)}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
