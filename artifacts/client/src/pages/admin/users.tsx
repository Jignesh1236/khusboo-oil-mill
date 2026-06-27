import { useState } from "react";
import { useListUsers, useDeleteUser } from "@/lib/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Typography, Chip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { toast } from "@/hooks/use-toast";

export default function AdminUsers() {
  const { data: users, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = () => {
    if (!deleteId) return;
    deleteUser.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "User deleted" });
          queryClient.invalidateQueries({ queryKey: ["listUsers"] });
          setDeleteId(null);
        },
        onError: () => {
          toast({ title: "Failed to delete user", variant: "destructive" });
          setDeleteId(null);
        },
      }
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700}>Users</Typography>
        <Chip label={`${users?.length || 0} Total`} variant="outlined" />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
          <Table sx={{ minWidth: 640 }}>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell width={52} />
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell fontWeight={500}>{user.name}</TableCell>
                  <TableCell>{user.phone || "—"}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>{user.source || "Unknown"}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    {user.address ? (
                      typeof user.address === "string" ? (
                        <Typography variant="body2" noWrap title={user.address}>{user.address}</Typography>
                      ) : (
                        <Box>
                          <Typography variant="caption" display="block">{(user.address as any).fullName}</Typography>
                          <Typography variant="caption" display="block" color="text.secondary" noWrap>
                            {(user.address as any).houseFlatBuilding}, {(user.address as any).streetArea}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {(user.address as any).city}, {(user.address as any).state} — {(user.address as any).pincode}
                          </Typography>
                        </Box>
                      )
                    ) : "—"}
                  </TableCell>
                  <TableCell><Typography variant="caption" fontFamily="monospace">{user.ip}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{new Date(user.createdAt).toLocaleDateString()}</Typography></TableCell>
                  <TableCell>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(user._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!users?.length && (
                <TableRow><TableCell colSpan={7} sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Delete User?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete the user. They will be asked to onboard again on their next visit.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteUser.isPending}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
