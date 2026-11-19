'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  price: number;
  discount_price: number | null;
  stock: number;
  category_id: number;
  category?: { name: string };
  dress_style: string;
  is_active: boolean;
  images: { id: number; image_url: string; is_primary: boolean }[];
}

export default function AdminProductsPage() {
  const { hasPermission } = useAdminAuth();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [categoryId, setCategoryId] = useState('');
  const [dressStyle, setDressStyle] = useState('casual');
  const [isActive, setIsActive] = useState(true);
  const [imagesList, setImagesList] = useState<{ image_url: string; is_primary: boolean }[]>([
    { image_url: '', is_primary: true }
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async (page = currentPage) => {
    setLoading(true);
    let query = `/admin/products?page=${page}&per_page=10&search=${encodeURIComponent(search)}`;
    if (categoryFilter) query += `&category_id=${categoryFilter}`;
    if (stockFilter) query += `&stock_status=${stockFilter}`;

    const res = await fetchApi<ProductItem[]>(query);
    if (res.success && res.data) {
      setProducts(res.data);
      if (res.meta) {
        setTotalPages(res.meta.last_page || 1);
        setTotalProducts(res.meta.total || res.data.length);
        setCurrentPage(res.meta.current_page || 1);
      }
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    const res = await fetchApi<any[]>('/categories');
    if (res.success && res.data) {
      // Flatten subcategories
      const flat: { id: number; name: string }[] = [];
      res.data.forEach((parent) => {
        flat.push({ id: parent.id, name: parent.name });
        parent.children?.forEach((child: any) => {
          flat.push({ id: child.id, name: `${parent.name} → ${child.name}` });
        });
      });
      setCategories(flat);
      if (flat.length > 0 && !categoryId) {
        setCategoryId(String(flat[0].id));
      }
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [categoryFilter, stockFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setPrice('120');
    setDiscountPrice('');
    setStock('25');
    setDressStyle('casual');
    setIsActive(true);
    setImagesList([
      { image_url: '/figma/imgImage7_8ad0bca2.png', is_primary: true },
    ]);
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setPrice(String(p.price));
    setDiscountPrice(p.discount_price ? String(p.discount_price) : '');
    setStock(String(p.stock));
    setCategoryId(String(p.category_id));
    setDressStyle(p.dress_style || 'casual');
    setIsActive(p.is_active);
    if (p.images && p.images.length > 0) {
      setImagesList(p.images.map((img) => ({ image_url: img.image_url, is_primary: !!img.is_primary })));
    } else {
      setImagesList([{ image_url: '/figma/imgImage7_8ad0bca2.png', is_primary: true }]);
    }
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const validImages = imagesList
      .filter((img) => img.image_url.trim().length > 0)
      .map((img, idx) => ({
        image_url: img.image_url.trim(),
        is_primary: img.is_primary || idx === 0,
      }));

    const payload: any = {
      name,
      sku,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      stock: Number(stock),
      category_id: Number(categoryId),
      dress_style: dressStyle,
      is_active: isActive,
      images: validImages.length > 0 ? validImages : undefined,
    };

    let res;
    if (editingProduct) {
      res = await fetchApi(`/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetchApi('/admin/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    setSubmitting(false);

    if (res.success) {
      setModalOpen(false);
      loadProducts(currentPage);
    } else {
      setFormError(res.message || 'Error saving product.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    const res = await fetchApi(`/admin/products/${id}`, { method: 'DELETE' });
    if (res.success) {
      loadProducts();
    } else {
      alert(res.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-black font-integral">Product Inventory</h2>
          <p className="text-[13px] text-black/50">Manage your product catalog, prices, and stock levels</p>
        </div>

        {hasPermission('products.create') && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-[14px] font-medium text-white hover:bg-black/85 shadow-xs"
          >
            <Plus className="size-4" />
            <span>New Product</span>
          </button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProducts();
          }}
          className="relative flex-1 min-w-[220px]"
        >
          <Search className="absolute left-3.5 size-4 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2 pl-10 pr-4 text-[13px] text-black outline-none focus:border-black focus:bg-white"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-white py-2 px-3 text-[13px] font-medium text-black outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-white py-2 px-3 text-[13px] font-medium text-black outline-none"
        >
          <option value="">All Stock Levels</option>
          <option value="low">Low Stock (≤ 5 units)</option>
          <option value="out">Out of Stock (0 units)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-black/10 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-black/10 bg-[#FBFBFB] text-[12px] font-bold uppercase tracking-wider text-black/40">
              <tr>
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-black/40">
                    Loading products...
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-black/[0.02]">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-lg bg-[#F0EEED] p-1 flex items-center justify-center shrink-0">
                            {p.images?.[0]?.image_url ? (
                              <img src={p.images[0].image_url} alt="" className="size-full object-contain" />
                            ) : (
                              <Package className="size-6 text-black/30" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-black">{p.name}</div>
                            <div className="text-[12px] text-black/50 capitalize">{p.dress_style}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[13px] text-black/70">{p.sku}</td>
                      <td className="py-3 px-4 text-black/70">{p.category?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-black">${Number(p.price).toFixed(2)}</span>
                        {p.discount_price && (
                          <span className="text-[12px] text-[#FF3333] ml-1.5 font-semibold">
                            (${Number(p.discount_price).toFixed(2)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isOut ? 'text-[#FF3333]' : isLow ? 'text-amber-600' : 'text-black'}`}>
                            {p.stock}
                          </span>
                          {isLow && (
                            <span title="Low stock">
                              <AlertTriangle className="size-3.5 text-amber-500" />
                            </span>
                          )}
                          {isOut && <span className="rounded bg-[#FF3333]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#FF3333]">OUT</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPermission('products.edit') && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-1.5 text-black/60 hover:text-black hover:bg-black/5 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 className="size-4" />
                            </button>
                          )}
                          {hasPermission('products.delete') && (
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-black/40 hover:text-[#FF3333] hover:bg-[#FF3333]/10 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-black/40">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/10 px-6 py-4 bg-gray-50/50">
            <span className="text-xs text-black/60">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalProducts} total products)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextP = Math.max(1, currentPage - 1);
                  setCurrentPage(nextP);
                  loadProducts(nextP);
                }}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-black hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextP = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(nextP);
                  loadProducts(nextP);
                }}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-black hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-black/10">
              <h3 className="text-[20px] font-bold text-black font-integral">
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-black/50 hover:text-black">
                <X className="size-5" />
              </button>
            </div>

            {formError && (
              <div className="my-4 rounded-xl bg-[#FF3333]/10 p-3 text-[13px] font-medium text-[#FF3333]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-[13px] font-bold text-black mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Classic Oversized Graphic Tee"
                  className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-black mb-1">Dress Style</label>
                  <select
                    value={dressStyle}
                    onChange={(e) => setDressStyle(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-[#F9F9F9] py-2.5 px-3 text-[14px] text-black outline-none capitalize"
                  >
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="party">Party</option>
                    <option value="gym">Gym</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="size-4 rounded accent-black"
                    />
                    <span className="text-[13px] font-bold text-black">Active &amp; Visible</span>
                  </label>
                </div>
              </div>

              {/* Multiple Images Manager */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[13px] font-bold text-black">Product Images</label>
                  <button
                    type="button"
                    onClick={() => setImagesList([...imagesList, { image_url: '', is_primary: false }])}
                    className="text-xs font-bold text-black flex items-center gap-1 hover:underline"
                  >
                    <Plus className="size-3" />
                    <span>Add Image</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {imagesList.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={img.image_url}
                        onChange={(e) => {
                          const updated = [...imagesList];
                          updated[idx].image_url = e.target.value;
                          setImagesList(updated);
                        }}
                        placeholder="/figma/imgImage7_8ad0bca2.png or https://..."
                        className="flex-1 rounded-xl border border-black/10 bg-[#F9F9F9] py-2 px-3 text-[12px] text-black outline-none font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const updated = imagesList.map((item, i) => ({
                            ...item,
                            is_primary: i === idx,
                          }));
                          setImagesList(updated);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          img.is_primary
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Set as Primary Display Image"
                      >
                        {img.is_primary ? 'Primary' : 'Make Primary'}
                      </button>

                      {imagesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = imagesList.filter((_, i) => i !== idx);
                            if (img.is_primary && updated.length > 0) {
                              updated[0].is_primary = true;
                            }
                            setImagesList(updated);
                          }}
                          className="p-1.5 text-black/40 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

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
                  disabled={submitting}
                  className="rounded-xl bg-black px-6 py-2.5 text-[14px] font-medium text-white hover:bg-black/85 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
