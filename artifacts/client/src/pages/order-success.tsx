import { useEffect } from "react";
import { Link } from "wouter";
import { useGetConfig } from "@/lib/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import { CheckCircle, WhatsApp } from "@mui/icons-material";

export default function OrderSuccess() {
  const { data: config } = useGetConfig();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        textAlign: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          maxWidth: 500,
          width: "100%",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            bgcolor: "success.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CheckCircle sx={{ fontSize: 52, color: "success.dark" }} />
        </Box>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          Order Redirected to WhatsApp!
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
          Thank you for shopping with us. Your order details have been populated in WhatsApp to
          complete the checkout process directly with our team.
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button component={Link} href="/" variant="outlined" size="large">
            Continue Shopping
          </Button>
          <Button component={Link} href="/orders" variant="contained" size="large">
            View My Orders
          </Button>
        </Stack>

        {config?.whatsappNumber && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Didn't open WhatsApp?
            </Typography>
            <Button
              component="a"
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              startIcon={<WhatsApp />}
              color="success"
              variant="text"
            >
              Click here to open chat
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
