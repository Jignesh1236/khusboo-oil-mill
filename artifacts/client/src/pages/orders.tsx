import { useGetUserOrders } from "@/lib/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { useCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Phone, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Orders() {
  const { user } = useStoreUser();
  const { format } = useCurrency();
  const { data: orders, isLoading } = useGetUserOrders(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["userOrders", user?._id] }
  });

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <Skeleton className="h-8 w-48 mb-6" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200';
      case 'out for delivery': return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200';
      case 'delivered': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200';
      case 'cancelled': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="pb-24 lg:pb-10">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card border rounded-xl">
          <Package className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-medium mb-2">No orders yet</h2>
          <p className="text-muted-foreground">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="border bg-card rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-muted/30 flex flex-wrap justify-between gap-4 items-center">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <Badge variant="outline" className={getStatusColor(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="space-y-3 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium w-6">{item.qty}x</span>
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{format(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Status History for User - Timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Order Tracking
                    </h4>
                    <div className="relative pl-6 space-y-4 border-l-2 border-muted">
                      {order.statusHistory.map((history: any, idx: number) => (
                        <div key={idx} className="relative">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background ${
                            history.status.toLowerCase() === 'pending' ? 'bg-yellow-500' :
                            history.status.toLowerCase() === 'confirmed' ? 'bg-blue-500' :
                            history.status.toLowerCase() === 'out for delivery' ? 'bg-purple-500' :
                            history.status.toLowerCase() === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <Badge className={getStatusColor(history.status)}>
                              {history.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.timestamp).toLocaleString('en-IN', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />
                
                <div className="flex justify-between pt-2 font-bold text-lg">
                  <span>Total</span>
                  <span>{format(order.totalAmount)}</span>
                </div>
              </div>

              <div className="p-4 bg-muted/10 border-t text-sm space-y-2">
                <div className="flex gap-2 items-start">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="text-muted-foreground">
                    <p>{order.address.fullName || "Customer"}</p>
                    <p>{order.address.houseFlatBuilding}</p>
                    <p>{order.address.streetArea}</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.country} - {order.address.pincode}</p>
                    {order.address.landmark && <p>Landmark: {order.address.landmark}</p>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{order.address.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
