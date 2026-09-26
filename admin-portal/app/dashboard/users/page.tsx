"use client";

import { useEffect, useState } from "react";

import api from "../../../services/api";
import { getUser, hasPermission } from "../../../services/auth";
import { RESOURCE, ACTION } from "../../../services/permissions";
import { Roles } from "@/services/roles";
import { useRouter } from "next/navigation";

type Permission = {
  resource: string;
  actions: string[];
};

// User returned by GET /user
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions?: Permission[];
};

//current logged-in user. getUser() may not contain isActive in its stored object, so don't require it here.
type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions?: Permission[];
};

const resources = [
  {
    key: RESOURCE.TRAINS,
    label: "Trains",
  },
  {
    key: RESOURCE.STATIONS,
    label: "Stations",
  },
  {
    key: RESOURCE.SCHEDULES,
    label: "Schedules",
  },
  {
    key: RESOURCE.USERS,
    label: "Users",
  },
  {
    key: RESOURCE.BOOKINGS,
    label: "Bookings",
  },
];

const actions = [
  {
    key: ACTION.READ,
    label: "View",
  },
  {
    key: ACTION.CREATE,
    label: "Add",
  },
  {
    key: ACTION.UPDATE,
    label: "Edit",
  },
  {
    key: ACTION.DELETE,
    label: "Delete",
  },
];

