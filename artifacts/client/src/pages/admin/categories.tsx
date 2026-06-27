import { useState } from "react";
import {
  useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory,
  getListCategoriesQueryKey,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography,
  Switch, FormControlLabel, CircularProgress, Chip,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", order: 0, active: true });

  const reset = () => { setForm({ name: "", order: 0, active: true }); setEditingId(null); };

  const handleEdit = (cat: any) => {
    setForm({ name: cat.name, order: cat.order || 0, active: cat.active });
    setEditingId(cat._id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this category?")) return;
    deleteMutation.mutate({ categoryId: id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); toast({ title: "Category deleted" }); } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opts = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() }); setIsOpen(false); reset(); toast({ title: editingId ? "Category updated" : "Category created" }); } };
    if (editingId) updateMutation.mutate({ categoryId: editingId, data: form }, opts);
    else createMutation.mutate({ data: form }, opts);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700}>Categories</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { reset(); setIsOpen(true); }}>Add Category</Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell>Order</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories?.map((cat) => (
                <TableRow key={cat._id} hover>
                  <TableCell>{cat.order}</TableCell>
                  <TableCell fontWeight={500}>{cat.name}</TableCell>
                  <TableCell><Chip label={cat.active ? "Active" : "Inactive"} size="small" color={cat.active ? "success" : "default"} variant="outlined" /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(cat)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(cat._id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!categories?.length && (
                <TableRow><TableCell colSpan={4} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No categories found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={isOpen} onClose={() => { setIsOpen(false); reset(); }} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? "Edit" : "Add"} Category</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required fullWidth />
            <TextField label="Order (for sorting)" type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} fullWidth />
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />} label="Active" />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => { setIsOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>Save Category</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
