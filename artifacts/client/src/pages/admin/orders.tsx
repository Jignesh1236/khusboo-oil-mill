import { useState } from "react";
import { 
  useListOrders, 
  useUpdateOrderStatus,
  getListOrdersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGetConfig } from "@workspace/api-client-react";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  
  const { data: config } = useGetConfig();
  const { data: ordersPage, isLoading } = useListOrders({ page, limit: 20, status: statusFilter || undefined });
  const updateStatusMutation = useUpdateOrderStatus();

  const [viewingOrder, setViewingOrder] = useState<any | null>(null);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { orderId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order status updated" });
          if (viewingOrder && viewingOrder._id === orderId) {
            setViewingOrder({ ...viewingOrder, status: newStatus });
          }
        }
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20';
      case 'confirmed': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'out for delivery': return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 hover:bg-red-500/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="out for delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersPage?.orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs">{order._id.slice(-8).toUpperCase()}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{order.userName || "Guest"}</TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(val) => handleStatusChange(order._id, val)}>
                    <SelectTrigger className={`h-8 text-xs ${getStatusColor(order.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="out for delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setViewingOrder(order)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!ordersPage?.orders || ordersPage.orders.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {ordersPage && ordersPage.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <div className="flex items-center px-4">Page {page} of {ordersPage.pages}</div>
          <Button variant="outline" disabled={page === ordersPage.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details #{viewingOrder?._id.slice(-8).toUpperCase()}</DialogTitle>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold text-sm mb-1">Customer Info</h4>
                  <p className="text-sm">{viewingOrder.address.name}</p>
                  <p className="text-sm">{viewingOrder.address.phone}</p>
                  <a 
                    href={`https://wa.me/${viewingOrder.address.phone}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline"
                  >
                    <MessageCircle className="w-3 h-3" /> Chat with customer
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Delivery Address</h4>
                  <p className="text-sm">{viewingOrder.address.fullAddress}</p>
                  {viewingOrder.address.landmark && <p className="text-sm">Landmark: {viewingOrder.address.landmark}</p>}
                  <p className="text-sm">Pincode: {viewingOrder.address.pincode}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="border rounded-lg divide-y">
                  {viewingOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between p-3 text-sm">
                      <div className="flex gap-3">
                        <span className="font-bold w-6">{item.qty}x</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <div className="w-48 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(viewingOrder.totalAmount - (viewingOrder.deliveryCharge || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>${(viewingOrder.deliveryCharge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>${viewingOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
