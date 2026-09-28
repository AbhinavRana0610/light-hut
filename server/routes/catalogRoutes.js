import express from 'express';
import { getCatalog, getCatalogDropdown } from '../controllers/catalogController.js';

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

// @route   GET /api/catalog
// @desc    Catalog listing page ke products, category filters, search aur pagination
// @access  Public
router.get('/', getCatalog);

export default router;
