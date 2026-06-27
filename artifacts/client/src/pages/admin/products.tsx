import { useState } from "react";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, getListProductsQueryKey, type ProductInput,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography,
  Switch, FormControlLabel, MenuItem, Select, InputLabel, FormControl,
  CircularProgress, Stack, Chip, Grid, Paper,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data: productsPage, isLoading } = useListProducts({ page, limit: 20 });
  const { data: categories } = useListCategories();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultForm: ProductInput = { name: "", price: 0, discountPercent: 0, category: "", stock: 0, images: [], deliveryTime: "", freeDelivery: false, description: "", featured: false };
  const [form, setForm] = useState<ProductInput>(defaultForm);

  const resetForm = () => { setForm(defaultForm); setEditingId(null); };

  const handleEdit = (p: any) => {
    setForm({ name: p.name, price: p.price, discountPercent: p.discountPercent || 0, category: p.category, stock: p.stock, images: p.images || [], deliveryTime: p.deliveryTime || "", freeDelivery: p.freeDelivery || false, description: p.description || "", featured: p.featured || false });
    setEditingId(p._id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product?")) return;
    deleteMutation.mutate({ productId: id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); toast({ title: "Product deleted" }); } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast({ title: "Error", description: "Please select a category", variant: "destructive" }); return; }
    const opts = {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setIsOpen(false); resetForm(); toast({ title: editingId ? "Product updated" : "Product created" }); }
    };
    if (editingId) updateMutation.mutate({ productId: editingId, data: form }, opts);
    else createMutation.mutate({ data: form }, opts);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700}>Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setIsOpen(true); }}>Add Product</Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <>
          {/* Desktop table */}
          <Box sx={{ display: { xs: "none", md: "block" }, border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsPage?.products.map((p) => (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box component="img" src={p.images?.[0]?.replace("/upload/", "/upload/w_80,h_80,c_fill,q_auto/") || "https://via.placeholder.com/40"} alt="" sx={{ width: 40, height: 40, borderRadius: 1.5, objectFit: "cover", bgcolor: "action.hover" }} />
                        <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="body2">{p.category}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>₹{p.price.toFixed(2)}</Typography>
                      {p.discountPercent ? <Chip label={`${p.discountPercent}% off`} size="small" color="error" sx={{ ml: 0.5, fontSize: "0.65rem", height: 18 }} /> : null}
                    </TableCell>
                    <TableCell><Chip label={p.stock} size="small" color={p.stock > 5 ? "success" : p.stock > 0 ? "warning" : "error"} variant="outlined" /></TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(p)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!productsPage?.products?.length && (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No products found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          {/* Mobile cards */}
          <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
            {productsPage?.products.map((p) => (
              <Paper key={p._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box component="img" src={p.images?.[0]?.replace("/upload/", "/upload/w_120,h_120,c_fill,q_auto/") || "https://via.placeholder.com/80"} alt="" sx={{ width: 72, height: 72, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.category}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" fontWeight={700}>₹{p.price.toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">Stock: {p.stock}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEdit(p)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p._id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
            {!productsPage?.products?.length && (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 6 }}>No products found.</Typography>
            )}
          </Stack>

          {productsPage && productsPage.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
              <Button variant="outlined" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Typography variant="body2">Page {page} of {productsPage.pages}</Typography>
              <Button variant="outlined" disabled={page === productsPage.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Box>
          )}
        </>
      )}

      <Dialog open={isOpen} onClose={() => { setIsOpen(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? "Edit" : "Add"} Product</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                    {categories?.map((c) => <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Price (₹)" type="number" inputProps={{ step: "0.01", min: 0 }} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} required fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Discount %" type="number" inputProps={{ min: 0, max: 100 }} value={form.discountPercent} onChange={(e) => setForm((p) => ({ ...p, discountPercent: parseInt(e.target.value) || 0 }))} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Stock" type="number" inputProps={{ min: 0 }} value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: parseInt(e.target.value) || 0 }))} required fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Delivery Time (e.g. 2-3 days)" value={form.deliveryTime} onChange={(e) => setForm((p) => ({ ...p, deliveryTime: e.target.value }))} fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Description" multiline rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} fullWidth />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" fontWeight={500} gutterBottom>Main Image</Typography>
                <ImageUploader value={form.images?.[0] || ""} onChange={(url) => setForm((p) => ({ ...p, images: [url] }))} folder="products" />
              </Grid>
              <Grid size={12}>
                <Stack direction="row" spacing={3}>
                  <FormControlLabel control={<Switch checked={form.freeDelivery} onChange={(e) => setForm((p) => ({ ...p, freeDelivery: e.target.checked }))} />} label="Free Delivery" />
                  <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />} label="Featured" />
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>{isPending ? "Saving..." : "Save Product"}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
