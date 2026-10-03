import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import CatalogItem from '../models/CatalogItem.js';
import HomepageSection from '../models/HomepageSection.js';
import SiteSettings from '../models/SiteSettings.js';
import { stripE27 } from '../utils/stripE27.js';
import { normalizeLegacySlug } from '../utils/legacySlug.js';

const MODELS = [Category, Product, CatalogItem, HomepageSection, SiteSettings];

// Recursively apply `transform` to every string in a document; returns [newValue, changed]
const rewrite = (value, transform) => {
  if (typeof value === 'string') {
    const next = transform(value);
    return [next, next !== value];
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((v) => {
      const [n, c] = rewrite(v, transform);
      changed ||= c;
      return n;
    });
    return [next, changed];
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    let changed = false;
    const next = {};
    for (const [k, v] of Object.entries(value)) {
      const [n, c] = rewrite(v, transform);
      next[k] = n;
      changed ||= c;
    }
    return [next, changed];
  }
  return [value, false];
};

// Run a string transform over every stored document once per database (tracked in `migrations`)
const runStringMigration = async (id, transform) => {
  const migrations = mongoose.connection.db.collection('migrations');
  if (await migrations.findOne({ _id: id })) return;

  let updated = 0;
  for (const Model of MODELS) {
    const docs = await Model.collection.find({}).toArray();
    for (const doc of docs) {
      const $set = {};
      for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') continue;
        const [next, changed] = rewrite(value, transform);
        if (changed) $set[key] = next;
      }
      if (!Object.keys($set).length) continue;
      try {
        await Model.collection.updateOne({ _id: doc._id }, { $set });
        updated += 1;
      } catch (err) {
        // e.g. the cleaned slug already exists: keep this document as it was
        console.warn(`[Migrate] ${id}: skipped ${Model.modelName} ${doc._id}: ${err.message}`);
      }
    }
  }

  await migrations.insertOne({ _id: id, updated, appliedAt: new Date() });
  console.log(`[Migrate] ${id}: updated ${updated} documents.`);
};

// One-time removal of the "E27" label from stored data:
// 1. visible text (names, descriptions, specs, SEO fields)
// 2. slugs and image paths (e27-wall-lamp -> classic-wall-lamp, lh-...-e27-pendant -> lh-...-pendant)
export const removeE27Text = async () => {
  await runStringMigration('remove-e27-text-v1', stripE27);
  await runStringMigration('remove-e27-slugs-v1', normalizeLegacySlug);
};
