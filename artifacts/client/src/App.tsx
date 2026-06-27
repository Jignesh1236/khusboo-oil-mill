import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreLayout, AdminLayout } from "@/components/layout";
import { IPGuard, AdminGuard } from "@/components/guards";
import { setAuthTokenGetter, setBaseUrl } from "@/lib/api-client-react";
import { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { _subscribeToast } from "@/hooks/use-toast";

setBaseUrl("https://e-commerce-7ktz.onrender.com");

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductDetail from "@/pages/product";
import Cart from "@/pages/cart";
import Wishlist from "@/pages/wishlist";
import Orders from "@/pages/orders";
import OrderSuccess from "@/pages/order-success";
import About from "@/pages/about";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import Onboarding from "@/pages/onboarding";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminBanners from "@/pages/admin/banners";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminConfig from "@/pages/admin/config";
import AdminReviews from "@/pages/admin/reviews";

setAuthTokenGetter(() => localStorage.getItem("adminToken"));

const queryClient = new QueryClient();

type ToastState = {
  open: boolean;
  title?: string;
  description?: string;
  severity: "success" | "error" | "info";
};

function GlobalSnackbar() {
  const [state, setState] = useState<ToastState>({
    open: false,
    severity: "success",
  });

  useEffect(() => {
    return _subscribeToast((msg) => {
      setState({
        open: true,
        title: msg.title,
        description: msg.description,
        severity: msg.variant === "destructive" ? "error" : "success",
      });
    });
  }, []);

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={3500}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={() => setState((s) => ({ ...s, open: false }))}
        severity={state.severity}
        variant="filled"
        sx={{ minWidth: 240 }}
      >
        {state.title && <strong>{state.title}</strong>}
        {state.description && <div style={{ fontSize: "0.85em" }}>{state.description}</div>}
      </Alert>
    </Snackbar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/*">
        <AdminGuard>
          <AdminLayout>
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/products" component={AdminProducts} />
              <Route path="/admin/categories" component={AdminCategories} />
              <Route path="/admin/banners" component={AdminBanners} />
              <Route path="/admin/orders" component={AdminOrders} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/reviews" component={AdminReviews} />
              <Route path="/admin/config" component={AdminConfig} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        </AdminGuard>
      </Route>

      <Route path="/onboarding" component={Onboarding} />
      <Route path="*">
        <IPGuard>
          <StoreLayout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/product/:id" component={ProductDetail} />
              <Route path="/cart" component={Cart} />
              <Route path="/wishlist" component={Wishlist} />
              <Route path="/orders" component={Orders} />
              <Route path="/order-success" component={OrderSuccess} />
              <Route path="/about" component={About} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/terms-of-service" component={TermsOfService} />
              <Route component={NotFound} />
            </Switch>
          </StoreLayout>
        </IPGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <GlobalSnackbar />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
