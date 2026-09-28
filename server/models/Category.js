import mongoose from 'mongoose';

/**
 * ============================================================================
 * 🌿 Subcategory Schema (Sub-Dropdown Items)
 * ============================================================================
 * Har Category ke andar multiple Subcategories ho sakti hain.
 * Inhe admin panel se create, edit aur delete kiya ja sakta hai.
 */
const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      maxlength: [120, 'Subcategory name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Subcategory slug is required'],
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    desc: {
      type: String,
      trim: true,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

/**
 * ============================================================================
 * 🏛️ Master Category Schema
 * ============================================================================
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '💡',
    },
    tag: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    subcategories: {
      type: [subcategorySchema],
      default: [],
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: '',
    },
    seoDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for counting products in this category
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
