'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface CategoryNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  is_active: boolean;
  children?: CategoryNode[];
}

export default function AdminCategoriesPage() {
  const { hasPermission } = useAdminAuth();
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    const res = await fetchApi<CategoryNode[]>('/categories');
    if (res.success && res.data) {
      setTree(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = (prefillParentId?: number) => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId(prefillParentId ? String(prefillParentId) : '');
    setIsActive(true);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryNode) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parent_id ? String(cat.parent_id) : '');
    setIsActive(cat.is_active);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      description,
      parent_id: parentId ? Number(parentId) : null,
      is_active: isActive,
    };

    let res;
    if (editingCategory) {
      res = await fetchApi(`/admin/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetchApi('/admin/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setModalOpen(false);
      loadCategories();
    } else {
      setError(res.message || 'Error saving category.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadCategories();
    } else {
      alert(res.message || 'Cannot delete category.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-black font-integral">Category Hierarchy</h2>
          <p className="text-[13px] text-black/50">Manage multi-level category navigation and catalog taxonomy</p>
        </div>

        {hasPermission('categories.manage') && (
          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-[14px] font-medium text-white hover:bg-black/85 shadow-xs"
          >
            <Plus className="size-4" />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Tree View Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-12 text-center text-black/40">
            Loading categories...
          </div>
        ) : tree.map((parent) => (
          <div key={parent.id} className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs">
            {/* Parent Level Row */}
            <div className="flex items-center justify-between bg-[#FBFBFB] px-6 py-4 border-b border-black/5">
              <div className="flex items-center gap-3">
                <FolderTree className="size-5 text-black" />
                <span className="text-[16px] font-bold text-black">{parent.name}</span>
                <span className="font-mono text-[12px] text-black/40">/{parent.slug}</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${parent.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                  {parent.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              {hasPermission('categories.manage') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreate(parent.id)}
                    className="flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1 text-[12px] font-semibold text-black hover:bg-black hover:text-white"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Subcategory</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(parent)}
                    className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 rounded-lg"
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(parent.id)}
                    className="p-1.5 text-black/40 hover:text-[#FF3333] hover:bg-[#FF3333]/10 rounded-lg"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Subcategories Children */}
            {parent.children && parent.children.length > 0 ? (
              <div className="divide-y divide-black/5 px-6">
                {parent.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between py-3 pl-6">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="size-4 text-black/30" />
                      <span className="text-[14px] font-semibold text-black">{child.name}</span>
                      <span className="font-mono text-[12px] text-black/40">/{child.slug}</span>
                    </div>

                    {hasPermission('categories.manage') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(child)}
                          className="p-1 text-black/60 hover:text-black hover:bg-black/5 rounded"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(child.id)}
                          className="p-1 text-black/40 hover:text-[#FF3333] hover:bg-[#FF3333]/10 rounded"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-4 text-[13px] text-black/40 italic">
                No subcategories assigned.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <h3 className="text-[20px] font-bold text-black font-integral">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-black/50 hover:text-black">
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <div className="my-4 rounded-xl bg-[#FF3333]/10 p-3 text-[13px] font-medium text-[#FF3333]">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-[13px] font-bold text-black mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Denim Jackets"
                  className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none"
                >
                  <option value="">None (Top-Level Category)</option>
                  {tree.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-black mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional category summary..."
                  className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2 px-3 text-[14px] text-black outline-none focus:border-black"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="size-4 rounded accent-black"
                />
                <span className="text-[13px] font-bold text-black">Active &amp; Visible in Navigation</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-black/10 px-5 py-2.5 text-[14px] font-medium text-black hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-black px-6 py-2.5 text-[14px] font-medium text-white hover:bg-black/85"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
