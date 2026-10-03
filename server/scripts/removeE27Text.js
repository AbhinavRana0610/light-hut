import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import CatalogItem from '../models/CatalogItem.js';
import HomepageSection from '../models/HomepageSection.js';
import SiteSettings from '../models/SiteSettings.js';
import { stripE27 } from '../utils/stripE27.js';

const MIGRATION_ID = 'remove-e27-text-v1';

// Recursively apply stripE27 to every string in a document; returns [newValue, changed]
const clean = (value) => {
  if (typeof value === 'string') {
    const next = stripE27(value);
    return [next, next !== value];
  }
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((v) => {
      const [n, c] = clean(v);
      changed ||= c;
      return n;
    });
    return [next, changed];
  }
  if (value && typeof value === 'object' && value.constructor === Object) {
    let changed = false;
    const next = {};
    for (const [k, v] of Object.entries(value)) {
      const [n, c] = clean(v);
      next[k] = n;
      changed ||= c;
    }
    return [next, changed];
  }
  return [value, false];
};

// One-time cleanup of the "E27" label from text already stored in the database
// (names, descriptions, specs, SEO fields). Slugs and image paths are lowercase and untouched.
export const removeE27Text = async () => {
  const migrations = mongoose.connection.db.collection('migrations');
  if (await migrations.findOne({ _id: MIGRATION_ID })) return;

  let updated = 0;
  for (const Model of [Category, Product, CatalogItem, HomepageSection, SiteSettings]) {
    const docs = await Model.collection.find({}).toArray();
    for (const doc of docs) {
      const $set = {};
      for (const [key, value] of Object.entries(doc)) {
        if (key === '_id') continue;
        const [next, changed] = clean(value);
        if (changed) $set[key] = next;
      }
      if (Object.keys($set).length) {
        await Model.collection.updateOne({ _id: doc._id }, { $set });
        updated += 1;
      }
    }
  }

  await migrations.insertOne({ _id: MIGRATION_ID, updated, appliedAt: new Date() });
  console.log(`[Migrate] Removed E27 text from ${updated} documents.`);
};
