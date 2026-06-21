import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, ShoppingCart, Heart, Clock, User, Settings, Package, Users, LayoutDashboard, Image as ImageIcon, Tags, LogOut, Search, X } from "lucide-react";
import { useGetConfig } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useStoreUser, useAdminToken } from "@/hooks/use-store-user";
import { ThemeToggle } from "./theme-toggle";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { data: config } = useGetConfig();
  const [, setLocation] = useLocation();
  const cartItems = useCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) {
      setLocation(`/?search=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  };

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      setSearchValue("");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-16 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 gap-3">
          {/* Logo — hide when search is open on mobile */}
          <Link href="/" className={`flex items-center gap-2 shrink-0 ${searchOpen ? "hidden sm:flex" : "flex"}`}>
            {config?.logoUrl ? (
              <img src={config.logoUrl} alt={config?.storeName || "Store Logo"} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-bold text-xl tracking-tight">{config?.storeName || "MyStore"}</span>
            )}
          </Link>

          {/* Search bar — expands inline */}
          <form
            onSubmit={handleSearch}
            className={`flex-1 transition-all duration-200 ${searchOpen ? "flex" : "hidden sm:flex"}`}
          >
            <div className="relative w-full max-w-md mx-auto sm:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKey}
                className="w-full h-9 pl-9 pr-4 rounded-full bg-muted border border-transparent focus:border-primary focus:bg-background text-sm outline-none transition-all"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {/* Search toggle (mobile only) */}
            <button
              onClick={() => { setSearchOpen(v => !v); setSearchValue(""); }}
              className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            <ThemeToggle />

            <Link href="/cart" className="relative hidden md:flex items-center justify-center w-9 h-9 rounded-full hover:bg-accent transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden pb-safe">
        <div className="flex justify-around items-center h-16">
          <BottomNavLink href="/" icon={Home} label="Home" />
          <BottomNavLink href="/wishlist" icon={Heart} label="Wishlist" />
          <div className="relative">
            <BottomNavLink href="/cart" icon={ShoppingCart} label="Cart" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground pointer-events-none">
                {cartCount}
              </span>
            )}
          </div>
          <BottomNavLink href="/orders" icon={Clock} label="Orders" />
          <BottomNavLink href="/about" icon={User} label="About" />
        </div>
      </nav>
    </div>
  );
}

function BottomNavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const [location] = useLocation();
  const isActive = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link href={href} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { clearToken } = useAdminToken();

  const handleLogout = () => {
    clearToken();
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: Package, label: "Orders" },
    { href: "/admin/products", icon: Tags, label: "Products" },
    { href: "/admin/categories", icon: Settings, label: "Categories" },
    { href: "/admin/banners", icon: ImageIcon, label: "Banners" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/reviews", icon: Settings, label: "Reviews" },
    { href: "/admin/config", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row bg-muted/40">
      {/* Admin Sidebar (Desktop) */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/admin/dashboard" className="font-bold text-lg">Admin Panel</Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Admin Mobile Top Nav */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
        <span className="font-bold">Admin</span>
        <button onClick={handleLogout} className="text-sm font-medium text-destructive">Logout</button>
      </header>

      {/* Admin Mobile Tabs (Scrollable) */}
      <nav className="md:hidden border-b bg-background overflow-x-auto whitespace-nowrap">
        <div className="flex p-2 gap-2">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Admin Content */}
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
