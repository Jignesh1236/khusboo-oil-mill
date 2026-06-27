import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useGetConfig, useUpdateConfig, type StoreConfigInput } from "@/lib/api-client-react";
import {
  Box, Button, TextField, Typography, Card, CardContent, Grid,
  CircularProgress, Divider, Select, MenuItem, InputAdornment,
  FormControl, InputLabel, OutlinedInput,
} from "@mui/material";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "@/hooks/use-toast";

const COUNTRY_CODES = [
  { code: "91", flag: "🇮🇳", label: "+91" },
  { code: "1", flag: "🇺🇸", label: "+1" },
  { code: "44", flag: "🇬🇧", label: "+44" },
  { code: "971", flag: "🇦🇪", label: "+971" },
  { code: "966", flag: "🇸🇦", label: "+966" },
  { code: "61", flag: "🇦🇺", label: "+61" },
  { code: "65", flag: "🇸🇬", label: "+65" },
  { code: "60", flag: "🇲🇾", label: "+60" },
  { code: "92", flag: "🇵🇰", label: "+92" },
  { code: "880", flag: "🇧🇩", label: "+880" },
  { code: "94", flag: "🇱🇰", label: "+94" },
  { code: "977", flag: "🇳🇵", label: "+977" },
];

function parseWhatsApp(full: string): { cc: string; local: string } {
  if (!full) return { cc: "91", local: "" };
  for (const c of COUNTRY_CODES) {
    if (full.startsWith(c.code)) {
      return { cc: c.code, local: full.slice(c.code.length) };
    }
  }
  return { cc: "91", local: full };
}

