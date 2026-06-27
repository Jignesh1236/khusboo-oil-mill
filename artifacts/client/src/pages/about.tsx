import { useGetConfig } from "@/lib/api-client-react";
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Paper,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Instagram,
  Facebook,
} from "@mui/icons-material";

export default function About() {
  const { data: config, isLoading } = useGetConfig();

  if (isLoading) {
    return (
      <Box sx={{ pb: 10 }}>
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3, mb: 4 }} />
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="text" sx={{ mt: 1 }} />
        <Skeleton variant="text" width="75%" />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 10, md: 4 }, maxWidth: 840, mx: "auto" }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        {config?.logoUrl && (
          <Box
            component="img"
            src={config.logoUrl}
            alt="Store Logo"
            sx={{ height: 96, width: "auto", objectFit: "contain", mx: "auto", mb: 3, display: "block" }}
          />
        )}
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {config?.storeName || "About Us"}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ lineHeight: 1.8, whiteSpace: "pre-line", maxWidth: 600, mx: "auto" }}
        >
          {config?.aboutUs || "Welcome to our store. We provide the best quality products for you."}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Contact Info
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              {config?.contactAddress && (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <LocationOn color="primary" sx={{ mt: 0.25 }} />
                  <Typography variant="body2" color="text.secondary">
                    {config.contactAddress}
                  </Typography>
                </Box>
              )}
              {config?.contactPhone && (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Phone color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {config.contactPhone}
                  </Typography>
                </Box>
              )}
              {config?.contactEmail && (
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <Email color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    {config.contactEmail}
                  </Typography>
                </Box>
              )}
            </Box>

            {(config?.instagramUrl || config?.facebookUrl) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Follow Us
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {config?.instagramUrl && (
                    <Box
                      component="a"
                      href={config.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "primary.main", color: "#fff" },
                      }}
                    >
                      <Instagram fontSize="small" />
                    </Box>
                  )}
                  {config?.facebookUrl && (
                    <Box
                      component="a"
                      href={config.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "action.hover",
                        color: "text.secondary",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "primary.main", color: "#fff" },
                      }}
                    >
                      <Facebook fontSize="small" />
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: "100%" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Store Timings
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mt: 2 }}>
              <AccessTime color="primary" sx={{ mt: 0.25 }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {config?.storeTimingDays || "Monday – Saturday"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {config?.storeTimingOpen || "09:00 AM"} – {config?.storeTimingClose || "08:00 PM"}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {config?.mapEmbedUrl && (
        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Location
          </Typography>
          <Box
            sx={{
              width: "100%",
              aspectRatio: { xs: "16/9", md: "21/9" },
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <iframe
              src={config.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location Map"
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
