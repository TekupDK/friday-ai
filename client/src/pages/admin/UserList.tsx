/**
 * User List Page
 *
 * Admin-only page for managing team members
 * Displays all users with search, filtering, and CRUD operations
 */

import { Pencil, Plus, Search, Trash2, UserPlus, Users } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

import {
  AppleButton,
  AppleCard,
  AppleModal,
  AppleSearchField,
} from "@/components/crm/apple-ui";
import { ErrorDisplay } from "@/components/crm/ErrorDisplay";
import { LoadingSpinner } from "@/components/crm/LoadingSpinner";
import { PanelErrorBoundary } from "@/components/PanelErrorBoundary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePageTitle } from "@/hooks/usePageTitle";
import { trpc } from "@/lib/trpc";

type UserRole = "user" | "admin" | "owner";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: UserRole;
  loginMethod: string | null;
  createdAt: string;
  lastSignedIn: string;
  openId: string;
}

/**
 * Role Badge Component
 */
function RoleBadge({ role }: { role: UserRole }) {
  const variants: Record<UserRole, "default" | "secondary" | "destructive"> = {
    owner: "destructive",
    admin: "secondary",
    user: "default",
  };

  return (
    <Badge variant={variants[role]}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}

/**
 * Create User Modal Component
 */
function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin",
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.admin.users.create.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("User created successfully");
      setFormData({ name: "", email: "", role: "user" });
      onClose();
      onSuccess();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    await createMutation.mutateAsync({
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });
  };

  if (!isOpen) return null;

  return (
    <AppleModal isOpen={isOpen} onClose={onClose} title="Create New User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="create-name">Name</Label>
          <Input
            id="create-name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <Label htmlFor="create-email">Email</Label>
          <Input
            id="create-email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="create-role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "user" | "admin") =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger id="create-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </div>
      </form>
    </AppleModal>
  );
}

/**
 * Edit User Modal Component
 */
function EditUserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: (user?.role || "user") as "user" | "admin",
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: (user.role === "owner" ? "admin" : user.role) as "user" | "admin",
      });
    }
  }, [user]);

  const utils = trpc.useUtils();
  const updateMutation = trpc.admin.users.update.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("User updated successfully");
      onClose();
      onSuccess();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteMutation = trpc.admin.users.delete.useMutation({
    onSuccess: () => {
      utils.admin.users.list.invalidate();
      toast.success("User deleted successfully");
      onClose();
      onSuccess();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    await updateMutation.mutateAsync({
      userId: user.id,
      name: formData.name,
      email: formData.email,
      role: formData.role,
    });
  };

  const handleDelete = async () => {
    if (!user) return;
    if (
      !confirm(
        `Are you sure you want to delete ${user.name || user.email}? This cannot be undone.`
      )
    ) {
      return;
    }

    await deleteMutation.mutateAsync({ userId: user.id });
  };

  if (!isOpen || !user) return null;

  const isOwner = user.role === "owner";
  const isPending = user.openId.startsWith("pending:");

  return (
    <AppleModal isOpen={isOpen} onClose={onClose} title="Edit User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isPending && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 text-sm text-yellow-800 dark:text-yellow-200">
            This user hasn't logged in yet. They will be activated when they
            first sign in with Google.
          </div>
        )}

        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
            disabled={isOwner}
          />
        </div>
        <div>
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            required
            disabled={isOwner}
          />
        </div>
        <div>
          <Label htmlFor="edit-role">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: "user" | "admin") =>
              setFormData({ ...formData, role: value })
            }
            disabled={isOwner}
          >
            <SelectTrigger id="edit-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isOwner && (
          <div className="text-sm text-muted-foreground">
            Owner accounts cannot be modified.
          </div>
        )}
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isOwner || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete User"}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isOwner || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </div>
      </form>
    </AppleModal>
  );
}

export default function UserList() {
  usePageTitle("Team Members");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "user" | "admin" | "owner" | "all"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  const utils = trpc.useUtils();

  const {
    data: usersData,
    isLoading,
    error,
    isError,
  } = trpc.admin.users.list.useQuery({
    search: debouncedSearch || undefined,
    role:
      roleFilter !== "all" && roleFilter !== "owner" ? roleFilter : undefined,
    limit: 50,
    offset: 0,
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  return (
    <PanelErrorBoundary name="User List">
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Team Members</h1>
                <p className="text-muted-foreground mt-1">
                  Manage team member accounts and permissions
                </p>
              </div>
              <AppleButton
                onClick={() => setShowCreateModal(true)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Add Team Member
              </AppleButton>
            </div>
          </header>

          {/* Search and Filters */}
          <section aria-label="Search and filter users">
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-md">
                <label htmlFor="user-search" className="sr-only">
                  Search users
                </label>
                <AppleSearchField
                  id="user-search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  aria-label="Search users by name or email"
                />
              </div>
              <div className="w-48">
                <Label htmlFor="role-filter">Filter by Role</Label>
                <Select
                  value={roleFilter}
                  onValueChange={(value: UserRole | "all") =>
                    setRoleFilter(value)
                  }
                >
                  <SelectTrigger id="role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* User List */}
          {isLoading ? (
            <div role="status" aria-live="polite" aria-label="Loading users">
              <LoadingSpinner message="Loading team members..." />
            </div>
          ) : isError ? (
            <ErrorDisplay message="Failed to load team members" error={error} />
          ) : usersData && usersData.users.length > 0 ? (
            <section aria-label="User list">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersData.users.map((user: User) => (
                  <AppleCard key={user.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold truncate">
                            {user.name || "Unnamed User"}
                          </h3>
                          <RoleBadge role={user.role} />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email || "No email"}
                        </p>
                        {user.openId.startsWith("pending:") && (
                          <Badge variant="outline" className="mt-2">
                            Pending Activation
                          </Badge>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last signed in:{" "}
                          {user.lastSignedIn
                            ? new Date(user.lastSignedIn).toLocaleDateString(
                                "da-DK"
                              )
                            : "Never"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        aria-label={`Edit ${user.name || user.email}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </AppleCard>
                ))}
              </div>
              {usersData.total > usersData.users.length && (
                <div className="text-center text-sm text-muted-foreground mt-4">
                  Showing {usersData.users.length} of {usersData.total} users
                </div>
              )}
            </section>
          ) : (
            <section aria-label="No users">
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || roleFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first team member"}
                </p>
                {!search && roleFilter === "all" && (
                  <AppleButton
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Add Team Member
                  </AppleButton>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
        }}
      />
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={() => {
          setEditingUser(null);
        }}
      />
    </PanelErrorBoundary>
  );
}
