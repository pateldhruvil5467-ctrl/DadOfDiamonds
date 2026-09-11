import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  /** Stock known at the time this item was added/last synced — a UX guard only. Final stock
   * validation happens server-side at checkout, not here. */
  stock: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
  /**
   * One idempotency key per checkout attempt, persisted alongside the cart so a retry (even
   * across a page refresh) reuses the same key instead of minting a new one. Cleared when the
   * cart is cleared (e.g. after a real successful order, in Phase 2.3B) or changes.
   */
  checkoutIdempotencyKey: string | null;
  getOrCreateIdempotencyKey: () => string;
  clearIdempotencyKey: () => void;
}

/**
 * localStorage access itself can throw synchronously (Safari private browsing, disabled
 * storage, quota errors) even before any JSON parsing happens — this wrapper makes sure that
 * never crashes the app. Malformed JSON *content* is handled by zustand's persist middleware
 * internally (it catches parse errors and falls back to the store's default state).
 */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore — cart just won't persist this change (e.g. private browsing, quota exceeded).
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore.
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      checkoutIdempotencyKey: null,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + quantity, existing.stock);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: nextQuantity } : i,
              ),
              checkoutIdempotencyKey: null, // cart changed — any in-flight checkout attempt is stale
            };
          }
          const initialQuantity = Math.min(Math.max(quantity, 1), Math.max(item.stock, 0));
          if (initialQuantity <= 0) return state; // out of stock — nothing to add
          return {
            items: [...state.items, { ...item, quantity: initialQuantity }],
            checkoutIdempotencyKey: null,
          };
        }),

      increaseQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) } : i,
          ),
          checkoutIdempotencyKey: null,
        })),

      decreaseQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i,
          ),
          checkoutIdempotencyKey: null,
        })),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          checkoutIdempotencyKey: null,
        })),

      clearCart: () => set({ items: [], checkoutIdempotencyKey: null }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getOrCreateIdempotencyKey: () => {
        const existing = get().checkoutIdempotencyKey;
        if (existing) return existing;
        const next = crypto.randomUUID();
        set({ checkoutIdempotencyKey: next });
        return next;
      },
      clearIdempotencyKey: () => set({ checkoutIdempotencyKey: null }),
    }),
    {
      name: "dad-of-diamonds-cart",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ items: state.items, checkoutIdempotencyKey: state.checkoutIdempotencyKey }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration attempts, whether it succeeded or the stored value was
        // missing/malformed — either way, it's now safe to render cart-dependent UI.
        state?.setHasHydrated(true);
      },
    },
  ),
);
