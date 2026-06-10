import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { Product, ActivityLog, RecognitionLog, LandingContent, Question } from '@/types';

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  category: { type: String, default: '' },
  tags: { type: [String], default: [] },
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  specifications: { type: Map, of: String, default: {} },
  description: { type: String, default: '' },
  notes: { type: String, default: '' },
  instructions: { type: String, default: '' },
  isCocreate: { type: Boolean, default: false },
  status: { type: String, default: 'active' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
  createdBy: { type: String, default: 'Admin' },
  shortName: String, brand: String, size: String, unit: String,
  materialDescription: String, bottleType: String, labelSize: String,
  cfbSize: String, quantity: Number, subcategory: String,
  packagingType: String, color: String,
});

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String, userName: String, action: String,
  target: String, timestamp: String, type: { type: String },
});

const RecognitionLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String, userName: String, productId: String,
  productName: String, confidence: Number, matched: Boolean,
  timestamp: String, imageUrl: String,
});

export const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const ActivityLogModel = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
export const RecognitionLogModel = mongoose.models.RecognitionLog || mongoose.model('RecognitionLog', RecognitionLogSchema);

const QuestionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  question: String,
  answer: { type: String, default: null },
  status: { type: String, default: 'pending' },
  timestamp: String,
  answeredAt: { type: String, default: null },
});
export const QuestionModel = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

const LandingContentSchema = new mongoose.Schema({
  id: { type: String, default: 'landing_singleton', unique: true },
  heroTagline: String,
  heroTitle: String,
  heroSubtitle: String,
  stats: [{ val: String, label: String }],
  founderQuote: String,
  founderName: String,
  founderTitle: String,
});
export const LandingContentModel = mongoose.models.LandingContent || mongoose.model('LandingContent', LandingContentSchema);

const LoginContentSchema = new mongoose.Schema({
  id: { type: String, default: 'login_singleton', unique: true },
  title: { type: String, default: 'Welcome Back' },
  subtitle: { type: String, default: 'Sign in to access your workspace.' },
  adminTabLabel: { type: String, default: 'Admin Login' },
  workerTabLabel: { type: String, default: 'Worker Access' },
});
export const LoginContentModel = mongoose.models.LoginContent || mongoose.model('LoginContent', LoginContentSchema);
const ManualSchema = new mongoose.Schema({
  id: { type: String, default: 'manual_singleton', unique: true },
  html: { type: String, default: '' },
  fileName: { type: String, default: '' },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});
export const ManualModel = mongoose.models.Manual || mongoose.model('Manual', ManualSchema);
// ─── CONNECTION ──────────────────────────────────────────────────────────────

let cached = (global as any)._mongoose;
if (!cached) cached = (global as any)._mongoose = { conn: null, promise: null };

let usingMongo = false;

export async function connectDB(): Promise<boolean> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) return false;

  if (cached.conn) return true;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .then(m => { usingMongo = true; return m; })
      .catch(() => null);
  }
  const result = await cached.promise;
  if (result) { cached.conn = result; usingMongo = true; return true; }
  cached.promise = null;
  return false;
}

// ─── JSON FALLBACK (local dev) ───────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), 'database.json');
const defaultLandingContent: LandingContent = {
  heroTagline: "Enterprise Product Intelligence Platform",
  heroTitle: "Intelligent Product\nRecognition & Management",
  heroSubtitle: "Built to simplify operations, train teams faster, and eliminate manual confusion. AI-powered recognition meets enterprise workflow.",
  stats: [
    { val: '16+', label: 'Products Tracked' },
    { val: '97%', label: 'AI Accuracy' },
    { val: '4x', label: 'Faster Training' },
    { val: '24/7', label: 'Always On' },
  ],
  founderQuote: "This system transformed how our team identifies and handles products. What used to take 10 minutes of explanation now takes 2 seconds.",
  founderName: "Tushar Makwana",
  founderTitle: "Founder & Product Lead · PackVision AI"
};

const defaultLoginContent = {
  title: 'Welcome Back',
  subtitle: 'Sign in to access your workspace.',
  adminTabLabel: 'Admin Login',
  workerTabLabel: 'Worker Access',
};

const defaultData = { products: [] as Product[], activityLogs: [] as ActivityLog[], recognitionLogs: [] as RecognitionLog[], questions: [] as Question[], landingContent: defaultLandingContent, loginContent: defaultLoginContent };

