import express from 'express';
import {
  getCatalog,
  getCatalogDropdown,
  getCatalogOptions,
} from '../controllers/catalogController.js';

const router = express.Router();

/**
 * ============================================================================
 * 💡 CATALOG API ROUTES
 * ============================================================================
 */

// @route   GET /api/catalog/dropdown
// @desc    Catalog & Category Dropdown Menu ke liye hierarchical dynamic tree data
// @access  Public
router.get('/dropdown', getCatalogDropdown);

// @route   GET /api/catalog/options
// @desc    Catalog Page ke saare Dropdown Options (Categories, Subcategories, Finishes, Materials, CCT, IP, Wattage, Price Range, Sort)
// @access  Public
router.get('/options', getCatalogOptions);

// @route   GET /api/catalog
// @desc    Catalog listing page ke products, category filters, search aur pagination
// @access  Public
router.get('/', getCatalog);

export default router;
