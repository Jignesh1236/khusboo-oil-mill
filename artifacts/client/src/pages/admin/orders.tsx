import { useState } from "react";
import {
  useListOrders, useUpdateOrderStatus, useDeleteOrder, getListOrdersQueryKey, useGetConfig,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Typography, Chip, CircularProgress, Divider, Stack, Paper,
} from "@mui/material";
import { Visibility, Delete, WhatsApp, AccessTime } from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/use-currency";

const STATUS_OPTIONS = ["pending", "confirmed", "out for delivery", "delivered", "cancelled"];

function getStatusColor(status: string): "warning" | "info" | "secondary" | "success" | "error" | "default" {
  switch (status.toLowerCase()) {
    case "pending": return "warning";
    case "confirmed": return "info";
    case "out for delivery": return "secondary";
    case "delivered": return "success";
    case "cancelled": return "error";
    default: return "default";
  }
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const { data: config } = useGetConfig();
  const { data: ordersPage, isLoading } = useListOrders({ page, limit: 20, status: statusFilter || undefined });
  const updateStatusMutation = useUpdateOrderStatus();
  const deleteOrderMutation = useDeleteOrder();
  const { format } = useCurrency();

  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { orderId, data: { status: newStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order status updated" });
          if (viewingOrder?._id === orderId) {
            setViewingOrder({ ...viewingOrder, status: newStatus, statusHistory: [...(viewingOrder.statusHistory || []), { status: newStatus, timestamp: new Date() }] });
          }
        },
      }
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(
      { orderId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order deleted" });
          setDeleteOrderId(null);
          if (viewingOrder?._id === orderId) setViewingOrder(null);
        },
      }
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Orders</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select label="Status Filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Desktop table */}
          <Box sx={{ display: { xs: "none", md: "block" }, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersPage?.orders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell><Typography variant="caption" fontFamily="monospace">#{order._id.slice(-8).toUpperCase()}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{order.userName || "Guest"}</Typography></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{format(order.totalAmount)}</Typography></TableCell>
                    <TableCell>
                      <Select size="small" value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)} sx={{ minWidth: 140, fontSize: "0.8rem" }}>
                        {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize", fontSize: "0.8rem" }}>{s}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setViewingOrder(order)}><Visibility fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteOrderId(order._id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!ordersPage?.orders?.length && (
                  <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No orders found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile cards */}
          <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
            {ordersPage?.orders.map((order) => (
              <Paper key={order._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Box>
                    <Typography variant="caption" fontFamily="monospace" color="text.secondary">#{order._id.slice(-8).toUpperCase()}</Typography>
                    <Typography variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Chip label={order.status} size="small" color={getStatusColor(order.status)} variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.7rem" }} />
                </Box>
                <Typography variant="body2" fontWeight={600}>{order.userName || "Guest"}</Typography>
                <Typography variant="h6" fontWeight={700}>{format(order.totalAmount)}</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <FormControl size="small" fullWidth>
                    <Select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1.5 }}>
                  <Button size="small" startIcon={<Visibility fontSize="small" />} onClick={() => setViewingOrder(order)}>View</Button>
                  <Button size="small" color="error" startIcon={<Delete fontSize="small" />} onClick={() => setDeleteOrderId(order._id)}>Delete</Button>
                </Box>
              </Paper>
            ))}
          </Stack>

          {ordersPage && ordersPage.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
              <Button variant="outlined" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Typography variant="body2">Page {page} of {ordersPage.pages}</Typography>
              <Button variant="outlined" disabled={page === ordersPage.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Box>
          )}
        </>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!viewingOrder} onClose={() => setViewingOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>Order #{viewingOrder?._id.slice(-8).toUpperCase()}</DialogTitle>
        <DialogContent dividers>
          {viewingOrder && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, bgcolor: "action.hover", p: 2.5, borderRadius: 2 }}>
                <Box>
                  <Typography variant="body2" fontWeight={700} gutterBottom>Customer Info</Typography>
                  <Typography variant="body2">{viewingOrder.address?.fullName || viewingOrder.userName || "Guest"}</Typography>
                  <Typography variant="body2">{viewingOrder.address?.phone}</Typography>
                  {viewingOrder.address?.phone && (
                    <Box component="a" href={`https://wa.me/${viewingOrder.address.phone}`} target="_blank" rel="noreferrer" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "success.main", fontSize: "0.8rem", mt: 0.5 }}>
                      <WhatsApp sx={{ fontSize: 14 }} /> Chat via WhatsApp
                    </Box>
                  )}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={700} gutterBottom>Delivery Address</Typography>
                  <Typography variant="body2">{viewingOrder.address?.houseFlatBuilding}</Typography>
                  <Typography variant="body2">{viewingOrder.address?.streetArea}</Typography>
                  <Typography variant="body2">{viewingOrder.address?.city}, {viewingOrder.address?.state}, {viewingOrder.address?.country}</Typography>
                  {viewingOrder.address?.landmark && <Typography variant="body2">Landmark: {viewingOrder.address.landmark}</Typography>}
                  <Typography variant="body2">Pincode: {viewingOrder.address?.pincode}</Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={700} gutterBottom>Items</Typography>
                <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                  {viewingOrder.items.map((item: any, idx: number) => (
                    <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", p: 1.5, borderBottom: idx < viewingOrder.items.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{item.qty}x</Typography>
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>{format(item.price * item.qty)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {viewingOrder.statusHistory?.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
                    <AccessTime fontSize="small" /> Status Timeline
                  </Typography>
                  <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 2 }}>
                    {viewingOrder.statusHistory.map((h: any, i: number) => (
                      <Box key={i} sx={{ position: "relative" }}>
                        <Box sx={{ position: "absolute", left: -17, top: 6, width: 14, height: 14, borderRadius: "50%", bgcolor: getStatusColor(h.status) === "default" ? "grey.400" : `${getStatusColor(h.status)}.main`, border: "2px solid", borderColor: "background.paper" }} />
                        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                          <Chip label={h.status} size="small" color={getStatusColor(h.status)} variant="outlined" sx={{ textTransform: "capitalize" }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(h.timestamp).toLocaleString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ minWidth: 180 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2">{format(viewingOrder.totalAmount - (viewingOrder.deliveryCharge || 0))}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Delivery</Typography>
                    <Typography variant="body2">{format(viewingOrder.deliveryCharge || 0)}</Typography>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography fontWeight={700}>Total</Typography>
                    <Typography fontWeight={700}>{format(viewingOrder.totalAmount)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewingOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteOrderId} onClose={() => setDeleteOrderId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Delete Order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete the order. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteOrderId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteOrderId && handleDeleteOrder(deleteOrderId)} disabled={deleteOrderMutation.isPending}>
            {deleteOrderMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