async function readJson() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
}

async function writeJson(data: typeof defaultData) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// ─── UNIFIED DB HELPERS ──────────────────────────────────────────────────────
// These are used by all API routes for a clean interface.

export interface DbHelpers {
  getProducts(query?: any): Promise<Product[]>;
  countProducts(query?: any): Promise<number>;
  insertProduct(product: Product): Promise<void>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<void>;
  bulkUpsertProducts(products: Product[]): Promise<void>;

  getActivityLogs(): Promise<ActivityLog[]>;
  insertActivityLog(log: ActivityLog): Promise<void>;

  getRecognitionLogs(): Promise<RecognitionLog[]>;
  insertRecognitionLog(log: RecognitionLog): Promise<void>;

  getLandingContent(): Promise<LandingContent>;
  updateLandingContent(content: LandingContent): Promise<void>;

  getLoginContent(): Promise<any>;
  updateLoginContent(content: any): Promise<void>;

  getQuestions(): Promise<Question[]>;
  insertQuestion(q: Question): Promise<void>;
  updateQuestion(id: string, updates: Partial<Question>): Promise<Question | null>;

  getManual(): Promise<{ html: string; fileName: string } | null>;
  updateManual(html: string, fileName: string): Promise<void>;
}

function stripMongo(doc: any): any {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  // Convert Map (specifications) to plain object
  if (rest.specifications instanceof Map) {
    rest.specifications = Object.fromEntries(rest.specifications);
  }
  return rest;
}

