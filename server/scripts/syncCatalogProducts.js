import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { LED_HANGING_LAMPS } from './data/ledHangingLamps.js';
import { WALL_LAMPS } from './data/wallLamps.js';
import { E27_HANGING_LAMPS } from './data/e27HangingLamps.js';
import { OUTDOOR_LAMPS } from './data/outdoorLamps.js';

// Bump this when new catalogue data files are added so existing databases pick them up once.
const MIGRATION_ID = 'catalog-2609-products-v1';

// Insert catalogue products that are missing from an already-seeded database.
// Seeding only runs on an empty DB, so databases created before the catalogue data
// existed (e.g. production) would otherwise never get these products.
// Insert-only (never updates or deletes) and runs once per database, so later admin
// edits and deletions are respected.
export const syncCatalogProducts = async () => {
  const migrations = mongoose.connection.db.collection('migrations');
  if (await migrations.findOne({ _id: MIGRATION_ID })) return;

  const catalog = [
    ...WALL_LAMPS,
    ...LED_HANGING_LAMPS.map((p) => ({ categorySlug: 'led-hanging-lamp', ...p })),
    ...E27_HANGING_LAMPS,
    ...OUTDOOR_LAMPS,
  ];

  const categories = await Category.find({}, 'slug').lean();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const existing = await Product.find({}, 'slug sku').lean();
  const slugs = new Set(existing.map((p) => p.slug));
  const skus = new Set(existing.map((p) => p.sku).filter(Boolean));

  const missing = [];
  const skippedCategories = new Set();
  for (const { categorySlug, ...p } of catalog) {
    if (slugs.has(p.slug) || (p.sku && skus.has(p.sku))) continue;
    if (!catMap[categorySlug]) {
      skippedCategories.add(categorySlug);
      continue;
    }
    missing.push({ ...p, category: catMap[categorySlug] });
  }

  if (missing.length) {
    await Product.insertMany(missing, { ordered: false });
  }
  if (skippedCategories.size) {
    console.warn(`[Sync] Skipped products for missing categories: ${[...skippedCategories].join(', ')}`);
  }
  await migrations.insertOne({ _id: MIGRATION_ID, inserted: missing.length, appliedAt: new Date() });
  console.log(`[Sync] Catalogue sync applied: ${missing.length} missing products inserted.`);
};
