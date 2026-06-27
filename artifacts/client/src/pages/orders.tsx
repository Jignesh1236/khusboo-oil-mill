import { useGetUserOrders } from "@/lib/api-client-react";
import { useStoreUser } from "@/hooks/use-store-user";
import { useCurrency } from "@/hooks/use-currency";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";
import { Inventory2, LocationOn, Phone, AccessTime } from "@mui/icons-material";

function getStatusColor(
  status: string
): "warning" | "info" | "secondary" | "success" | "error" | "default" {
  switch (status.toLowerCase()) {
    case "pending": return "warning";
    case "confirmed": return "info";
    case "out for delivery": return "secondary";
    case "delivered": return "success";
    case "cancelled": return "error";
    default: return "default";
  }
}

function getTimelineDotColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending": return "#eab308";
    case "confirmed": return "#0ea5e9";
    case "out for delivery": return "#a855f7";
    case "delivered": return "#22c55e";
    case "cancelled": return "#ef4444";
    default: return "#94a3b8";
  }
}

export default function Orders() {
  const { user } = useStoreUser();
  const { format } = useCurrency();
  const { data: orders, isLoading } = useGetUserOrders(user?._id || "", {
    query: { enabled: !!user?._id, queryKey: ["userOrders", user?._id] },
  });

  if (isLoading) {
    return (
      <Box sx={{ pb: 10 }}>
        <Skeleton variant="text" width={180} height={40} sx={{ mb: 3 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={180} sx={{ mb: 2, borderRadius: 3 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Order History
      </Typography>

      {!orders || orders.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 3, p: 6, textAlign: "center" }}
        >
          <Inventory2 sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When you place an order, it will appear here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => (
            <Paper key={order._id} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  bgcolor: "action.hover",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    fontFamily="monospace"
                    color="text.secondary"
                    display="block"
                  >
                    Order #{order._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
                <Chip
                  label={order.status.toUpperCase()}
                  size="small"
                  color={getStatusColor(order.status)}
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                />
              </Box>

              <Box sx={{ p: 2.5 }}>
                <Stack spacing={1} sx={{ mb: 3 }}>
                  {order.items.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item.qty}x
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={500}>
                        {format(item.price * item.qty)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {order.statusHistory && order.statusHistory.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}
                    >
                      <AccessTime fontSize="small" sx={{ color: "text.secondary" }} />
                      Order Tracking
                    </Typography>
                    <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 2 }}>
                      {(order.statusHistory as any[]).map((history, idx) => (
                        <Box key={idx} sx={{ position: "relative" }}>
                          <Box
                            sx={{
                              position: "absolute",
                              left: -17,
                              top: 4,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              bgcolor: getTimelineDotColor(history.status),
                              border: "2px solid",
                              borderColor: "background.paper",
                            }}
                          />
                          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                            <Chip
                              label={history.status}
                              size="small"
                              color={getStatusColor(history.status)}
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {new Date(history.timestamp).toLocaleString("en-IN", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {format(order.totalAmount)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  bgcolor: "action.hover",
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ color: "text.secondary", mt: 0.25, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2">{order.address.fullName || "Customer"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.address.houseFlatBuilding}, {order.address.streetArea}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.address.city}, {order.address.state}, {order.address.country} –{" "}
                      {order.address.pincode}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Phone fontSize="small" sx={{ color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {order.address.phone}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
