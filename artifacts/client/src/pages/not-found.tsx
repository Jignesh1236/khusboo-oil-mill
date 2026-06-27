import { Box, Paper, Typography } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%", textAlign: "center" }}>
        <ErrorOutline sx={{ fontSize: 56, color: "error.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          404 — Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The page you're looking for doesn't exist.
        </Typography>
      </Paper>
    </Box>
  );
}