export default function UsersPage() {
  const router = useRouter();

  //Current logged-in user. does NOT require isActive.
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Users returned from backend. contains isActive.
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  // Load current logged-in user.
  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  const canAddUsers =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.CREATE);

  const canViewUsers =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.READ);

  const canManagePermissions =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.UPDATE);

  const canDeleteUsers =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.DELETE);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!canViewUsers) {
      setLoading(false);
      return;
    }

    fetchUsers();
  }, [currentUser, canViewUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/user");

      setUsers(response.data);
    } catch (error: any) {
      console.error(error);

      setError(error?.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // Open permission editor.
  const openPermissions = (user: User) => {
    if (!canManagePermissions) {
      return;
    }

    if (user.role !== Roles.SUB_ADMIN) {
      return;
    }

    if (!user.isActive) {
      return;
    }

    setSelectedUser(user);

    setPermissions(
      user.permissions
        ? user.permissions.map((permission) => ({
            resource: permission.resource,
            actions: [...permission.actions],
          }))
        : [],
    );
  };

  //Close permission editor.
  const closePermissions = () => {
    setSelectedUser(null);
    setPermissions([]);
  };

  //   * Check whether selected user has a particular permission.
  const hasSelectedPermission = (resource: string, action: string) => {
    const permission = permissions.find((item) => item.resource === resource);

    return permission?.actions.includes(action) ?? false;
  };

  const togglePermission = (resource: string, action: string) => {
    if (!canManagePermissions) {
      return;
    }

    setPermissions((current) => {
      const existing = current.find((item) => item.resource === resource);

      /*
       * Resource doesn't exist yet.
       */
      if (!existing) {
        return [
          ...current,
          {
            resource,
            actions: [action],
          },
        ];
      }

      const hasAction = existing.actions.includes(action);

      const updatedActions = hasAction
        ? existing.actions.filter((item) => item !== action)
        : [...existing.actions, action];

      /*
       * Remove resource if no actions
       * remain.
       */
      if (updatedActions.length === 0) {
        return current.filter((item) => item.resource !== resource);
      }

      return current.map((item) =>
        item.resource === resource
          ? {
              ...item,
              actions: updatedActions,
            }
          : item,
      );
    });
  };

  /*
   * Save permissions.
   */
  const savePermissions = async () => {
    if (!selectedUser) {
      return;
    }

    if (!canManagePermissions) {
      setError("You do not have permission to update users.");
      return;
    }

    if (selectedUser.role !== Roles.SUB_ADMIN) {
      setError("Permissions can only be changed for SUB_ADMIN users.");
      return;
    }

    if (!selectedUser.isActive) {
      setError("Inactive users cannot have their permissions changed.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // console.log("permissions being sent:", permissions);
      // console.log("RESOURCE:", RESOURCE);
      // console.log("ACTION:", ACTION);
      // console.log("resources:", resources);
      // console.log("actions:", actions);
      const response = await api.patch(
        `/user/${selectedUser._id}/permissions`,
        {
          permissions,
        },
      );

      const updatedPermissions = response.data?.permissions ?? permissions;

      setUsers((current) =>
        current.map((user) =>
          user._id === selectedUser._id
            ? {
                ...user,
                permissions: updatedPermissions,
              }
            : user,
        ),
      );

      closePermissions();
    } catch (error: any) {
      console.error(error);

      const message = error?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(message || "Failed to update permissions.");
      }
    } finally {
      setSaving(false);
    }
  };

  //Deactivate user.
  const handleDeleteUser = async (user: User) => {
    if (!canDeleteUsers) {
      return;
    }

    if (user.role === Roles.SUPER_ADMIN) {
      return;
    }
    //     * Already inactive.
    if (!user.isActive) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(user._id);
      setError("");

      await api.delete(`/user/${user._id}`);

      // * IMPORTANT: This is a soft delete.
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? {
                ...item,
                isActive: false,
              }
            : item,
        ),
      );

      /*
       * Close permission editor if this user was selected.
       */
      if (selectedUser?._id === user._id) {
        closePermissions();
      }
    } catch (error: any) {
      console.error(error);

      const message = error?.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(", "));
      } else {
        setError(message || "Failed to deactivate user.");
      }
    } finally {
      setDeleting(null);
    }
  };

  /*
   * Current user is loading.
   */
  if (!currentUser) {
    return <p>Loading...</p>;
  }

  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();

    return (
      // user.userCode.toLowerCase().includes(value) ||
      user.name.toLowerCase().includes(value) ||
      user.email.toLowerCase().includes(value) ||
      user.role.toLowerCase().includes(value)
    );
  });

  /*
   * No USERS.READ permission.
   */
  if (!canViewUsers) {
    return (
      <div>
        <h2>Users</h2>

        <p>You do not have permission to view users.</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ==========Header========== */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Users</h1>

          <p style={styles.subtitle}>Manage railway users</p>
        </div>

        {canAddUsers && (
          <button
            onClick={() => router.push("/dashboard/users/add")}
            // style={styles.primaryButton}
          >
            + Add User
          </button>
        )}

        {/* ==========ERROR========== */}
        {error && (
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #e0a0a0",
              backgroundColor: "#fff5f5",
              color: "#b42318",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}
      </div>
      {/* ============USERS TABLE=========== */}
      {/* Search */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            textAlign: "center",
            color: "#777",
            fontSize: "13px",
          }}
        >
          No users found.
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>Name</th>

                <th style={thStyle}>Email</th>

                <th style={thStyle}>Role</th>

                <th style={thStyle}>Status</th>

                {(canManagePermissions || canDeleteUsers) && (
                  <th style={thStyle}>Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isInactive = !user.isActive;

                return (
                  <tr
                    key={user._id}
                    style={{
                      backgroundColor: isInactive ? "#f7f7f7" : "#fff",
                      color: isInactive ? "#888" : "#111",
                    }}
                  >
                    {/* Name */}

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}

                    <td style={tdStyle}>{user.email}</td>

                    {/* Role */}

                    <td style={tdStyle}>
                      <span
                        style={{
                          color:
                            user.role === Roles.SUPER_ADMIN
                              ? "#176b2c"
                              : isInactive
                                ? "#888"
                                : "#555",

                          fontWeight: 600,
                        }}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        style={user.isActive ? styles.active : styles.inactive}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}

                    {(canManagePermissions || canDeleteUsers) && (
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          {/* Manage Permissions */}

                          {canManagePermissions &&
                            user.role === Roles.SUB_ADMIN &&
                            user.isActive && (
                              <button
                                onClick={() => openPermissions(user)}
                                disabled={deleting === user._id}
                                style={buttonStyle}
                              >
                                Manage Permissions
                              </button>
                            )}

                          {/* SUPER_ADMIN */}

                          {user.role === Roles.SUPER_ADMIN && (
                            <span
                              style={{
                                color: "#888",
                                fontSize: "12px",
                              }}
                            >
                              Full access
                            </span>
                          )}

                          {/* Delete */}

                          {canDeleteUsers &&
                            user.role !== Roles.SUPER_ADMIN &&
                            user.isActive && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                disabled={deleting === user._id}
                              >
                                {deleting === user._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </button>
                            )}

                          {/* Inactive */}

                          {!user.isActive &&
                            user.role !== Roles.SUPER_ADMIN && (
                              <span
                                style={{
                                  color: "#999",
                                  fontSize: "12px",
                                }}
                              >
                                Deactivated
                              </span>
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* =========================Permission editor ========================= */}
      {selectedUser && canManagePermissions && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            padding: "16px",
            maxWidth: "700px",
          }}
        >
          {/* Header */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "18px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 4px",
                }}
              >
                {selectedUser.name}
              </h3>

              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                }}
              >
                {selectedUser.email}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#176b2c",
                  fontWeight: 600,
                }}
              >
                SUB_ADMIN
              </div>
            </div>

            <button onClick={closePermissions} disabled={saving}>
              Close
            </button>
          </div>

          {/* Title */}

          <h4
            style={{
              margin: "0 0 10px",
            }}
          >
            Permissions
          </h4>

          {/* Permission matrix */}

          <div
            style={{
              border: "1px solid #ddd",
            }}
          >
            {/* Matrix header */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr repeat(4, 75px)",
                backgroundColor: "#f5f5f5",
                borderBottom: "1px solid #ddd",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <div style={permissionHeaderStyle}>Resource</div>

              {actions.map((action) => (
                <div
                  key={action.key}
                  style={{
                    ...permissionHeaderStyle,
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </div>
              ))}
            </div>

            {/* Resources */}

            {resources.map((resource) => (
              <div
                key={resource.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr repeat(4, 75px)",
                  borderBottom: "1px solid #eee",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    padding: "11px",
                    fontWeight: 600,
                  }}
                >
                  {resource.label}
                </div>

                {actions.map((action) => (
                  <div
                    key={action.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderLeft: "1px solid #eee",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={hasSelectedPermission(resource.key, action.key)}
                      onChange={() =>
                        togglePermission(resource.key, action.key)
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <button onClick={closePermissions} disabled={saving}>
              Cancel
            </button>

            <button
              onClick={savePermissions}
              style={buttonStyle}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #ddd",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};

const permissionHeaderStyle: React.CSSProperties = {
  padding: "9px",
};

const buttonStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #176b2c",
  backgroundColor: "#e8f5eb",
  color: "#176b2c",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
  },

  active: {
    // display: "inline-block",
    padding: "2px 5px",
    background: "#e8f5e9",
    color: "#26733a",
    fontSize: "12px",
  },

  inactive: {
    // display: "inline-block",
    background: "#f5e8e8ff",
    color: "red",
    fontSize: "12px",
    padding: "2px 5px",
  },
  searchInput: {
    width: "320px",
    height: "40px",
    border: "1px solid #ccc",
    padding: "0 12px",
    fontSize: "14px",
    outline: "none",
    marginBottom: "15px",
  },
  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#666",
  },
};
