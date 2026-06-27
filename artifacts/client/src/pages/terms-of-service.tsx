import { useGetConfig } from "@/lib/api-client-react";
import { Link } from "wouter";
import { Box, Typography, Skeleton, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export default function TermsOfService() {
  const { data: config, isLoading } = useGetConfig();

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" height={300} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", py: 4, px: 2 }}>
      <Button component={Link} href="/about" startIcon={<ArrowBack />} variant="text" sx={{ mb: 3 }}>
        Back to About
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Terms of Service
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="body1" paragraph>
        Please read these terms and conditions carefully before using Our Service.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>Acknowledgment</Typography>
      <Typography variant="body1" paragraph>
        These Terms govern the use of this Service and the agreement between You and{" "}
        {config?.storeName || "Our Store"}. By accessing or using the Service, You agree to be bound by these Terms.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>Placing Orders</Typography>
      <Typography variant="body1" paragraph>
        By placing an Order, You warrant that You are legally capable of entering into binding contracts. You may be
        asked to provide Name, Email, Phone number, and Shipping information to complete an Order.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>Contact Us</Typography>
      {config?.contactEmail && (
        <Typography variant="body1">By email: {config.contactEmail}</Typography>
      )}
      {config?.contactPhone && (
        <Typography variant="body1">By phone: {config.contactPhone}</Typography>
      )}
    </Box>
  );
}
