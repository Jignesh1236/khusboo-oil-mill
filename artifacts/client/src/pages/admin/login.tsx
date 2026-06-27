import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@/lib/api-client-react";
import { useAdminToken } from "@/hooks/use-store-user";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { AdminPanelSettings } from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { saveToken } = useAdminToken();
  const [pin, setPin] = useState("");
  const loginMutation = useAdminLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { data: { pin } },
      {
        onSuccess: (res) => {
          if (res.success && res.token) {
            saveToken(res.token);
            setLocation("/admin/dashboard");
          } else {
            toast({ title: "Login failed", description: "Invalid PIN", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Login failed", description: "Invalid PIN", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 360 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <AdminPanelSettings sx={{ color: "#fff", fontSize: 28 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Admin Login</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
              Enter your PIN to access the admin dashboard.
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField type="password" label="Admin PIN" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} required fullWidth autoFocus />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Verifying..." : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
