'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Lock,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface PermissionItem {
  id: number;
  name: string;
  slug: string;
  group: string;
  description: string;
}

interface RoleItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  permissions: PermissionItem[];
}

interface StaffItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  roles: { id: number; name: string; slug: string }[];
}

export default function AdminRolesAndStaffPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'staff'>('roles');

  // Roles & Permissions state
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<Record<string, PermissionItem[]>>({});
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Role Form modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [roleFormError, setRoleFormError] = useState<string | null>(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Staff state
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Staff Form modal
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRoles, setStaffRoles] = useState<number[]>([]);
  const [staffIsActive, setStaffIsActive] = useState(true);
  const [staffFormError, setStaffFormError] = useState<string | null>(null);
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  // Load roles & permissions
  const loadRolesAndPermissions = async () => {
    setLoadingRoles(true);
    const [rolesRes, permsRes] = await Promise.all([
      fetchApi<RoleItem[]>('/admin/roles'),
      fetchApi<Record<string, PermissionItem[]>>('/admin/permissions'),
    ]);

    if (rolesRes.success && rolesRes.data) {
      setRoles(rolesRes.data);
    }
    if (permsRes.success && permsRes.data) {
      setPermissionGroups(permsRes.data);
    }
    setLoadingRoles(false);
  };

  // Load staff
  const loadStaff = async () => {
    setLoadingStaff(true);
    const res = await fetchApi<StaffItem[]>('/admin/staff');
    if (res.success && res.data) {
      setStaff(res.data);
    }
    setLoadingStaff(false);
  };

  useEffect(() => {
    loadRolesAndPermissions();
    loadStaff();
  }, []);

  // Open Create Role
  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setSelectedPermissionIds([]);
    setRoleFormError(null);
    setRoleModalOpen(true);
  };

  // Open Edit Role
  const openEditRole = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setSelectedPermissionIds(role.permissions.map((p) => p.id));
    setRoleFormError(null);
    setRoleModalOpen(true);
  };

  // Save Role
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleSubmitting(true);
    setRoleFormError(null);

    const payload = {
      name: roleName.trim(),
      description: roleDescription.trim() || null,
      permissions: selectedPermissionIds,
    };

    let res;
    if (editingRole) {
      res = await fetchApi(`/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetchApi('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setRoleModalOpen(false);
      loadRolesAndPermissions();
    } else {
      setRoleFormError(res.message || 'Failed to save role.');
    }
    setRoleSubmitting(false);
  };

  // Delete Role
  const handleDeleteRole = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    const res = await fetchApi(`/admin/roles/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadRolesAndPermissions();
    } else {
      alert(res.message || 'Failed to delete role.');
    }
  };

  // Toggle permission in role modal
  const togglePermission = (id: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Toggle all permissions in a group
  const toggleGroupPermissions = (perms: PermissionItem[]) => {
    const ids = perms.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  // Staff Handlers
  const openCreateStaff = () => {
    setEditingStaff(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    setStaffPhone('');
    setStaffRoles([]);
    setStaffIsActive(true);
    setStaffFormError(null);
    setStaffModalOpen(true);
  };

  const openEditStaff = (member: StaffItem) => {
    setEditingStaff(member);
    setStaffName(member.name);
    setStaffEmail(member.email);
    setStaffPassword('');
    setStaffPhone(member.phone || '');
    setStaffRoles(member.roles.map((r) => r.id));
    setStaffIsActive(member.is_active);
    setStaffFormError(null);
    setStaffModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSubmitting(true);
    setStaffFormError(null);

    const payload: any = {
      name: staffName.trim(),
      email: staffEmail.trim(),
      phone: staffPhone.trim() || null,
      is_active: staffIsActive,
      roles: staffRoles,
    };

    if (staffPassword.trim()) {
      payload.password = staffPassword.trim();
    }

    let res;
    if (editingStaff) {
      res = await fetchApi(`/admin/staff/${editingStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      if (!staffPassword.trim()) {
        setStaffFormError('Password is required for new staff members.');
        setStaffSubmitting(false);
        return;
      }
      res = await fetchApi('/admin/staff', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setStaffModalOpen(false);
      loadStaff();
    } else {
      setStaffFormError(res.message || 'Failed to save staff member.');
    }
    setStaffSubmitting(false);
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    const res = await fetchApi(`/admin/staff/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadStaff();
    } else {
      alert(res.message || 'Failed to delete staff member.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-black" />
            Roles & Staff Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure granular role permissions and control administrative staff access.
          </p>
        </div>

        {/* Tab Buttons & Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'roles' ? (
            <button
              onClick={openCreateRole}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              <Plus className="w-4 h-4" />
              Create Custom Role
            </button>
          ) : (
            <button
              onClick={openCreateStaff}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'roles'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Roles & Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'staff'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Directory ({staff.length})
        </button>
      </div>

      {/* TAB 1: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {loadingRoles ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Loading RBAC roles and permissions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => {
                const isSuperAdmin = role.slug === 'super-admin' || role.is_system;

                return (
                  <div
                    key={role.id}
                    className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">{role.name}</h3>
                            {isSuperAdmin && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-full">
                                <Lock className="w-2.5 h-2.5" /> System
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-gray-400 mt-0.5 block">
                            slug: {role.slug}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 mb-4 min-h-[32px]">
                        {role.description || 'No description provided.'}
                      </p>

                      {/* Permissions overview */}
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-gray-700">Effective Permissions:</span>
                          <span className="font-bold text-gray-900">
                            {isSuperAdmin ? 'Full Access (*)' : `${role.permissions.length} active`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                          {isSuperAdmin ? (
                            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                              All Super Admin permissions granted
                            </span>
                          ) : role.permissions.length === 0 ? (
                            <span className="text-[11px] text-gray-400 italic">No permissions assigned yet</span>
                          ) : (
                            role.permissions.map((p) => (
                              <span
                                key={p.id}
                                className="text-[10px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md border border-gray-200"
                              >
                                {p.slug}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions footer */}
                    <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-end gap-2">
                      {isSuperAdmin ? (
                        <span className="text-xs text-gray-400 italic">Protected Role</span>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditRole(role)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loadingStaff ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">Loading staff accounts...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-800">No staff members found</p>
              <p className="text-xs text-gray-400 mt-1">Add staff users to manage the store.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Staff Member</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Assigned Roles</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{member.name}</div>
                            <div className="text-xs text-gray-400">ID #{member.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-900 font-medium">{member.email}</div>
                        <div className="text-xs text-gray-400">{member.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {member.roles.map((r) => (
                            <span
                              key={r.id}
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                r.slug === 'super-admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditStaff(member)}
                          className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Staff Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ROLE FORM MODAL (With Permission Matrix) */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
              </h2>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {roleFormError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{roleFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalog Specialist"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of duties and authorities for this role"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              {/* Permissions Checklist Grouped by Module */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Assign Permissions Matrix ({selectedPermissionIds.length} selected)
                  </label>
                </div>

                <div className="space-y-4">
                  {Object.entries(permissionGroups).map(([groupName, perms]) => {
                    const groupPermIds = perms.map((p) => p.id);
                    const allInGroupSelected = groupPermIds.every((id) =>
                      selectedPermissionIds.includes(id)
                    );

                    return (
                      <div
                        key={groupName}
                        className="bg-gray-50 p-4 rounded-xl border border-gray-200/70"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-800">
                            {groupName} Module
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleGroupPermissions(perms)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {allInGroupSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {perms.map((perm) => {
                            const isChecked = selectedPermissionIds.includes(perm.id);

                            return (
                              <label
                                key={perm.id}
                                className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition border text-xs ${
                                  isChecked
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => togglePermission(perm.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                                    isChecked
                                      ? 'bg-white text-black border-white'
                                      : 'border-gray-300'
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div>
                                  <div className="font-semibold">{perm.name}</div>
                                  <div
                                    className={`text-[10px] font-mono ${
                                      isChecked ? 'text-gray-300' : 'text-gray-400'
                                    }`}
                                  >
                                    {perm.slug}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole as any}
                disabled={roleSubmitting}
                className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
              >
                {roleSubmitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF FORM MODAL */}
      {staffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editingStaff ? `Edit Staff: ${editingStaff.name}` : 'Add Staff Member'}
              </h2>
              <button
                onClick={() => setStaffModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffFormError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{staffFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alice Walker"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="alice@shop.co"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 019-2834"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Password {editingStaff ? '(Leave blank to keep unchanged)' : '*'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
                  placeholder={editingStaff ? '••••••••' : 'Min 8 characters'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Assign Roles *</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {roles.map((r) => {
                    const isChecked = staffRoles.includes(r.id);
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${
                          isChecked
                            ? 'bg-black text-white border-black'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setStaffRoles((prev) =>
                              prev.includes(r.id)
                                ? prev.filter((id) => id !== r.id)
                                : [...prev, r.id]
                            );
                          }}
                          className="sr-only"
                        />
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-white text-black border-white' : 'border-gray-300'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="font-semibold truncate">{r.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staffIsActive"
                  checked={staffIsActive}
                  onChange={(e) => setStaffIsActive(e.target.checked)}
                  className="rounded text-black focus:ring-black w-4 h-4 cursor-pointer"
                />
                <label htmlFor="staffIsActive" className="text-sm text-gray-700 font-medium cursor-pointer">
                  Active account (enabled to login)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={staffSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-black hover:bg-gray-800 rounded-xl transition disabled:opacity-50"
                >
                  {staffSubmitting ? 'Saving...' : editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
