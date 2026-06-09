'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, User, ActivityLog, RecognitionLog, LandingContent, Question } from '@/types';

interface AppState {
  user: User | null;
  products: Product[];
  activityLogs: ActivityLog[];
  recognitionLogs: RecognitionLog[];
  questions: Question[];
  landingContent: LandingContent | null;
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  manualHtml: string | null;
  manualFileName: string | null;

  setUser: (user: User | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setManual: (html: string | null, name: string | null) => void;
  
  // API actions
  fetchData: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addActivityLog: (log: ActivityLog) => Promise<void>;
  addRecognitionLog: (log: RecognitionLog) => Promise<void>;
  fetchLandingContent: () => Promise<void>;
  updateLandingContent: (content: LandingContent) => Promise<void>;
  addQuestion: (q: Question) => Promise<void>;
  answerQuestion: (id: string, answer: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      products: [],
      activityLogs: [],
      recognitionLogs: [],
      questions: [],
      landingContent: null,
      theme: 'dark',
      sidebarOpen: true,
      manualHtml: null,
      manualFileName: null,

      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setManual: (manualHtml, manualFileName) => set({ manualHtml, manualFileName }),

      fetchData: async () => {
        try {
          // Fetch all products (no limit = return all)
          const [productsRes, activityRes, recognitionRes, questionsRes] = await Promise.all([
            fetch('/api/products?limit=0').then(res => res.json()),
            fetch('/api/activity').then(res => res.json()),
            fetch('/api/recognition').then(res => res.json()),
            fetch('/api/questions').then(res => res.json()),
          ]);
          set({
            // API returns { products: [...], total, page, limit }
            products: Array.isArray(productsRes) ? productsRes : (productsRes?.products || []),
            activityLogs: Array.isArray(activityRes) ? activityRes : (activityRes?.activityLogs || activityRes || []),
            recognitionLogs: Array.isArray(recognitionRes) ? recognitionRes : (recognitionRes?.recognitionLogs || recognitionRes || []),
            questions: Array.isArray(questionsRes) ? questionsRes : (questionsRes?.questions || []),
          });
        } catch (error) {
          console.error("Failed to fetch data:", error);
        }
      },

      addProduct: async (product) => {
        try {
          await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
          });
          set((s) => ({ products: [product, ...s.products] }));
          get().addActivityLog({
            id: `AL-${Date.now()}`,
            userId: get().user?.id || 'System',
            userName: get().user?.name || 'System',
            action: 'created product',
            target: product.code,
            timestamp: new Date().toISOString(),
            type: 'create',
          });
        } catch (error) {
          console.error("Add product error:", error);
        }
      },
      updateProduct: async (id, updates) => {
        try {
          await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          });
          set((s) => ({
            products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }));
          const pCode = updates.code || get().products.find(p => p.id === id)?.code || id;
          get().addActivityLog({
            id: `AL-${Date.now()}`,
            userId: get().user?.id || 'System',
            userName: get().user?.name || 'System',
            action: 'updated product',
            target: pCode,
            timestamp: new Date().toISOString(),
            type: 'edit',
          });
        } catch (error) {
          console.error("Update product error:", error);
        }
      },
      deleteProduct: async (id) => {
        try {
          const pCode = get().products.find(p => p.id === id)?.code || id;
          await fetch(`/api/products/${id}`, { method: 'DELETE' });
          set((s) => ({
            products: s.products.filter((p) => p.id !== id),
          }));
          get().addActivityLog({
            id: `AL-${Date.now()}`,
            userId: get().user?.id || 'System',
            userName: get().user?.name || 'System',
            action: 'deleted product',
            target: pCode,
            timestamp: new Date().toISOString(),
            type: 'delete',
          });
        } catch (error) {
          console.error("Delete product error:", error);
        }
      },
      addActivityLog: async (log) => {
        try {
          await fetch('/api/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
          });
          set((s) => ({ activityLogs: [log, ...s.activityLogs] }));
        } catch (error) {
          console.error("Activity log error:", error);
        }
      },
      addRecognitionLog: async (log) => {
        try {
          await fetch('/api/recognition', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
          });
          set((s) => ({ recognitionLogs: [log, ...s.recognitionLogs] }));
        } catch (error) {
          console.error("Recognition log error:", error);
        }
      },
      fetchLandingContent: async () => {
        try {
          const res = await fetch('/api/settings/landing').then(r => r.json());
          set({ landingContent: res });
        } catch (error) {
          console.error("Failed to fetch landing content:", error);
        }
      },
      updateLandingContent: async (content) => {
        try {
          const res = await fetch('/api/settings/landing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(content),
          }).then(r => r.json());
          if (res.success) {
            set({ landingContent: content });
          }
        } catch (error) {
          console.error("Failed to update landing content:", error);
        }
      },
      addQuestion: async (q) => {
        try {
          await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q),
          });
          set((s) => ({ questions: [q, ...s.questions] }));
        } catch (error) {
          console.error("Add question error:", error);
        }
      },
      answerQuestion: async (id, answer) => {
        try {
          const res = await fetch(`/api/questions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answer, status: 'answered', answeredAt: new Date().toISOString() }),
          }).then(r => r.json());
          
          if (res.success && res.question) {
            set((s) => ({
              questions: s.questions.map((q) => (q.id === id ? res.question : q)),
            }));
          }
        } catch (error) {
          console.error("Answer question error:", error);
        }
      },
    }),
    {
      name: 'packvisionai-store',
      // ONLY persist auth user and theme. Data comes from API now.
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        manualHtml: s.manualHtml,
        manualFileName: s.manualFileName,
      }),
    }
  )
);
