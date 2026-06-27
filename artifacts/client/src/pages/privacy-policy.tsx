import { useGetConfig } from "@/lib/api-client-react";
import { Link } from "wouter";
import { Box, Typography, Skeleton, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export default function PrivacyPolicy() {
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
      <Button
        component={Link}
        href="/"
        startIcon={<ArrowBack />}
        variant="text"
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="body1" paragraph>
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure
        of Your information when You use the Service and tells You about Your privacy rights and how the law
        protects You.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>1. Definitions</Typography>
      <Typography variant="body1" paragraph>
        <strong>Company</strong> refers to {config?.storeName || "Our Store"}. <strong>Service</strong> refers to
        the Website. <strong>Personal Data</strong> means any information that relates to an identified or identifiable
        individual.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>2. Data We Collect</Typography>
      <Typography variant="body1" paragraph>
        We may collect Full Name, Phone Number, Address, City, State, Pincode, Country, IP Address, and usage data
        to provide and improve our services.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>3. Use of Your Data</Typography>
      <Typography variant="body1" paragraph>
        We use Personal Data to fulfill orders, manage delivery, contact you regarding transactions, and improve
        our Service.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>4. Data Retention</Typography>
      <Typography variant="body1" paragraph>
        We retain Your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>5. Security</Typography>
      <Typography variant="body1" paragraph>
        We strive to use commercially acceptable means to protect Your Personal Data, though no method is 100% secure.
      </Typography>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>6. Contact Us</Typography>
      {config?.contactEmail && <Typography variant="body1">Email: {config.contactEmail}</Typography>}
      {config?.contactPhone && <Typography variant="body1">Phone: {config.contactPhone}</Typography>}
    </Box>
  );
}