export async function getDb(): Promise<DbHelpers> {
  const mongo = await connectDB();

  if (mongo) {
    // ── MONGO PATH ──
    return {
      async getProducts(query = {}) {
        const docs = await ProductModel.find(query).lean();
        return docs.map(stripMongo);
      },
      async countProducts(query = {}) {
        return ProductModel.countDocuments(query);
      },
      async insertProduct(product) {
        await ProductModel.create(product);
      },
      async updateProduct(id, updates) {
        const doc = await ProductModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
        return doc ? stripMongo(doc) : null;
      },
      async deleteProduct(id) {
        await ProductModel.deleteOne({ id });
      },
      async bulkUpsertProducts(products) {
        const ops = products.map(p => ({ updateOne: { filter: { code: p.code }, update: { $set: p }, upsert: true } }));
        if (ops.length > 0) await ProductModel.bulkWrite(ops);
      },
      async getActivityLogs() {
        const docs = await ActivityLogModel.find({}).sort({ timestamp: -1 }).limit(1000).lean();
        return docs.map(stripMongo);
      },
      async insertActivityLog(log) {
        await ActivityLogModel.create(log);
      },
      async getRecognitionLogs() {
        const docs = await RecognitionLogModel.find({}).sort({ timestamp: -1 }).limit(1000).lean();
        return docs.map(stripMongo);
      },
      async insertRecognitionLog(log) {
        await RecognitionLogModel.create(log);
      },
      async getLandingContent() {
        const doc = await LandingContentModel.findOne({ id: 'landing_singleton' }).lean();
        if (!doc) {
          await LandingContentModel.create({ id: 'landing_singleton', ...defaultLandingContent });
          return defaultLandingContent;
        }
        return stripMongo(doc) as LandingContent;
      },
      async updateLandingContent(content) {
        await LandingContentModel.findOneAndUpdate(
          { id: 'landing_singleton' },
          { ...content },
          { upsert: true, new: true }
        );
      },
      async getQuestions() {
        const docs = await QuestionModel.find({}).sort({ timestamp: -1 }).lean();
        return docs.map(stripMongo);
      },
      async insertQuestion(q) {
        await QuestionModel.create(q);
      },
      async updateQuestion(id, updates) {
        const doc = await QuestionModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
        return doc ? stripMongo(doc) : null;
      },
      async getManual() {
        const doc = await ManualModel.findOne({ id: 'manual_singleton' }).lean();
        return doc ? { html: doc.html, fileName: doc.fileName } : null;
      },
      async updateManual(html, fileName) {
        await ManualModel.findOneAndUpdate(
          { id: 'manual_singleton' },
          { html, fileName, updatedAt: new Date().toISOString() },
          { upsert: true }
        );
      },
      async getLoginContent() {
        const doc = await LoginContentModel.findOne({ id: 'login_singleton' }).lean();
        if (!doc) {
          await LoginContentModel.create({ id: 'login_singleton', ...defaultLoginContent });
          return defaultLoginContent;
        }
        return stripMongo(doc);
      },
      async updateLoginContent(content) {
        await LoginContentModel.findOneAndUpdate(
          { id: 'login_singleton' },
          { ...content },
          { upsert: true, new: true }
        );
      },
    };
  } else {
    // ── JSON FALLBACK PATH ──
    return {
      async getProducts(query = {}) {
        const db = await readJson();
        let products: Product[] = db.products || [];
        if (query.$or) {
          products = products.filter((p: Product) => {
            const q = query.$or[0].name?.source?.replace('(?:)', '') || '';
            if (!q) return true;
            const lq = q.toLowerCase().replace(/\\i$/, '');
            return p.name?.toLowerCase().includes(lq) || p.code?.toLowerCase().includes(lq) || p.category?.toLowerCase().includes(lq);
          });
        }
        if (query.category) products = products.filter((p: Product) => p.category === query.category);
        if (query.status) products = products.filter((p: Product) => p.status === query.status);
        if (query.isCocreate !== undefined) products = products.filter((p: Product) => p.isCocreate === query.isCocreate);
        return products;
      },
      async countProducts(query = {}) {
        const db = await readJson();
        return (db.products || []).length;
      },
      async insertProduct(product) {
        const db = await readJson();
        db.products = [product, ...(db.products || [])];
        await writeJson(db);
      },
      async updateProduct(id, updates) {
        const db = await readJson();
        const idx = (db.products || []).findIndex((p: Product) => p.id === id);
        if (idx === -1) return null;
        db.products[idx] = { ...db.products[idx], ...updates };
        await writeJson(db);
        return db.products[idx];
      },
      async deleteProduct(id) {
        const db = await readJson();
        db.products = (db.products || []).filter((p: Product) => p.id !== id);
        await writeJson(db);
      },
      async bulkUpsertProducts(products) {
        const db = await readJson();
        const codeMap = new Map<string, number>((db.products || []).map((p: Product, i: number) => [p.code, i] as [string, number]));
        for (const p of products) {
          if (codeMap.has(p.code)) {
            const idx = codeMap.get(p.code) as number;
            db.products[idx] = { ...db.products[idx], ...p };
          } else {
            db.products.unshift(p);
          }
        }
        await writeJson(db);
      },
      async getActivityLogs() {
        const db = await readJson();
        return (db.activityLogs || []).slice(0, 1000);
      },
      async insertActivityLog(log) {
        const db = await readJson();
        db.activityLogs = [log, ...(db.activityLogs || [])].slice(0, 1000);
        await writeJson(db);
      },
      async getRecognitionLogs() {
        const db = await readJson();
        return (db.recognitionLogs || []).slice(0, 1000);
      },
      async insertRecognitionLog(log) {
        const db = await readJson();
        db.recognitionLogs = [log, ...(db.recognitionLogs || [])].slice(0, 1000);
        await writeJson(db);
      },
      async getLandingContent() {
        const db = await readJson();
        return db.landingContent || defaultLandingContent;
      },
      async updateLandingContent(content) {
        const db = await readJson();
        db.landingContent = content;
        await writeJson(db);
      },
      async getQuestions() {
        const db = await readJson();
        return db.questions || [];
      },
      async insertQuestion(q) {
        const db = await readJson();
        db.questions = [q, ...(db.questions || [])];
        await writeJson(db);
      },
      async updateQuestion(id, updates) {
        const db = await readJson();
        const idx = (db.questions || []).findIndex((q: Question) => q.id === id);
        if (idx === -1) return null;
        db.questions[idx] = { ...db.questions[idx], ...updates };
        await writeJson(db);
        return db.questions[idx];
      },
      async getManual() {
        const db = await readJson();
        return db.manual || null;
      },
      async updateManual(html, fileName) {
        const db = await readJson();
        db.manual = { html, fileName, updatedAt: new Date().toISOString() };
        await writeJson(db);
      },
      async getLoginContent() {
        const db = await readJson();
        return db.loginContent || defaultLoginContent;
      },
      async updateLoginContent(content) {
        const db = await readJson();
        db.loginContent = content;
        await writeJson(db);
      },
    };
  }
}
