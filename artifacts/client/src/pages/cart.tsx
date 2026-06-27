import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser } from "@/hooks/use-store-user";
import { useGetConfig, useOnboardUser, useCreateOrder } from "@/lib/api-client-react";
import { useCurrency } from "@/hooks/use-currency";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
} from "@mui/material";
import { Remove, Add, DeleteOutline, ArrowForward, ShoppingCart, WhatsApp } from "@mui/icons-material";
import type { UserAddress, OrderAddress } from "@/lib/api-client-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal, clearCart } = useCart();
  const { user, saveUser } = useStoreUser();
  const { data: config } = useGetConfig();
  const { format, symbol } = useCurrency();
  const [, setLocation] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      await onboardUser.mutateAsync({
        data: {
          name: formData.fullName || user.name,
          ip: user.ip,
          address: userAddress,
          phone: formData.phone,
        },
      });
      saveUser({ ...user, name: formData.fullName || user.name, address: userAddress, phone: formData.phone });
      const order = await createOrder.mutateAsync({
        data: {
          userId: user._id,
          items: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price,
            qty: item.qty,
          })),
          address: orderAddress,
          totalAmount: finalTotal,
          deliveryCharge: isFreeDelivery ? 0 : deliveryCharge,
        },
      });
      clearCart();
      let message = `*New Order*\n\n*Order ID:* ${order._id}\n*Name:* ${formData.fullName || user.name}\n*Phone:* ${formData.phone}\n\n*Address:*\n${formData.houseFlatBuilding},\n${formData.streetArea},\n${formData.city}, ${formData.state}, ${formData.country} - ${formData.pincode}\n`;
      if (formData.landmark) message += `*Landmark:* ${formData.landmark}\n`;
      message += `\n*Items:*\n`;
      items.forEach((item) => {
        const price = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;
        message += `- ${item.qty}x ${item.name} (${symbol}${price.toFixed(2)})\n`;
      });
      message += `\n*Subtotal:* ${symbol}${total.toFixed(2)}\n*Delivery:* ${isFreeDelivery ? "Free" : `${symbol}${deliveryCharge.toFixed(2)}`}\n*Total:* ${symbol}${finalTotal.toFixed(2)}\n`;
      window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
      setLocation("/order-success");
    } catch {
      console.error("Order failed");
    } finally {
      setIsOrdering(false);
      setIsModalOpen(false);
    }
  };

  const canSubmit =
    !!formData.fullName?.trim() &&
    !!formData.phone?.trim() &&
    !!formData.houseFlatBuilding?.trim() &&
    !!formData.streetArea?.trim() &&
    !!formData.city?.trim() &&
    !!formData.state?.trim() &&
    !!formData.pincode?.trim() &&
    !!formData.country?.trim() &&
    !isOrdering;

  if (items.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10, textAlign: "center" }}>
        <Box sx={{ width: 96, height: 96, borderRadius: "50%", bgcolor: "action.hover", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
          <ShoppingCart sx={{ fontSize: 44, color: "text.disabled" }} />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 340 }}>
          Looks like you haven't added anything to your cart yet.
        </Typography>
        <Button component={Link} href="/" variant="contained" size="large">
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 10, md: 4 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Shopping Cart ({items.length})
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={2}>
            {items.map((item) => {
              const discountedPrice = item.discountPercent
                ? item.price * (1 - item.discountPercent / 100)
                : item.price;
              return (
                <Paper key={item.productId} variant="outlined" sx={{ p: 2, borderRadius: 3, display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "action.hover",
                    }}
                  >
                    {item.image ? (
                      <Box
                        component="img"
                        src={item.image.replace("/upload/", "/upload/w_200,h_200,c_fill,q_auto,f_auto/")}
                        alt={item.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ShoppingCart sx={{ color: "text.disabled" }} />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Typography variant="body2" fontWeight={500} sx={{ pr: 1, lineHeight: 1.4 }}>
                        {item.name}
                      </Typography>
                      <IconButton size="small" onClick={() => removeItem(item.productId)} color="default">
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                      <Typography fontWeight={700}>{format(discountedPrice)}</Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "action.hover",
                          borderRadius: 99,
                          px: 1,
                          py: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.qty - 1))}
                          sx={{ p: 0.25 }}
                        >
                          <Remove sx={{ fontSize: 14 }} />
                        </IconButton>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 16, textAlign: "center" }}>
                          {item.qty}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.productId, item.qty + 1)}
                          sx={{ p: 0.25 }}
                        >
                          <Add sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 3, position: { lg: "sticky" }, top: { lg: 88 } }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Order Summary
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{format(total)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Delivery</Typography>
                <Typography variant="body2" color={isFreeDelivery ? "success.main" : undefined} fontWeight={isFreeDelivery ? 600 : 400}>
                  {isFreeDelivery ? "Free" : format(deliveryCharge)}
                </Typography>
              </Box>
              {!isFreeDelivery && freeDeliveryAbove > 0 && (
                <Alert severity="info" sx={{ py: 0.5, fontSize: "0.78rem" }}>
                  Add {format(freeDeliveryAbove - total)} more for free delivery!
                </Alert>
              )}
              <Divider />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body1" fontWeight={700}>Total</Typography>
                <Typography variant="h6" fontWeight={700}>{format(finalTotal)}</Typography>
              </Box>
            </Stack>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForward />}
              startIcon={<WhatsApp />}
              sx={{ mt: 3, borderRadius: 99 }}
            >
              Order via WhatsApp
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Enter Delivery Details</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Mobile Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="House / Flat / Building"
              value={formData.houseFlatBuilding}
              onChange={(e) => setFormData((p) => ({ ...p, houseFlatBuilding: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Street / Area"
              value={formData.streetArea}
              onChange={(e) => setFormData((p) => ({ ...p, streetArea: e.target.value }))}
              fullWidth
              required
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="State"
                  value={formData.state}
                  onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData((p) => ({ ...p, pincode: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <TextField
              label="Landmark (Optional)"
              value={formData.landmark}
              onChange={(e) => setFormData((p) => ({ ...p, landmark: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePlaceOrder}
            disabled={!canSubmit}
            endIcon={<ArrowForward />}
          >
            {isOrdering ? "Placing Order..." : "Confirm & Place Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
