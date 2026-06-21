import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreLayout, AdminLayout } from "@/components/layout";
import { IPGuard, AdminGuard } from "@/components/guards";
import { setAuthTokenGetter, setBaseUrl } from "@/lib/api-client-react";

// Set base URL to Render backend
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

// Register JWT token getter — runs before every API request
setAuthTokenGetter(() => localStorage.getItem("adminToken"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
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

      {/* Store Routes */}
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
