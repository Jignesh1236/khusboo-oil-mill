import { useState } from "react";
import {
  useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner,
  getListBannersQueryKey,
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Typography,
  Switch, FormControlLabel, CircularProgress, Chip,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "@/hooks/use-toast";

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const { data: banners, isLoading } = useListBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", imageUrl: "", link: "", order: 0, active: true });

  const reset = () => { setForm({ title: "", imageUrl: "", link: "", order: 0, active: true }); setEditingId(null); };

  const handleEdit = (b: any) => {
    setForm({ title: b.title, imageUrl: b.imageUrl || "", link: b.link || "", order: b.order || 0, active: b.active });
    setEditingId(b._id);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this banner?")) return;
    deleteMutation.mutate({ bannerId: id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() }); toast({ title: "Banner deleted" }); } });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const opts = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() }); setIsOpen(false); reset(); toast({ title: editingId ? "Banner updated" : "Banner created" }); } };
    if (editingId) updateMutation.mutate({ bannerId: editingId, data: form }, opts);
    else createMutation.mutate({ data: form }, opts);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700}>Banners</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { reset(); setIsOpen(true); }}>Add Banner</Button>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Order</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners?.map((b) => (
                <TableRow key={b._id} hover>
                  <TableCell>
                    {b.imageUrl ? (
                      <Box component="img" src={b.imageUrl.replace("/upload/", "/upload/w_120,h_40,c_fill,q_auto/")} alt="" sx={{ height: 32, borderRadius: 1, objectFit: "cover" }} />
                    ) : <Typography variant="caption" color="text.disabled">No image</Typography>}
                  </TableCell>
                  <TableCell fontWeight={500}>{b.title}</TableCell>
                  <TableCell>{b.order}</TableCell>
                  <TableCell><Chip label={b.active ? "Active" : "Inactive"} size="small" color={b.active ? "success" : "default"} variant="outlined" /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(b)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(b._id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!banners?.length && (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No banners found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={isOpen} onClose={() => { setIsOpen(false); reset(); }} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{editingId ? "Edit" : "Add"} Banner</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required fullWidth />
            <Box>
              <Typography variant="body2" fontWeight={500} gutterBottom>Image</Typography>
              <ImageUploader value={form.imageUrl} onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))} folder="banners" />
            </Box>
            <TextField label="Link URL (optional)" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} fullWidth />
            <TextField label="Order" type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} fullWidth />
            <FormControlLabel control={<Switch checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />} label="Active" />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button variant="outlined" onClick={() => { setIsOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>Save Banner</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
