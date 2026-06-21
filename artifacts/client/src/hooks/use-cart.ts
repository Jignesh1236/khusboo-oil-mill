import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  discountPercent?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, qty: i.qty + item.qty }
                : i
            )
          };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),
      updateQuantity: (productId, qty) => set((state) => ({
        items: state.items.map(i => i.productId === productId ? { ...i, qty } : i)
      })),
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const itemPrice = item.discountPercent 
            ? item.price * (1 - item.discountPercent / 100) 
            : item.price;
          return total + itemPrice * item.qty;
        }, 0);
      }
    }),
    {
      name: 'storeCart',
    }
  )
);
