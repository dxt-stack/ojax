import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { get } from "../lib/api";

interface CartCtx {
  count: number;
  refresh: () => Promise<number>;
  bump: () => void;
}

const Ctx = createContext<CartCtx>({ count: 0, refresh: async () => 0, bump: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const refresh = useCallback(async () => {
    try {
      const d = await get<{ items: unknown[] }>("/api/orders/cart");
      const n = (d.items || []).length;
      setCount(n);
      return n;
    } catch {
      return 0;
    }
  }, []);
  const bump = useCallback(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return <Ctx.Provider value={{ count, refresh, bump }}>{children}</Ctx.Provider>;
}

export function useCart() {
  return useContext(Ctx);
}
