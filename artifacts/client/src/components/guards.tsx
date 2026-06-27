import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStoreUser } from "@/hooks/use-store-user";
import { useCheckUserIp } from "@/lib/api-client-react";
import { Box, CircularProgress, Typography } from "@mui/material";

export function IPGuard({ children }: { children: React.ReactNode }) {
  const { user, saveUser } = useStoreUser();
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  const checkIpMutation = useCheckUserIp();

  useEffect(() => {
    async function checkIp() {
      if (user) {
        setChecking(false);
        return;
      }
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        checkIpMutation.mutate(
          { data: { ip: data.ip } },
          {
            onSuccess: (res) => {
              if (res.exists && res.user) {
                saveUser({
                  _id: res.user._id,
                  name: res.user.name,
                  ip: res.user.ip,
                  address: res.user.address,
                  phone: res.user.phone,
                });
                setChecking(false);
              } else {
                setLocation("/onboarding");
              }
            },
            onError: () => {
              setLocation("/onboarding");
            },
          }
        );
      } catch {
        setLocation("/onboarding");
      }
    }
    checkIp();
  }, [user]);

  if (checking) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography color="text.secondary" variant="body2">
          Loading store...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return <>{children}</>;
}