export default function AdminConfig() {
  const { data: config, isLoading } = useGetConfig();
  const updateConfigMutation = useUpdateConfig();

  const [whatsappCC, setWhatsappCC] = useState("91");
  const [whatsappLocal, setWhatsappLocal] = useState("");

  const { control, handleSubmit, reset, setValue } = useForm<StoreConfigInput>({
    defaultValues: {
      storeName: "", logoUrl: "", whatsappNumber: "", currencySymbol: "₹",
      deliveryCharge: 0, freeDeliveryAbove: 0, storeTimingOpen: "", storeTimingClose: "",
      storeTimingDays: "", instagramUrl: "", facebookUrl: "", aboutUs: "",
      contactPhone: "", contactEmail: "", contactAddress: "", mapEmbedUrl: "", adminPin: "",
    },
  });

  useEffect(() => {
    if (config) {
      const { cc, local } = parseWhatsApp(config.whatsappNumber || "");
      setWhatsappCC(cc);
      setWhatsappLocal(local);
      reset({
        storeName: config.storeName || "", logoUrl: config.logoUrl || "",
        whatsappNumber: config.whatsappNumber || "", currencySymbol: config.currencySymbol || "₹",
        deliveryCharge: config.deliveryCharge || 0, freeDeliveryAbove: config.freeDeliveryAbove || 0,
        storeTimingOpen: config.storeTimingOpen || "", storeTimingClose: config.storeTimingClose || "",
        storeTimingDays: config.storeTimingDays || "", instagramUrl: config.instagramUrl || "",
        facebookUrl: config.facebookUrl || "", aboutUs: config.aboutUs || "",
        contactPhone: config.contactPhone || "", contactEmail: config.contactEmail || "",
        contactAddress: config.contactAddress || "", mapEmbedUrl: config.mapEmbedUrl || "", adminPin: "",
      });
    }
  }, [config, reset]);

  const onSubmit = (data: StoreConfigInput) => {
    const payload: StoreConfigInput = {
      ...data,
      whatsappNumber: whatsappCC + whatsappLocal,
    };
    if (!payload.adminPin) delete payload.adminPin;
    updateConfigMutation.mutate(
      { data: payload },
      {
        onSuccess: () => toast({ title: "Settings saved successfully" }),
        onError: () => toast({ title: "Failed to save settings", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 860 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Store Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage your store details, contact info, and operational rules.</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* General */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>General Information</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Controller name="storeName" control={control} render={({ field }) => <TextField {...field} label="Store Name" fullWidth />} />
              <Controller name="logoUrl" control={control} render={({ field }) => (
                <Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>Store Logo</Typography>
                  <ImageUploader value={field.value} onChange={field.onChange} folder="store-logo" />
                </Box>
              )} />
              <Controller name="aboutUs" control={control} render={({ field }) => <TextField {...field} label="About Us" multiline rows={4} fullWidth />} />
            </Box>
          </CardContent>
        </Card>

        {/* Commerce */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Commerce & Delivery</Typography>
            <Grid container spacing={2}>
              {/* WhatsApp with country code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                  WhatsApp Number
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FormControl sx={{ minWidth: 110 }} size="small">
                    <Select
                      value={whatsappCC}
                      onChange={(e) => {
                        setWhatsappCC(e.target.value);
                        setValue("whatsappNumber", e.target.value + whatsappLocal);
                      }}
                      renderValue={(val) => {
                        const found = COUNTRY_CODES.find((c) => c.code === val);
                        return found ? `${found.flag} ${found.label}` : `+${val}`;
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                          {c.flag} {c.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    value={whatsappLocal}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "");
                      setWhatsappLocal(num);
                      setValue("whatsappNumber", whatsappCC + num);
                    }}
                    placeholder="9876543210"
                    size="small"
                    fullWidth
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                    helperText="Enter number without country code"
                  />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="currencySymbol" control={control} render={({ field }) => (
                  <TextField {...field} label="Currency Symbol" helperText="Symbol shown before prices (e.g. ₹, $, €)" inputProps={{ maxLength: 4 }} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="deliveryCharge" control={control} render={({ field }) => (
                  <TextField {...field} label="Default Delivery Charge" type="number" inputProps={{ step: "0.01", min: 0 }} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} fullWidth />
                )} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller name="freeDeliveryAbove" control={control} render={({ field }) => (
                  <TextField {...field} label="Free Delivery Threshold" type="number" inputProps={{ step: "0.01", min: 0 }} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} fullWidth />
                )} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>Contact & Location</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="contactEmail" control={control} render={({ field }) => <TextField {...field} label="Email Address" type="email" fullWidth />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller name="contactPhone" control={control} render={({ field }) => <TextField {...field} label="Phone Number" type="tel" fullWidth />} />
                </Grid>
              </Grid>
              <Controller name="contactAddress" control={control} render={({ field }) => <TextField {...field} label="Physical Address" multiline rows={2} fullWidth />} />
              <Controller name="mapEmbedUrl" control={control} render={({ field }) => (
                <TextField {...field} label="Google Maps Embed URL" helperText="Paste the src URL from Google Maps Embed iframe" fullWidth />
              )} />
            </Box>
          </CardContent>
        </Card>

        {/* Timings + Social */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Store Timings</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Controller name="storeTimingDays" control={control} render={({ field }) => <TextField {...field} label="Operating Days" placeholder="e.g. Monday - Saturday" fullWidth />} />
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Controller name="storeTimingOpen" control={control} render={({ field }) => <TextField {...field} label="Open Time" placeholder="09:00 AM" fullWidth />} />
                    </Grid>
                    <Grid size={6}>
                      <Controller name="storeTimingClose" control={control} render={({ field }) => <TextField {...field} label="Close Time" placeholder="08:00 PM" fullWidth />} />
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Social Media</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Controller name="instagramUrl" control={control} render={({ field }) => <TextField {...field} label="Instagram URL" fullWidth />} />
                  <Controller name="facebookUrl" control={control} render={({ field }) => <TextField {...field} label="Facebook URL" fullWidth />} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Security */}
        <Card variant="outlined" sx={{ borderColor: "error.main" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} color="error" gutterBottom>Security</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>Update the admin PIN required to access this dashboard.</Typography>
            <Controller name="adminPin" control={control} render={({ field }) => (
              <TextField {...field} type="password" label="New Admin PIN" placeholder="Leave blank to keep current PIN" sx={{ maxWidth: 340 }} />
            )} />
          </CardContent>
        </Card>

        <Divider />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" size="large" disabled={updateConfigMutation.isPending}
            startIcon={updateConfigMutation.isPending ? <CircularProgress size={18} color="inherit" /> : null}>
            {updateConfigMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
