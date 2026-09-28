import React, { useState } from 'react';
import {
  Layers,
  Package,
  PenLine,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { categoryService, uploadService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ImageUploader } from './ImageUploader';

export const CategorySelectorWithOptions = ({
  categories = [],
  selectedCategoryId = '',
  onSelectCategory,
  selectedSubcategory = '',
  onSelectSubcategory,
  onCategoriesChanged,
  disabled = false,
}) => {
  const { addToast } = useToast();

  const selectedCategoryObj = categories.find((c) => c._id === selectedCategoryId) || null;
  const availableSubcategories =
    selectedCategoryObj?.subcategories?.filter((s) => s.isActive !== false) || [];
  const selectedSubObj = availableSubcategories.find((s) => s.slug === selectedSubcategory) || null;

  // ── Modals State ──
  // 1. Rename Category
  const [renameCatOpen, setRenameCatOpen] = useState(false);
  const [renameCatName, setRenameCatName] = useState('');
  const [renamingCatLoading, setRenamingCatLoading] = useState(false);

  // 2. Full Edit Category
  const [editCatOpen, setEditCatOpen] = useState(false);
  const [editCatData, setEditCatData] = useState({
    name: '',
    slug: '',
    icon: '💡',
    tag: '',
    description: '',
    image: '',
  });
  const [editCatLoading, setEditCatLoading] = useState(false);

  // 3. Delete Category
  const [deleteCatOpen, setDeleteCatOpen] = useState(false);
  const [deleteCatLoading, setDeleteCatLoading] = useState(false);
  const [deleteCatWarning, setDeleteCatWarning] = useState('');
  const [forceDeleteCat, setForceDeleteCat] = useState(false);

  // 4. Create New Category
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [createCatData, setCreateCatData] = useState({
    name: '',
    slug: '',
    icon: '💡',
    tag: '',
    description: '',
  });
  const [createCatLoading, setCreateCatLoading] = useState(false);

  // 5. Subcategory Modals
  const [createSubOpen, setCreateSubOpen] = useState(false);
  const [createSubName, setCreateSubName] = useState('');
  const [createSubDesc, setCreateSubDesc] = useState('');
  const [createSubLoading, setCreateSubLoading] = useState(false);

  const [renameSubOpen, setRenameSubOpen] = useState(false);
  const [renameSubName, setRenameSubName] = useState('');
  const [renameSubLoading, setRenameSubLoading] = useState(false);

  const [deleteSubOpen, setDeleteSubOpen] = useState(false);
  const [deleteSubLoading, setDeleteSubLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // CATEGORY ACTIONS
  // ─────────────────────────────────────────────────────────────

  // Open Rename Category Modal
  const openRenameCat = () => {
    if (!selectedCategoryObj) {
      addToast('Please select a category first to rename.', 'error');
      return;
    }
    setRenameCatName(selectedCategoryObj.name || '');
    setRenameCatOpen(true);
  };

  const handleRenameCatSubmit = async (e) => {
    e.preventDefault();
    if (!renameCatName.trim()) {
      addToast('Category name cannot be empty.', 'error');
      return;
    }
    try {
      setRenamingCatLoading(true);
      const res = await categoryService.renameCategory(selectedCategoryObj._id, {
        name: renameCatName.trim(),
      });
      if (res.success) {
        addToast(`Category renamed to "${res.category?.name || renameCatName.trim()}".`, 'success');
        setRenameCatOpen(false);
        if (onCategoriesChanged) await onCategoriesChanged();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rename category.', 'error');
    } finally {
      setRenamingCatLoading(false);
    }
  };

  // Open Full Edit Category Modal
  const openFullEditCat = () => {
    if (!selectedCategoryObj) {
      addToast('Please select a category first to edit.', 'error');
      return;
    }
    setEditCatData({
      name: selectedCategoryObj.name || '',
      slug: selectedCategoryObj.slug || '',
      icon: selectedCategoryObj.icon || '💡',
      tag: selectedCategoryObj.tag || '',
      description: selectedCategoryObj.description || '',
      image: selectedCategoryObj.image || '',
    });
    setEditCatOpen(true);
  };

  const handleEditCatSubmit = async (e) => {
    e.preventDefault();
    if (!editCatData.name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }
    try {
      setEditCatLoading(true);
      const res = await categoryService.updateCategory(selectedCategoryObj._id, editCatData);
      if (res.success) {
        addToast(`Category "${editCatData.name}" updated successfully.`, 'success');
        setEditCatOpen(false);
        if (onCategoriesChanged) await onCategoriesChanged();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update category.', 'error');
    } finally {
      setEditCatLoading(false);
    }
  };

  // Open Delete Category Modal
  const openDeleteCat = () => {
    if (!selectedCategoryObj) {
      addToast('Please select a category first to delete.', 'error');
      return;
    }
    setDeleteCatWarning('');
    setForceDeleteCat(false);
    setDeleteCatOpen(true);
  };

  const handleDeleteCatSubmit = async () => {
    if (!selectedCategoryObj) return;
    try {
      setDeleteCatLoading(true);
      const res = await categoryService.deleteCategory(selectedCategoryObj._id, forceDeleteCat);
      if (res.success) {
        addToast(`Category "${selectedCategoryObj.name}" removed successfully.`, 'info');
        setDeleteCatOpen(false);
        setDeleteCatWarning('');
        setForceDeleteCat(false);
        if (onCategoriesChanged) {
          const updated = await onCategoriesChanged();
          if (Array.isArray(updated) && updated.length > 0) {
            onSelectCategory(updated[0]._id);
          } else {
            onSelectCategory('');
          }
        }
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.hasProducts) {
        setDeleteCatWarning(
          data.message ||
            `This category has ${data.productsCount || 'associated'} products. Check "Force delete" below to proceed.`
        );
      } else {
        addToast(data?.message || 'Failed to delete category.', 'error');
      }
    } finally {
      setDeleteCatLoading(false);
    }
  };

  // Open Create Category Modal
  const openCreateCat = () => {
    setCreateCatData({
      name: '',
      slug: '',
      icon: '💡',
      tag: '',
      description: '',
    });
    setCreateCatOpen(true);
  };

  const handleCreateCatSubmit = async (e) => {
    e.preventDefault();
    if (!createCatData.name.trim()) {
      addToast('Category name is required.', 'error');
      return;
    }
    try {
      setCreateCatLoading(true);
      const res = await categoryService.createCategory(createCatData);
      if (res.success && res.category) {
        addToast(`New category "${res.category.name}" created!`, 'success');
        setCreateCatOpen(false);
        if (onCategoriesChanged) {
          await onCategoriesChanged();
        }
        onSelectCategory(res.category._id);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create category.', 'error');
    } finally {
      setCreateCatLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SUBCATEGORY ACTIONS
  // ─────────────────────────────────────────────────────────────

  // Add Subcategory
  const openCreateSub = () => {
    if (!selectedCategoryObj) {
      addToast('Please select a category first before adding subcategories.', 'error');
      return;
    }
    setCreateSubName('');
    setCreateSubDesc('');
    setCreateSubOpen(true);
  };

  const handleCreateSubSubmit = async (e) => {
    e.preventDefault();
    if (!createSubName.trim()) {
      addToast('Subcategory name is required.', 'error');
      return;
    }
    try {
      setCreateSubLoading(true);
      const res = await categoryService.addSubcategory(selectedCategoryObj._id, {
        name: createSubName.trim(),
        desc: createSubDesc.trim(),
      });
      if (res.success && res.subcategory) {
        addToast(`Subcategory "${res.subcategory.name}" added to ${selectedCategoryObj.name}!`, 'success');
        setCreateSubOpen(false);
        if (onCategoriesChanged) await onCategoriesChanged();
        onSelectSubcategory(res.subcategory.slug, res.subcategory.name);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add subcategory.', 'error');
    } finally {
      setCreateSubLoading(false);
    }
  };

  // Rename Subcategory
  const openRenameSub = () => {
    if (!selectedSubObj) {
      addToast('Please select a subcategory first to rename.', 'error');
      return;
    }
    setRenameSubName(selectedSubObj.name || '');
    setRenameSubOpen(true);
  };

  const handleRenameSubSubmit = async (e) => {
    e.preventDefault();
    if (!renameSubName.trim()) {
      addToast('Subcategory name cannot be empty.', 'error');
      return;
    }
    try {
      setRenameSubLoading(true);
      const res = await categoryService.updateSubcategory(
        selectedCategoryObj._id,
        selectedSubObj._id,
        { name: renameSubName.trim() }
      );
      if (res.success && res.subcategory) {
        addToast(`Subcategory renamed to "${res.subcategory.name}".`, 'success');
        setRenameSubOpen(false);
        if (onCategoriesChanged) await onCategoriesChanged();
        onSelectSubcategory(res.subcategory.slug, res.subcategory.name);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rename subcategory.', 'error');
    } finally {
      setRenameSubLoading(false);
    }
  };

  // Delete Subcategory
  const openDeleteSub = () => {
    if (!selectedSubObj) {
      addToast('Please select a subcategory first to delete.', 'error');
      return;
    }
    setDeleteSubOpen(true);
  };

  const handleDeleteSubSubmit = async () => {
    if (!selectedSubObj || !selectedCategoryObj) return;
    try {
      setDeleteSubLoading(true);
      const res = await categoryService.deleteSubcategory(
        selectedCategoryObj._id,
        selectedSubObj._id
      );
      if (res.success) {
        addToast(`Subcategory "${selectedSubObj.name}" deleted.`, 'info');
        setDeleteSubOpen(false);
        if (onCategoriesChanged) await onCategoriesChanged();
        onSelectSubcategory('', '');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete subcategory.', 'error');
    } finally {
      setDeleteSubLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* ── STEP 1: CATEGORY SELECTION + ACTION BUTTONS ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Product Category</span>
            <span className="text-[#DC2626]">*</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">Step 1</span>
        </div>

        {/* The Native Styled Category Dropdown */}
        <select
          value={selectedCategoryId}
          onChange={(e) => onSelectCategory(e.target.value)}
          disabled={disabled}
          required
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#DC2626] focus:outline-none transition-all text-sm font-medium cursor-pointer"
        >
          <option value="" disabled className="bg-[#14171d] text-neutral-500">
            Select a category...
          </option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id} className="bg-[#14171d] text-white">
              {cat.icon || '💡'} {cat.name}
            </option>
          ))}
        </select>

        {/* ── Dedicated Category Options Toolbar (Rename, Update, Delete, +New) ── */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {/* 1. Rename Option */}
          <button
            type="button"
            onClick={openRenameCat}
            disabled={!selectedCategoryObj || disabled}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Quick rename this category name"
          >
            <PenLine className="w-3 h-3 text-amber-400" />
            <span>Rename</span>
          </button>

          {/* 2. Full Update Option */}
          <button
            type="button"
            onClick={openFullEditCat}
            disabled={!selectedCategoryObj || disabled}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Full category details & cover image editor"
          >
            <Edit className="w-3 h-3 text-blue-400" />
            <span>Update</span>
          </button>

          {/* 3. Delete Option */}
          <button
            type="button"
            onClick={openDeleteCat}
            disabled={!selectedCategoryObj || disabled}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Delete this category"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
            <span>Delete</span>
          </button>

          {/* 4. Add Brand New Category */}
          <button
            type="button"
            onClick={openCreateCat}
            disabled={disabled}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-1 transition-all"
            title="Create a new category right here"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>+ New Category</span>
          </button>
        </div>

        <p className="text-[11px] text-neutral-400">
          Selected: <strong className="text-white">{selectedCategoryObj?.name || 'None'}</strong> (slug: /{selectedCategoryObj?.slug || '-'})
        </p>
      </div>

      {/* ── STEP 2: SUBCATEGORY SELECTION + ACTION BUTTONS ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Subcategory / Type Option</span>
          </label>
          <span className="text-[10px] text-neutral-400 font-mono">Step 2</span>
        </div>

        {/* Subcategory Dropdown */}
        <select
          value={selectedSubcategory}
          onChange={(e) => {
            const subSlug = e.target.value;
            const matched = availableSubcategories.find((s) => s.slug === subSlug);
            onSelectSubcategory(subSlug, matched ? matched.name : (subSlug ? subSlug.replace(/-/g, ' ').toUpperCase() : ''));
          }}
          disabled={disabled || !selectedCategoryObj}
          className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[#DC2626] focus:outline-none transition-all text-sm font-medium cursor-pointer"
        >
          <option value="" className="bg-[#14171d] text-neutral-400">
            -- Direct in {selectedCategoryObj?.name || 'Category'} (General / No Subcategory) --
          </option>
          {availableSubcategories.map((sub) => (
            <option key={sub.slug} value={sub.slug} className="bg-[#14171d] text-white">
              {sub.name}
            </option>
          ))}
        </select>

        {/* Subcategory Options Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {/* Add Subcategory */}
          <button
            type="button"
            onClick={openCreateSub}
            disabled={!selectedCategoryObj || disabled}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center gap-1 transition-all disabled:opacity-40 disabled:pointer-events-none"
            title="Add a new subcategory inside this category"
          >
            <Plus className="w-3 h-3 text-emerald-400" />
            <span>+ Add Subcategory</span>
          </button>

          {/* Rename Subcategory */}
          {selectedSubObj && (
            <button
              type="button"
              onClick={openRenameSub}
              disabled={disabled}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 flex items-center gap-1 transition-all"
              title="Rename selected subcategory"
            >
              <PenLine className="w-3 h-3 text-amber-400" />
              <span>Rename Sub</span>
            </button>
          )}

          {/* Delete Subcategory */}
          {selectedSubObj && (
            <button
              type="button"
              onClick={openDeleteSub}
              disabled={disabled}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 flex items-center gap-1 transition-all"
              title="Remove selected subcategory"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Delete Sub</span>
            </button>
          )}
        </div>

        <p className="text-[11px] text-neutral-400">
          {availableSubcategories.length > 0
            ? `${availableSubcategories.length} sub-items available in ${selectedCategoryObj?.name || 'category'}.`
            : 'No subcategories yet. Click "+ Add Subcategory" to add one.'}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────── */}

      {/* 1. Quick Rename Category Modal */}
      {renameCatOpen && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Quick Rename Category
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white flex items-center gap-2">
                  <span>{selectedCategoryObj.icon || '💡'}</span>
                  <span>{selectedCategoryObj.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameCatOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameCatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  New Category Name *
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={renameCatName}
                  onChange={(e) => setRenameCatName(e.target.value)}
                  placeholder="e.g. Antique Chandeliers"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {renameCatName && (
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-[11px] text-neutral-400">
                  <span className="text-neutral-500 block mb-0.5">Updated URL slug:</span>
                  <code className="text-amber-300 font-mono">
                    /{renameCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                  </code>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameCatOpen(false)}
                  disabled={renamingCatLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renamingCatLoading || !renameCatName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  {renamingCatLoading ? (
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

      {/* 2. Full Edit Category Modal */}
      {editCatOpen && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold block">
                  Update Category Details
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white flex items-center gap-2">
                  <span>{editCatData.icon || '💡'}</span>
                  <span>{editCatData.name}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditCatOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditCatSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatData.name}
                    onChange={(e) => setEditCatData({ ...editCatData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                    Emoji / Icon
                  </label>
                  <input
                    type="text"
                    value={editCatData.icon}
                    onChange={(e) => setEditCatData({ ...editCatData, icon: e.target.value })}
                    placeholder="💡"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs text-center focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editCatData.slug}
                  onChange={(e) => setEditCatData({ ...editCatData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={editCatData.tag}
                  onChange={(e) => setEditCatData({ ...editCatData, tag: e.target.value })}
                  placeholder="e.g. Grand Statements"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editCatData.description}
                  onChange={(e) => setEditCatData({ ...editCatData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={editCatData.image}
                  onChange={(e) => setEditCatData({ ...editCatData, image: e.target.value })}
                  placeholder="/categories/chandelier.jpg"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditCatOpen(false)}
                  disabled={editCatLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editCatLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold uppercase bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {editCatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Category Modal */}
      {deleteCatOpen && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif-luxury font-bold text-white mb-1">
                  Delete Category: {selectedCategoryObj.name}?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to remove this category from the system?
                </p>
              </div>
            </div>

            {deleteCatWarning && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Products Found</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {deleteCatWarning}
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1 text-white text-[11px] font-medium">
                  <input
                    type="checkbox"
                    checked={forceDeleteCat}
                    onChange={(e) => setForceDeleteCat(e.target.checked)}
                    className="w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-[#090a0d] border-white/20 cursor-pointer"
                  />
                  <span>Reassign linked products to another category and delete</span>
                </label>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCatOpen(false)}
                disabled={deleteCatLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCatSubmit}
                disabled={deleteCatLoading || (Boolean(deleteCatWarning) && !forceDeleteCat)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleteCatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Create Brand New Category Modal */}
      {createCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Quick Create
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white">
                  Add New Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateCatOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCatSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Track Light"
                    value={createCatData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCreateCatData({
                        ...createCatData,
                        name: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={createCatData.icon}
                    onChange={(e) => setCreateCatData({ ...createCatData, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs text-center focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={createCatData.slug}
                  onChange={(e) => setCreateCatData({ ...createCatData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={createCatData.tag}
                  onChange={(e) => setCreateCatData({ ...createCatData, tag: e.target.value })}
                  placeholder="e.g. Modern Magnetic Systems"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateCatOpen(false)}
                  disabled={createCatLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCatLoading || !createCatData.name.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {createCatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Subcategory Modal */}
      {createSubOpen && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                  Add Subcategory inside {selectedCategoryObj.name}
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white">
                  New Sub-Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateSubOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Modern LED Ring"
                  value={createSubName}
                  onChange={(e) => setCreateSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  Description / Typology (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brushed Gold Geometric Pendant"
                  value={createSubDesc}
                  onChange={(e) => setCreateSubDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateSubOpen(false)}
                  disabled={createSubLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubLoading || !createSubName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold uppercase bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {createSubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add Subcategory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Rename Subcategory Modal */}
      {renameSubOpen && selectedSubObj && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Rename Subcategory
                </span>
                <h3 className="text-base font-serif-luxury font-bold text-white">
                  {selectedSubObj.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRenameSubOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRenameSubSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 font-semibold">
                  New Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={renameSubName}
                  onChange={(e) => setRenameSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRenameSubOpen(false)}
                  disabled={renameSubLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renameSubLoading || !renameSubName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold uppercase bg-amber-500 hover:bg-amber-400 text-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
                >
                  {renameSubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Name</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Subcategory Modal */}
      {deleteSubOpen && selectedSubObj && selectedCategoryObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-serif-luxury font-bold text-white mb-1">
                  Delete Subcategory: {selectedSubObj.name}?
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to remove this subcategory from {selectedCategoryObj.name}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteSubOpen(false)}
                disabled={deleteSubLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold uppercase text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubSubmit}
                disabled={deleteSubLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                {deleteSubLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
