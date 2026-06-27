import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  InputBase,
  Badge,
  Divider,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Home,
  ShoppingCart,
  Favorite,
  AccessTime,
  Person,
  Settings,
  Inventory2,
  Group,
  Dashboard,
  Image as ImageIcon,
  LocalOffer,
  Logout,
  Search,
  Close,
  RateReview,
} from "@mui/icons-material";
import { useGetConfig } from "@/lib/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useAdminToken } from "@/hooks/use-store-user";
import { ThemeToggle } from "./theme-toggle";

const DRAWER_WIDTH = 240;

const STORE_NAV = [
  { href: "/", label: "Home", icon: <Home /> },
  { href: "/wishlist", label: "Wishlist", icon: <Favorite /> },
  { href: "/cart", label: "Cart", icon: <ShoppingCart /> },
  { href: "/orders", label: "Orders", icon: <AccessTime /> },
  { href: "/about", label: "About", icon: <Person /> },
];

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { data: config } = useGetConfig();
  const [location, setLocation] = useLocation();
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

  const isNavActive = (href: string) => {
    if (href === "/") return location === "/" || location.startsWith("/?");
    return location.startsWith(href);
  };

  const getBottomNavValue = () => {
    if (location === "/" || location.startsWith("/?")) return 0;
    if (location.startsWith("/wishlist")) return 1;
    if (location.startsWith("/cart")) return 2;
    if (location.startsWith("/orders")) return 3;
    if (location.startsWith("/about")) return 4;
    return false;
  };

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", pb: { xs: "64px", md: 0 } }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(8px)",
          color: "text.primary",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 64 } }}>
          {/* Logo — hidden when search is open on mobile */}
          {!searchOpen && (
            <Link href="/" style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}>
              {config?.logoUrl ? (
                <Box
                  component="img"
                  src={config.logoUrl}
                  alt={config?.storeName || "Store"}
                  sx={{ height: 36, width: "auto", objectFit: "contain" }}
                />
              ) : (
                <Typography variant="h6" fontWeight={700} noWrap>
                  {config?.storeName || "MyStore"}
                </Typography>
              )}
            </Link>
          )}

          {/* Desktop nav links — shown md+ */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
              ml: 2,
              flexShrink: 0,
            }}
          >
            {STORE_NAV.map((item) => {
              const active = isNavActive(item.href);
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  size="small"
                  startIcon={
                    item.href === "/cart" ? (
                      <Badge badgeContent={cartCount} color="primary" max={99}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )
                  }
                  sx={{
                    textTransform: "none",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.875rem",
                    color: active ? "primary.main" : "text.secondary",
                    borderBottom: active ? "2px solid" : "2px solid transparent",
                    borderColor: active ? "primary.main" : "transparent",
                    borderRadius: 0,
                    px: 1.5,
                    py: 1,
                    "&:hover": {
                      bgcolor: "transparent",
                      color: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Search bar — always visible on sm+, toggleable on xs */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flex: 1,
              display: { xs: searchOpen ? "flex" : "none", sm: "flex" },
              mx: { xs: 0, sm: 2 },
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: alpha(theme.palette.text.primary, 0.06),
                borderRadius: 99,
                px: 2,
                py: 0.5,
                width: "100%",
                maxWidth: 360,
                border: "1px solid transparent",
                "&:focus-within": {
                  border: `1px solid ${theme.palette.primary.main}`,
                  bgcolor: "background.paper",
                },
                transition: "all 0.2s",
              }}
            >
              <Search sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
              <InputBase
                inputRef={searchInputRef}
                placeholder="Search products..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchOpen(false);
                    setSearchValue("");
                  }
                }}
                sx={{ flex: 1, fontSize: "0.875rem" }}
              />
              {searchValue && (
                <IconButton size="small" onClick={() => setSearchValue("")} sx={{ p: 0 }}>
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Right-side icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto", flexShrink: 0 }}>
            {/* Mobile search toggle */}
            <IconButton
              size="small"
              sx={{ display: { xs: "flex", sm: "none" } }}
              onClick={() => {
                setSearchOpen((v) => !v);
                setSearchValue("");
              }}
            >
              {searchOpen ? <Close fontSize="small" /> : <Search fontSize="small" />}
            </IconButton>
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3, lg: 4 }, py: { xs: 2, md: 3 } }}>
        {children}
      </Box>

      {/* Mobile bottom navigation */}
      <Paper
        elevation={3}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
        }}
      >
        <BottomNavigation value={getBottomNavValue()} sx={{ height: 64 }}>
          <BottomNavigationAction
            component={Link}
            href="/"
            label="Home"
            icon={<Home />}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            component={Link}
            href="/wishlist"
            label="Wishlist"
            icon={<Favorite />}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            component={Link}
            href="/cart"
            label="Cart"
            icon={
              <Badge badgeContent={cartCount} color="primary" max={99}>
                <ShoppingCart />
              </Badge>
            }
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            component={Link}
            href="/orders"
            label="Orders"
            icon={<AccessTime />}
            sx={{ minWidth: 0 }}
          />
          <BottomNavigationAction
            component={Link}
            href="/about"
            label="About"
            icon={<Person />}
            sx={{ minWidth: 0 }}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [location, setLocation] = useLocation();
  const { clearToken } = useAdminToken();

  const handleLogout = () => {
    clearToken();
    setLocation("/admin/login");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: <Dashboard />, label: "Dashboard" },
    { href: "/admin/orders", icon: <Inventory2 />, label: "Orders" },
    { href: "/admin/products", icon: <LocalOffer />, label: "Products" },
    { href: "/admin/categories", icon: <Settings />, label: "Categories" },
    { href: "/admin/banners", icon: <ImageIcon />, label: "Banners" },
    { href: "/admin/users", icon: <Group />, label: "Users" },
    { href: "/admin/reviews", icon: <RateReview />, label: "Reviews" },
    { href: "/admin/config", icon: <Settings />, label: "Settings" },
  ];

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          Admin Panel
        </Typography>
      </Box>
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map((item) => {
          const isActive =
            location === item.href || location.startsWith(`${item.href}/`);
          return (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isActive ? "primary.contrastText" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, color: "error.main", "&:hover": { bgcolor: "error.light", color: "error.contrastText" } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      {/* Desktop permanent sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile top AppBar with scrollable nav chips */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            display: { xs: "flex", md: "none" },
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography fontWeight={700} color="primary" sx={{ flexShrink: 0 }}>
              Admin
            </Typography>
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", flex: 1, mx: 2 }}>
              {navItems.map((item) => {
                const isActive =
                  location === item.href || location.startsWith(`${item.href}/`);
                return (
                  <Box
                    key={item.href}
                    component={Link}
                    href={item.href}
                    sx={{
                      flexShrink: 0,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 99,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      bgcolor: isActive ? "primary.main" : "action.hover",
                      color: isActive ? "primary.contrastText" : "text.secondary",
                      transition: "all 0.15s",
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>
            <IconButton onClick={handleLogout} color="error" size="small">
              <Logout fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3, lg: 4 },
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
