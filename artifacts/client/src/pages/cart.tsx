import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser } from "@/hooks/use-store-user";
import { useGetConfig } from "./lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCart();
  const { user } = useStoreUser();
  const { data: config } = useGetConfig();
  const { format, symbol } = useCurrency();

  const total = getCartTotal();
  const deliveryCharge = config?.deliveryCharge || 0;
  const freeDeliveryAbove = config?.freeDeliveryAbove || 0;
  
  const isFreeDelivery = total >= freeDeliveryAbove;
  const finalTotal = isFreeDelivery ? total : total + deliveryCharge;

  const handlePlaceOrder = () => {
    if (!config?.whatsappNumber) return;
    
    let message = `*New Order*\n\n`;
    message += `*Customer:* ${user?.name || 'Guest'}\n`;
    message += `*Address:* ${user?.address || 'Not provided'}\n`;
    message += `*Phone:* ${user?.phone || 'Not provided'}\n\n`;
    
    message += `*Items:*\n`;
    items.forEach(item => {
      const price = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;
      message += `- ${item.qty}x ${item.name} (${symbol}${price.toFixed(2)})\n`;
    });
    
    message += `\n*Subtotal:* ${symbol}${total.toFixed(2)}\n`;
    message += `*Delivery:* ${isFreeDelivery ? 'Free' : `${symbol}${deliveryCharge.toFixed(2)}`}\n`;
    message += `*Total:* ${symbol}${finalTotal.toFixed(2)}\n`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Trash2 className="h-10 w-10 text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-10">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({items.length})</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8 space-y-4">
          {items.map(item => {
            const discountedPrice = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;
            
            return (
              <div key={item.productId} className="flex gap-4 p-4 border rounded-xl bg-card">
                <div className="h-24 w-24 shrink-0 rounded-md bg-muted overflow-hidden">
                  {item.image ? (
                    <img src={item.image.replace('/upload/', '/upload/w_200,h_200,c_fill,q_auto,f_auto/')} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary">No Image</div>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium line-clamp-2 pr-4">{item.name}</h3>
                    <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="font-bold">{format(discountedPrice)}</div>
                    
                    <div className="flex items-center gap-3 bg-secondary rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.qty - 1))}
                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.qty + 1)}
                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-background transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="border rounded-xl p-6 bg-card sticky top-24">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{format(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{isFreeDelivery ? <span className="text-primary font-medium">Free</span> : format(deliveryCharge)}</span>
              </div>
              
              {!isFreeDelivery && freeDeliveryAbove > 0 && (
                <div className="text-xs text-primary bg-primary/10 p-2 rounded-md">
                  Add {format(freeDeliveryAbove - total)} more to get free delivery!
                </div>
              )}
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>{format(finalTotal)}</span>
              </div>
            </div>
            
            <Button onClick={handlePlaceOrder} className="w-full mt-6 flex items-center gap-2" size="lg">
              Place Order via WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
