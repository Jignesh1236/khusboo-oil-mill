import { useGetDashboard } from "@/lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";
import {
  Box, Card, CardContent, Typography, Grid, Skeleton, Divider, Chip,
} from "@mui/material";
import { Inventory2, AttachMoney, People, TrendingUp, Warning } from "@mui/icons-material";

function StatCard({ title, value, icon, sub }: { title: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          <Box sx={{ color: "primary.main", opacity: 0.7 }}>{icon}</Box>
        </Box>
        <Typography variant="h4" fontWeight={700}>{value}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

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

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboard();
  const { format } = useCurrency();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="text" width={200} height={44} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => <Grid key={i} size={{ xs: 6, md: 3 }}><Skeleton variant="rounded" height={120} /></Grid>)}
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={280} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={280} /></Grid>
        </Grid>
      </Box>
    );
  }

  if (!stats) return <Typography color="error">Failed to load dashboard stats.</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h4" fontWeight={700}>Dashboard</Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Total Revenue" value={format(stats.totalRevenue)} icon={<AttachMoney />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Total Orders" value={stats.totalOrders} icon={<Inventory2 />} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="New Users Today" value={stats.newUsersToday} icon={<People />} sub={`${stats.newUsersThisWeek} this week`} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard title="Top Products" value={stats.topProducts.length} icon={<TrendingUp />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Recent Orders</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {stats.recentOrders.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>No recent orders.</Typography>
                )}
                {stats.recentOrders.map((order, i) => (
                  <Box key={order._id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{order.userName || "Customer"}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" fontWeight={600}>{format(order.totalAmount)}</Typography>
                        <Chip label={order.status} size="small" color={getStatusColor(order.status)} variant="outlined" sx={{ fontSize: "0.65rem", height: 18 }} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Warning sx={{ color: "warning.main", fontSize: 20 }} /> Low Stock
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {stats.lowStockProducts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>All products are well-stocked.</Typography>
                )}
                {stats.lowStockProducts.map((product, i) => (
                  <Box key={product._id}>
                    {i > 0 && <Divider />}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5 }}>
                      <Typography variant="body2" fontWeight={500}>{product.name}</Typography>
                      <Chip label={`${product.stock} left`} size="small" color="error" variant="outlined" sx={{ fontWeight: 700, fontSize: "0.7rem" }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
