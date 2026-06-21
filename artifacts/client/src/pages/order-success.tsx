import { useEffect } from "react";
import { Link } from "wouter";
import { useGetConfig } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const { data: config } = useGetConfig();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
        <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Order Redirected to WhatsApp!</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
        Thank you for shopping with us. Your order details have been populated in WhatsApp to complete the checkout process directly with our team.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Continue Shopping
          </Button>
        </Link>
        <Link href="/orders">
          <Button size="lg" className="w-full sm:w-auto">
            View My Orders
          </Button>
        </Link>
      </div>

      {config?.whatsappNumber && (
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Didn't open WhatsApp?</p>
          <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium mt-1 inline-block">
            Click here to open chat
          </a>
        </div>
      )}
    </div>
  );
}
