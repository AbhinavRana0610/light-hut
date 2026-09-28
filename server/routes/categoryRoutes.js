import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../controllers/categoryController.js';
import { getCatalogDropdown } from '../controllers/catalogController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ============================================================================
 * 🌐 PUBLIC ROUTES
 * ============================================================================
 */
// GET /api/categories/dropdown - Direct alias for catalog & category dropdown hierarchy
router.get('/dropdown', getCatalogDropdown);

// Category Listings
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

/**
 * ============================================================================
 * 🔐 PROTECTED ADMIN ROUTES (Category & Sub-Dropdown CRUD)
 * ============================================================================
 */
router.post('/', protectAdmin, createCategory);
router.put('/reorder', protectAdmin, reorderCategories);
router.put('/:id', protectAdmin, updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);

// Dedicated Sub-Dropdown (Subcategories) Management Routes
router.post('/:id/subcategories', protectAdmin, addSubcategory);
router.put('/:id/subcategories/:subId', protectAdmin, updateSubcategory);
router.delete('/:id/subcategories/:subId', protectAdmin, deleteSubcategory);

export default router;
