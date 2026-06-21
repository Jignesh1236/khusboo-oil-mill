import { useState } from "react";
import { 
  useListBanners, 
  useCreateBanner, 
  useUpdateBanner, 
  useDeleteBanner,
  getListBannersQueryKey
} from "./lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { toast } from "@/hooks/use-toast";

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const { data: banners, isLoading } = useListBanners();
  
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", link: "", order: 0, active: true });

  const resetForm = () => {
    setFormData({ title: "", imageUrl: "", link: "", order: 0, active: true });
    setEditingId(null);
  };

  const handleEdit = (banner: any) => {
    setFormData({ 
      title: banner.title, 
      imageUrl: banner.imageUrl || "", 
      link: banner.link || "", 
      order: banner.order || 0, 
      active: banner.active 
    });
    setEditingId(banner._id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate(
        { bannerId: id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
            toast({ title: "Banner deleted" });
          }
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(
        { bannerId: editingId, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
            setIsDialogOpen(false);
            resetForm();
            toast({ title: "Banner updated" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
            setIsDialogOpen(false);
            resetForm();
            toast({ title: "Banner created" });
          }
        }
      );
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Banner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <ImageUploader value={formData.imageUrl} onChange={url => setFormData(p => ({...p, imageUrl: url}))} folder="banners" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link URL (optional)</label>
                <Input value={formData.link} onChange={e => setFormData(p => ({...p, link: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Input type="number" value={formData.order} onChange={e => setFormData(p => ({...p, order: parseInt(e.target.value)}))} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.active} onCheckedChange={c => setFormData(p => ({...p, active: c}))} />
                <label className="text-sm font-medium">Active</label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                Save Banner
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners?.map((banner) => (
              <TableRow key={banner._id}>
                <TableCell>
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl.replace('/upload/', '/upload/w_150,h_50,c_fill,q_auto/')} alt="Banner" className="h-8 object-cover rounded" />
                  ) : <span className="text-muted-foreground">No image</span>}
                </TableCell>
                <TableCell className="font-medium">{banner.title}</TableCell>
                <TableCell>{banner.order}</TableCell>
                <TableCell>{banner.active ? "Active" : "Inactive"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(banner._id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {(!banners || banners.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No banners found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
