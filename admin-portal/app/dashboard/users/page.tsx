"use client";

import { useEffect, useState } from "react";

import api from "../../../services/api";
import { getUser, hasPermission } from "../../../services/auth";

import { RESOURCE, ACTION } from "../../../services/permissions";

import { Roles } from "@/services/roles";

type Permission = {
  resource: string;
  actions: string[];
};

type User = {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [users, setUsers] = useState<User[]>([]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load logged-in user.
   */
  useEffect(() => {
    const user = getUser();

    setCurrentUser(user);
  }, []);

  /*
   * Permission rules:
   *
   * SUPER_ADMIN:
   *   - Can view users
   *   - Can manage permissions
   *
   * SUB_ADMIN:
   *   - USERS + READ   -> can view users
   *   - USERS + UPDATE -> can manage permissions
   */
  const canViewUsers =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.READ);

  const canManagePermissions =
    currentUser?.role === Roles.SUPER_ADMIN ||
    hasPermission(RESOURCE.USERS, ACTION.UPDATE);

  /*
   * Fetch users.
   *
   * We only fetch when the current user is loaded
   * and has USERS:READ or is SUPER_ADMIN.
   */
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

  /*
   * Open permission editor.
   */
  const openPermissions = (user: User) => {
    /*
     * Extra frontend protection.
     */
    if (!canManagePermissions) {
      return;
    }

    /*
     * Only SUB_ADMIN permissions should be edited.
     */
    if (user.role !== Roles.SUB_ADMIN) {
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

  /*
   * Close permission editor.
   */
  const closePermissions = () => {
    setSelectedUser(null);
    setPermissions([]);
  };

  /*
   * Check whether currently selected user
   * has a specific permission.
   */
  const hasSelectedPermission = (resource: string, action: string) => {
    const permission = permissions.find((item) => item.resource === resource);

    return permission?.actions.includes(action) ?? false;
  };

  /*
   * Toggle permission.
   */
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
       * No actions remaining.
       * Remove the resource permission completely.
       */
      if (updatedActions.length === 0) {
        return current.filter((item) => item.resource !== resource);
      }

      /*
       * Update resource permission.
       */
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

    /*
     * Only SUB_ADMIN permissions can be changed
     * from this screen.
     */
    if (selectedUser.role !== Roles.SUB_ADMIN) {
      setError("Permissions can only be changed for SUB_ADMIN users.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * Backend expects:
       *
       * {
       *   permissions: [...]
       * }
       */
      const response = await api.patch(
        `/user/${selectedUser._id}/permissions`,
        permissions,
      );

      /*
       * Use backend response if it returns
       * the updated user.
       *
       * Otherwise use local permissions.
       */
      const updatedPermissions = response.data?.permissions ?? permissions;

      /*
       * Update users list.
       */
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

      /*
       * Close editor.
       */
      closePermissions();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Failed to update permissions.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Wait until logged-in user is loaded.
   */
  if (!currentUser) {
    return <p>Loading...</p>;
  }

  /*
   * User doesn't have USERS:READ.
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
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <h2 style={{ margin: 0 }}>Users</h2>
      </div>

      {/* Error */}
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

      {/* Loading */}
      {loading ? (
        <p>Loading users...</p>
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

                {canManagePermissions && <th style={thStyle}>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td style={tdStyle}>{user.name}</td>

                  <td style={tdStyle}>{user.email}</td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        color:
                          user.role === Roles.SUPER_ADMIN ? "#176b2c" : "#555",
                        fontWeight: 600,
                      }}
                    >
                      {user.role}
                    </span>
                  </td>

                  {canManagePermissions && (
                    <td style={tdStyle}>
                      {user.role === Roles.SUB_ADMIN && (
                        <button
                          onClick={() => openPermissions(user)}
                          style={buttonStyle}
                        >
                          Manage Permissions
                        </button>
                      )}

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
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permission editor */}
      {selectedUser && canManagePermissions && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            padding: "16px",
            maxWidth: "700px",
          }}
        >
          {/* Editor header */}
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

            <button
              onClick={closePermissions}
              style={secondaryButtonStyle}
              disabled={saving}
            >
              Close
            </button>
          </div>

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
            {/* Header */}
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
            <button
              onClick={closePermissions}
              style={secondaryButtonStyle}
              disabled={saving}
            >
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
  padding: "10px 12px",
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

const secondaryButtonStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
  color: "#444",
  cursor: "pointer",
  fontSize: "12px",
};
