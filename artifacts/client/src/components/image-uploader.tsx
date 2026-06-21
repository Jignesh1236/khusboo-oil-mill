import { useState } from "react";
import { useUploadImage } from "./lib/api-client-react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, folder = "store" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const uploadMutation = useUploadImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setPreview(base64Data); // temporary preview

      uploadMutation.mutate(
        { data: { imageData: base64Data, folder } },
        {
          onSuccess: (res) => {
            if (res.url) {
              setPreview(res.url);
              onChange(res.url);
              toast({ title: "Success", description: "Image uploaded successfully" });
            }
          },
          onError: () => {
            setPreview(value || null); // revert on error
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
          }
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {preview ? (
          <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-muted">
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute top-1 right-1 bg-background/80 p-1 rounded-full text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => { setPreview(null); onChange(""); }}
            >
              <X className="h-3 w-3" />
            </button>
            {uploadMutation.isPending && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="h-24 w-24 rounded-lg border border-dashed flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
            {uploadMutation.isPending ? (
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
            ) : (
              <ImageIcon className="h-6 w-6 mb-2" />
            )}
            <span className="text-xs">No image</span>
          </div>
        )}
        
        <div>
          <Button type="button" variant="outline" className="relative overflow-hidden cursor-pointer" disabled={uploadMutation.isPending}>
            <span className="flex items-center gap-2">
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {preview ? "Change Image" : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Max file size: 5MB</p>
        </div>
      </div>
    </div>
  );
}
