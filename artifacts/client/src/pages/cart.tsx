import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser } from "@/hooks/use-store-user";
import { useGetConfig, useOnboardUser, useCreateOrder } from "@/lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserAddress, OrderAddress } from "@/lib/api-client-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal, clearCart } = useCart();
  const { user, saveUser } = useStoreUser();
  const { data: config } = useGetConfig();
  const { format, symbol } = useCurrency();
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Address form state
  const [formData, setFormData] = useState<UserAddress & { phone?: string }>({
    fullName: user?.address?.fullName || user?.name || "",
    phone: user?.address?.phone || user?.phone || "",
    houseFlatBuilding: user?.address?.houseFlatBuilding || "",
    streetArea: user?.address?.streetArea || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    country: user?.address?.country || "India",
    landmark: user?.address?.landmark || "",
  });
  
  const onboardUser = useOnboardUser();
  const createOrder = useCreateOrder();
  const [isOrdering, setIsOrdering] = useState(false);

  const total = getCartTotal();
  const deliveryCharge = config?.deliveryCharge || 0;
  const freeDeliveryAbove = config?.freeDeliveryAbove || 0;
  
  const isFreeDelivery = total >= freeDeliveryAbove;
  const finalTotal = isFreeDelivery ? total : total + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!user || !config?.whatsappNumber) return;

    try {
      setIsOrdering(true);
      
      // Prepare address objects
      const userAddress: UserAddress = {
        fullName: formData.fullName,
        phone: formData.phone,
        houseFlatBuilding: formData.houseFlatBuilding,
        streetArea: formData.streetArea,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        landmark: formData.landmark,
      };

      const orderAddress: OrderAddress = {
        fullName: formData.fullName || user.name,
        phone: formData.phone || "",
        houseFlatBuilding: formData.houseFlatBuilding || "",
        streetArea: formData.streetArea || "",
        city: formData.city || "",
        state: formData.state || "",
        pincode: formData.pincode || "",
        country: formData.country || "India",
        landmark: formData.landmark,
      };
      
      // Update user info in DB
      await onboardUser.mutateAsync({
        data: {
          name: formData.fullName || user.name,
          ip: user.ip,
          address: userAddress,
          phone: formData.phone
        }
      });
      
      // Save updated user locally
      saveUser({
        ...user,
        name: formData.fullName || user.name,
        address: userAddress,
        phone: formData.phone
      });
      
      // Create order in DB
      const order = await createOrder.mutateAsync({
        data: {
          userId: user._id,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price,
            qty: item.qty
          })),
          address: orderAddress,
          totalAmount: finalTotal,
          deliveryCharge: isFreeDelivery ? 0 : deliveryCharge
        }
      });
      
      // Clear cart
      clearCart();
      
      // Open WhatsApp
      let message = `*New Order*\n\n`;
      message += `*Order ID:* ${order._id}\n`;
      message += `*Name:* ${formData.fullName || user.name}\n`;
      message += `*Phone:* ${formData.phone}\n\n`;
      message += `*Address:*\n`;
      message += `${formData.houseFlatBuilding},\n`;
      message += `${formData.streetArea},\n`;
      message += `${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}\n`;
      if (formData.landmark) {
        message += `*Landmark:* ${formData.landmark}\n`;
      }
      
      message += `\n*Items:*\n`;
      items.forEach(item => {
        const price = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;
        message += `- ${item.qty}x ${item.name} (${symbol}${price.toFixed(2)})\n`;
      });
      
      message += `\n*Subtotal:* ${symbol}${total.toFixed(2)}\n`;
      message += `*Delivery:* ${isFreeDelivery ? 'Free' : `${symbol}${deliveryCharge.toFixed(2)}`}\n`;
      message += `*Total:* ${symbol}${finalTotal.toFixed(2)}\n`;
      
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`, '_blank');
      
      // Redirect to order success page
      setLocation("/order-success");
      
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setIsOrdering(false);
      setIsModalOpen(false);
    }
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
            
            <Button onClick={() => setIsModalOpen(true)} className="w-full mt-6 flex items-center gap-2" size="lg">
              Place Order via WhatsApp <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Address & Phone Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Delivery Details</DialogTitle>
            <DialogDescription>Please provide your delivery details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={formData.fullName} 
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} 
                placeholder="Enter your full name" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                placeholder="Enter your mobile number" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="houseFlatBuilding">House / Flat / Building Name</Label>
              <Input 
                id="houseFlatBuilding" 
                value={formData.houseFlatBuilding} 
                onChange={(e) => setFormData(prev => ({ ...prev, houseFlatBuilding: e.target.value }))} 
                placeholder="Enter house/flat/building name" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetArea">Street / Area</Label>
              <Input 
                id="streetArea" 
                value={formData.streetArea} 
                onChange={(e) => setFormData(prev => ({ ...prev, streetArea: e.target.value }))} 
                placeholder="Enter street/area" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} 
                  placeholder="Enter city" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input 
                  id="state" 
                  value={formData.state} 
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} 
                  placeholder="Enter state" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input 
                  id="pincode" 
                  value={formData.pincode} 
                  onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))} 
                  placeholder="Enter pincode" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={formData.country} 
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))} 
                  placeholder="Enter country" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input 
                id="landmark" 
                value={formData.landmark} 
                onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))} 
                placeholder="Enter landmark (optional)" 
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handlePlaceOrder} 
              disabled={
                !formData.fullName?.trim() || 
                !formData.phone?.trim() || 
                !formData.houseFlatBuilding?.trim() || 
                !formData.streetArea?.trim() || 
                !formData.city?.trim() || 
                !formData.state?.trim() || 
                !formData.pincode?.trim() || 
                !formData.country?.trim() || 
                isOrdering
              }
              className="flex items-center gap-2"
            >
              {isOrdering ? "Placing Order..." : "Confirm & Place Order"}
              {!isOrdering && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
