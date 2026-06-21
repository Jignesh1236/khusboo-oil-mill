import { useState } from "react";
import { 
  useListProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useListCategories,
  getListProductsQueryKey,
  type ProductInput
} from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultForm: ProductInput = { 
    name: "", 
    price: 0, 
    discountPercent: 0, 
    category: "", 
    stock: 0, 
    images: [], 
    deliveryTime: "", 
    freeDelivery: false, 
    description: "", 
    featured: false 
  };
  
  const [formData, setFormData] = useState<ProductInput>(defaultForm);

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (p: any) => {
    setFormData({ 
      name: p.name, 
      price: p.price, 
      discountPercent: p.discountPercent || 0, 
      category: p.category, 
      stock: p.stock, 
      images: p.images || [], 
      deliveryTime: p.deliveryTime || "", 
      freeDelivery: p.freeDelivery || false, 
      description: p.description || "", 
      featured: p.featured || false 
    });
    setEditingId(p._id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(
        { productId: id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({ title: "Product deleted" });
          }
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast({ title: "Error", description: "Please select a category", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateMutation.mutate(
        { productId: editingId, data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
            resetForm();
            toast({ title: "Product updated" });
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: formData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
            resetForm();
            toast({ title: "Product created" });
          }
        }
      );
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input type="number" step="0.01" value={formData.price} onChange={e => setFormData(p => ({...p, price: parseFloat(e.target.value)}))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Percent</label>
                  <Input type="number" value={formData.discountPercent} onChange={e => setFormData(p => ({...p, discountPercent: parseInt(e.target.value)}))} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input type="number" value={formData.stock} onChange={e => setFormData(p => ({...p, stock: parseInt(e.target.value)}))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Time (e.g. "2-3 days")</label>
                  <Input value={formData.deliveryTime} onChange={e => setFormData(p => ({...p, deliveryTime: e.target.value}))} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea rows={4} value={formData.description} onChange={e => setFormData(p => ({...p, description: e.target.value}))} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Main Image</label>
                <ImageUploader 
                  value={formData.images?.[0] || ""} 
                  onChange={url => setFormData(p => ({...p, images: [url]}))} 
                  folder="products" 
                />
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.freeDelivery} onCheckedChange={c => setFormData(p => ({...p, freeDelivery: c}))} />
                  <label className="text-sm font-medium">Free Delivery</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.featured} onCheckedChange={c => setFormData(p => ({...p, featured: c}))} />
                  <label className="text-sm font-medium">Featured Product</label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                Save Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table View */}
      <div className="border rounded-xl overflow-hidden bg-card hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsPage?.products.map((p) => (
              <TableRow key={p._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]?.replace('/upload/', '/upload/w_100,h_100,c_fill,q_auto/') || "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded bg-muted object-cover" />
                    <span className="font-medium line-clamp-1">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>₹{p.price.toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p._id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {(!productsPage?.products || productsPage.products.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No products found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {productsPage?.products.map((p) => (
          <div key={p._id} className="border rounded-xl p-4 bg-card">
            <div className="flex items-start gap-3">
              <img 
                src={p.images?.[0]?.replace('/upload/', '/upload/w_100,h_100,c_fill,q_auto/') || "https://via.placeholder.com/80"} 
                alt="" 
                className="w-20 h-20 rounded bg-muted object-cover shrink-0" 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.category}</p>
                <p className="font-semibold text-lg mt-1">₹{p.price.toFixed(2)}</p>
                <p className="text-sm">Stock: {p.stock}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(p._id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
            </div>
          </div>
        ))}
        {(!productsPage?.products || productsPage.products.length === 0) && (
          <div className="text-center py-10 text-muted-foreground border rounded-xl bg-card">No products found.</div>
        )}
      </div>
      
      {/* Basic pagination */}
      {productsPage && productsPage.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <div className="flex items-center px-4">Page {page} of {productsPage.pages}</div>
          <Button variant="outline" disabled={page === productsPage.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
