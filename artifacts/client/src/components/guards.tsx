import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useStoreUser } from "@/hooks/use-store-user";
import { useCheckUserIp } from "@/lib/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

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
                  phone: res.user.phone
                });
                setChecking(false);
              } else {
                setLocation("/onboarding");
              }
            },
            onError: () => {
              // fallback to onboarding
              setLocation("/onboarding");
            }
          }
        );
      } catch (error) {
        console.error("IP Check Failed", error);
        setLocation("/onboarding");
      }
    }
    
    checkIp();
  }, [user]);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLocation("/admin/login");
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return <div className="p-8">Checking admin auth...</div>;
  }

  return <>{children}</>;
}
