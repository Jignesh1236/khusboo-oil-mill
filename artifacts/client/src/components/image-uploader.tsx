import { useState } from "react";
import { useUploadImage } from "@/lib/api-client-react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { CloudUpload, Close, Image as ImageIcon } from "@mui/icons-material";
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
      setPreview(base64Data);

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
            setPreview(value || null);
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
          },
        }
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
        }}
      >
        {preview ? (
          <>
            <Box
              component="img"
              src={preview}
              alt="Preview"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => {
                setPreview(null);
                onChange("");
              }}
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                p: 0.25,
                "&:hover": { bgcolor: "error.main" },
              }}
            >
              <Close sx={{ fontSize: 12 }} />
            </IconButton>
            {uploadMutation.isPending && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            {uploadMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              <ImageIcon sx={{ color: "text.disabled", mb: 0.5 }} />
            )}
            <Typography variant="caption" color="text.disabled" display="block">
              No image
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Button
          component="label"
          variant="outlined"
          startIcon={
            uploadMutation.isPending ? (
              <CircularProgress size={16} />
            ) : (
              <CloudUpload />
            )
          }
          disabled={uploadMutation.isPending}
          size="small"
        >
          {preview ? "Change Image" : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
          />
        </Button>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Max file size: 5MB
        </Typography>
      </Box>
    </Box>
  );
}
