import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  X,
  Save,
  AlertTriangle,
  UploadCloud,
  PenLine,
} from 'lucide-react';
import { categoryService, uploadService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ImageUploader } from '../../components/admin/ImageUploader';

export const CategoryManagement = () => {
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [uploadingInput, setUploadingInput] = useState(false);

  // Quick Rename state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState(null);
  const [renameName, setRenameName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  // Deletion state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  const isLocalPath = (str) => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    return /^[a-zA-Z]:\\/i.test(trimmed) || trimmed.startsWith('file://') || (trimmed.includes('\\') && !trimmed.startsWith('http'));
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '💡',
    tag: '',
    description: '',
    image: '',
    isActive: true,
    subcategories: [],
  });

  const [newSub, setNewSub] = useState({
    name: '',
    slug: '',
    image: '',
    desc: '',
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories({ admin: 'true' });
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      addToast('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '💡',
      tag: '',
      description: '',
      image: '',
      isActive: true,
      subcategories: [],
    });
    setNewSub({ name: '', slug: '', image: '', desc: '' });
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      icon: cat.icon || '💡',
      tag: cat.tag || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : [],
    });
    setNewSub({ name: '', slug: '', image: '', desc: '' });
    setModalOpen(true);
  };

  const handleAddSubcategory = () => {
    if (!newSub.name.trim()) {
      addToast('Please enter a subcategory name.', 'error');
      return;
    }
    const slug = newSub.slug.trim() || newSub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const currentSubs = Array.isArray(formData.subcategories) ? [...formData.subcategories] : [];
    if (currentSubs.some((s) => s.slug === slug)) {
      addToast(`Subcategory slug "${slug}" already exists in this category.`, 'error');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      subcategories: [
        ...currentSubs,
        {
          name: newSub.name.trim(),
          slug,
          desc: newSub.desc.trim(),
          image: newSub.image.trim(),
          isActive: true,
        },
      ],
    }));
    setNewSub({ name: '', slug: '', image: '', desc: '' });
    addToast('Subcategory item added. Click "Update Category" to save to database.', 'info');
  };

  const handleRemoveSubcategory = (index) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index),
    }));
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingCategory
        ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        : prev.slug,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }

    if (isLocalPath(formData.image)) {
      addToast(
        'Local file paths (C:\\...) cannot be saved directly. Please upload the file using the upload box.',
        'error'
      );
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory._id, formData);
        if (res.success) {
          addToast(`Category "${formData.name}" updated.`, 'success');
          setModalOpen(false);
          loadCategories();
        }
      } else {
        const res = await categoryService.createCategory(formData);
        if (res.success) {
          addToast(`New category "${formData.name}" created.`, 'success');
          setModalOpen(false);
          loadCategories();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error saving category.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openRenameModal = (cat) => {
    setCategoryToRename(cat);
    setRenameName(cat.name || '');
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!renameName.trim()) {
      addToast('Please enter a valid category name.', 'error');
      return;
    }
    try {
      setRenameLoading(true);
      const res = await categoryService.renameCategory(categoryToRename._id, {
        name: renameName.trim(),
      });
      if (res.success) {
        addToast(`Category renamed to "${res.category?.name || renameName.trim()}".`, 'success');
        setRenameModalOpen(false);
        setCategoryToRename(null);
        loadCategories();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rename category.', 'error');
    } finally {
      setRenameLoading(false);
    }
  };

  const openDeleteModal = (cat) => {
    setCategoryToDelete(cat);
    setDeleteWarning('');
    setForceDelete(false);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleteLoading(true);
      const res = await categoryService.deleteCategory(categoryToDelete._id, forceDelete);
      if (res.success) {
        addToast(`Category "${categoryToDelete.name}" removed successfully.`, 'info');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        setDeleteWarning('');
        setForceDelete(false);
        loadCategories();
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.hasProducts) {
        setDeleteWarning(
          data.message ||
            `This category has ${data.productsCount || 'associated'} products. Check "Force delete" below to reassign them.`
        );
      } else {
        addToast(data?.message || 'Failed to delete category.', 'error');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-[#DC2626] font-semibold block mb-1">
            Taxonomy & Navigation
          </span>
          <h1 className="text-2xl font-serif-luxury font-bold text-white tracking-wide">
            Lighting Collections & Categories
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Organize luminaires by architectural typology: Wall lights, Hanging chandeliers, Desk lamps, and Magnetic tracks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-gold px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-luxury flex items-center gap-2 self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Category Grid Cards */}
      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500">
          <Loader2 className="w-8 h-8 text-[#DC2626] animate-spin mx-auto mb-2" />
          <span>Loading Category Taxonomy...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-[#14171d] border border-white/10 rounded-2xl p-12 text-center">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-300">No categories established</p>
          <p className="text-xs text-neutral-500 mt-1 mb-4">
            Create your first category to group your lighting catalog.
          </p>
          <button onClick={openCreateModal} className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-luxury">
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-[#14171d] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Category Cover Image */}
                <div className="h-44 bg-[#090a0d] relative overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14171d] via-transparent to-transparent opacity-80" />

                  <span
                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      cat.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-neutral-900/80 text-neutral-400 border border-white/10'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Category Body */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{cat.icon || '💡'}</span>
                      <h3 className="text-base font-serif-luxury font-bold text-white tracking-wide truncate">
                        {cat.name}
                      </h3>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono shrink-0 ml-2">
                      /{cat.slug}
                    </span>
                  </div>

                  {cat.tag && (
                    <span className="text-[11px] text-[#DC2626] font-medium block truncate mt-0.5">
                      {cat.tag}
                    </span>
                  )}

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mt-1.5">
                    {cat.description || 'No detailed architectural description assigned.'}
                  </p>

                  {/* Subcategories count badge */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                      Sub-dropdown:
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      cat.subcategories?.length > 0
                        ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                        : 'bg-white/5 text-neutral-400'
                    }`}>
                      {cat.subcategories?.length || 0} Sub-items
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Rename, Update, Delete */}
              <div className="p-3.5 bg-[#0e1014] border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                <a
                  href={`/catalog?category=${cat.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors group-hover:text-neutral-300"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span>Public View</span>
                </a>

                {/* Explicit Category Options Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Option 1: Rename Name */}
                  <button
                    onClick={() => openRenameModal(cat)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center gap-1 transition-all"
                    title="Quick Rename Category Name"
                  >
                    <PenLine className="w-3 h-3 text-amber-400" />
                    <span>Rename</span>
                  </button>

                  {/* Option 2: Update Full Details */}
                  <button
                    onClick={() => openEditModal(cat)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 flex items-center gap-1 transition-all"
                    title="Update Details, Subcategories & Image"
                  >
                    <Edit className="w-3 h-3 text-blue-400" />
                    <span>Update</span>
                  </button>

                  {/* Option 3: Delete Category */}
                  <button
                    onClick={() => openDeleteModal(cat)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 flex items-center gap-1 transition-all"
                    title="Delete this category"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#14171d]">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-[#DC2626] font-semibold block">
                  {editingCategory ? 'Update Collection & Sub-Items' : 'Create Collection'}
                </span>
                <h3 className="text-lg font-serif-luxury font-bold text-white flex items-center gap-2">
                  <span>{formData.icon || '💡'}</span>
                  <span>{editingCategory ? editingCategory.name : 'New Category'}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form noValidate onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              {/* Scrollable Form Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 modal-scrollbar">
                {/* Name & Slug Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Wall Lamp, Chandelier"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-xs focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="wall-lamp"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                {/* Icon & Tagline Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                      Emoji / Icon
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData((p) => ({ ...p, icon: e.target.value }))}
                      placeholder="💡 or ✨ or 🏛️"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-xs text-center focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                      Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.tag}
                      onChange={(e) => setFormData((p) => ({ ...p, tag: e.target.value }))}
                      placeholder="e.g. Grand Architectural Centerpieces"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-xs focus:outline-none focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Summary of luminaires and design aesthetic in this category..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-xs focus:outline-none focus:border-[#DC2626]"
                  />
                </div>

                {/* ── Sub-Dropdown Menu Items (Subcategories Editor) ── */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs uppercase tracking-luxury text-[#DC2626] font-semibold block">
                        Sub-Dropdown Menu Items
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Subcategories displayed in the navbar flyout dropdown when hovering this category.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-white">
                      {formData.subcategories?.length || 0} Sub-items
                    </span>
                  </div>

                  {/* List of existing subcategories */}
                  {formData.subcategories && formData.subcategories.length > 0 ? (
                    <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto pr-1">
                      {formData.subcategories.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-[#090a0d] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/10 flex items-center justify-center">
                            {sub.image ? (
                              <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                              <Layers className="w-3.5 h-3.5 text-neutral-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{sub.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">/{sub.slug}</span>
                            </div>
                            {sub.desc && (
                              <p className="text-[10px] text-neutral-400 truncate">{sub.desc}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubcategory(sIdx)}
                            className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 mb-3 rounded-xl bg-white/5 text-center text-xs text-neutral-400 border border-dashed border-white/10">
                      No subcategories added yet. Use the form below to add sub-items.
                    </div>
                  )}

                  {/* Add New Subcategory Box */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-300 block flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#DC2626]" /> Add Sub-Dropdown Item
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Subcategory Name (e.g. LED Wall Lamp)"
                        value={newSub.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewSub((p) => ({
                            ...p,
                            name: val,
                            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                          }));
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#090a0d] border border-white/10 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-[#DC2626]"
                      />
                      <input
                        type="text"
                        placeholder="Slug (e.g. led-wall-lamp)"
                        value={newSub.slug}
                        onChange={(e) => setNewSub((p) => ({ ...p, slug: e.target.value }))}
                        className="px-3 py-1.5 rounded-lg bg-[#090a0d] border border-white/10 text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Typology / Description (e.g. Linear Minimalist)"
                        value={newSub.desc}
                        onChange={(e) => setNewSub((p) => ({ ...p, desc: e.target.value }))}
                        className="px-3 py-1.5 rounded-lg bg-[#090a0d] border border-white/10 text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-[#DC2626]"
                      />
                      <input
                        type="text"
                        placeholder="Image URL (e.g. /categories/led-wall-lamp.jpg)"
                        value={newSub.image}
                        onChange={(e) => setNewSub((p) => ({ ...p, image: e.target.value }))}
                        className="px-3 py-1.5 rounded-lg bg-[#090a0d] border border-white/10 text-white text-xs font-mono placeholder-neutral-600 focus:outline-none focus:border-[#DC2626]"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddSubcategory}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-[#DC2626] text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subcategory to List</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                    Cover Image
                  </label>
                  <ImageUploader
                    label="Upload Category Banner Photo"
                    onUploadSuccess={(url) => {
                      setFormData((p) => ({ ...p, image: url }));
                      setImgError(false);
                    }}
                  />

                  {/* Local PC Path Warning */}
                  {isLocalPath(formData.image) && (
                    <div className="mt-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Local Computer Path Detected</span>
                      </div>
                      <p className="text-[11px] text-amber-200/90 leading-relaxed">
                        You entered a private local file path from your computer (<code className="bg-black/40 px-1 py-0.5 rounded font-mono">{formData.image}</code>). Web browsers cannot access files directly from local drives.
                      </p>
                      <p className="text-[11px] text-white font-medium">
                        👉 <strong>How to fix:</strong> Click the <strong>Upload Category Banner Photo</strong> box above, or drag your image file into it so the image is uploaded to the server!
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, image: e.target.value }));
                        setImgError(false);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          try {
                            setUploadingInput(true);
                            const data = new FormData();
                            data.append('file', e.dataTransfer.files[0]);
                            const res = await uploadService.uploadSingle(data);
                            if (res.success && res.file) {
                              setFormData((p) => ({ ...p, image: res.file.url }));
                              setImgError(false);
                              addToast('Image uploaded successfully from dropped file.', 'success');
                            }
                          } catch (err) {
                            addToast('Failed to upload image from dropped file.', 'error');
                          } finally {
                            setUploadingInput(false);
                          }
                        }
                      }}
                      placeholder="Or paste direct image URL (/uploads, Unsplash, CDN)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#090a0d] border border-white/10 text-xs text-white placeholder-neutral-600 font-mono"
                    />
                    {formData.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({ ...p, image: '' }));
                          setImgError(false);
                        }}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Live Preview Box */}
                  {formData.image && (
                    <div className="mt-2 h-36 rounded-xl bg-[#090a0d] border border-white/10 overflow-hidden relative p-1 flex items-center justify-center">
                      {isLocalPath(formData.image) ? (
                        <div className="text-center p-3 text-amber-400/90 text-xs">
                          <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                          <span className="font-semibold block">Local PC path cannot be loaded</span>
                          <span className="text-[10px] text-neutral-400 mt-0.5 block">
                            Please click the upload box above to upload the file to storage
                          </span>
                        </div>
                      ) : imgError ? (
                        <div className="text-center p-3 text-neutral-500 text-xs">
                          <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span>Unable to load image from URL</span>
                        </div>
                      ) : (
                        <img
                          src={formData.image}
                          alt="Category Preview"
                          onError={() => setImgError(true)}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#DC2626] focus:ring-[#DC2626] bg-[#090a0d] border-white/20 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-300 select-none">
                      Display category in navigation menu & public directory
                    </span>
                  </label>
                </div>
              </div>

              {/* Fixed Footer Buttons */}
              <div className="flex items-center justify-end gap-3 p-4 sm:px-6 border-t border-white/10 bg-[#0e1014] shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-luxury text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-luxury flex items-center gap-2 shadow-lg transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Rename Modal */}
      {renameModalOpen && categoryToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (!renameLoading) setRenameModalOpen(false);
            }}
          />

          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden my-auto">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#14171d]">
              <div>
                <span className="text-[10px] uppercase tracking-luxury text-amber-400 font-semibold block">
                  Quick Name Update
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white flex items-center gap-2">
                  <span>{categoryToRename.icon || '💡'}</span>
                  <span>Rename "{categoryToRename.name}"</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
                disabled={renameLoading}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-luxury text-neutral-400 mb-1.5 font-medium">
                  Category Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  placeholder="e.g. Architectural Chandeliers"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090a0d] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {renameName && (
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-neutral-400">
                  <span className="text-neutral-500 block mb-0.5">Updated URL slug will be:</span>
                  <code className="text-amber-300 font-mono">
                    /{renameName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                  </code>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  disabled={renameLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-luxury text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renameLoading || !renameName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-luxury bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {renameLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Save Name</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (!deleteLoading) {
                setDeleteModalOpen(false);
                setCategoryToDelete(null);
              }
            }}
          />

          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif-luxury font-bold text-white mb-1">
                  Delete Category: {categoryToDelete.name}?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to remove this category? It will no longer appear in the catalog dropdown.
                </p>
              </div>
            </div>

            {deleteWarning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Products Found</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {deleteWarning}
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-white text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-[#090a0d] border-white/20 cursor-pointer"
                  />
                  <span>Reassign linked products to another category and delete now</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-luxury text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading || (Boolean(deleteWarning) && !forceDelete)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-luxury bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
