export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  tags: string[];
  images: string[];
  image: string;
  price: number;
  stock: number;
  specifications: Record<string, string>;
  description: string;
  notes: string;
  instructions: string;
  isCocreate: boolean;
  status: 'active' | 'discontinued' | 'draft';
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // CSV-mapped fields
  shortName?: string;
  brand?: string;
  size?: string;
  unit?: string;
  materialDescription?: string;
  bottleType?: string;
  labelSize?: string;
  cfbSize?: string;
  quantity?: number;

  // Legacy fields (optional)
  subcategory?: string;
  packagingType?: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'worker';
  avatar: string;
  email: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'scan' | 'view' | 'edit' | 'create' | 'delete' | 'login' | 'import';
}

export interface RecognitionLog {
  id: string;
  userId: string;
  userName: string;
  productId: string | null;
  productName: string | null;
  confidence: number;
  matched: boolean;
  timestamp: string;
  imageUrl: string;
}

export interface LandingContent {
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  stats: { val: string; label: string }[];
  founderQuote: string;
  founderName: string;
  founderTitle: string;
}

export interface LoginContent {
  title: string;
  subtitle: string;
  adminTabLabel: string;
  workerTabLabel: string;
}
export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalScans: number;
  recognitionRate: number;
  categoriesCount: number;
  workersActive: number;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  total: number;
}

export interface SortConfig {
  key: keyof Product | '';
  direction: 'asc' | 'desc';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface Question {
  id: string;
  userId: string;
  userName: string;
  question: string;
  answer: string | null;
  status: 'pending' | 'answered';
  timestamp: string;
  answeredAt: string | null;
}
