import { useState, useEffect, useRef, useCallback } from "react";
import {
  getGoldPrices,
  updateGoldPrices,
  type GoldPrices,
} from "../services/api";
import { supabase } from "../config/supabase";

export function useGoldPrice(
  isSystemReady: boolean,
  onPriceUpdated?: () => void,
) {
  const [prices, setPrices] = useState<GoldPrices>({
    barBuy: 0,
    barSale: 0,
    ornaReturn: 0,
  });
  const prevPriceStr = useRef<string>("");
  const realtimeTimeout = useRef<number | null>(null);
  const fetchPrice = useCallback(async () => {
    try {
      const data = await getGoldPrices();
      const newDataStr = `${data.barBuy}-${data.barSale}-${data.ornaReturn}`;

      if (prevPriceStr.current && prevPriceStr.current !== newDataStr) {
        if (onPriceUpdated) onPriceUpdated();
      }

      prevPriceStr.current = newDataStr;
      setPrices(data);
    } catch (error) {
      console.error(error);
    }
  }, [onPriceUpdated]);

  const handleSavePrice = async (payload: GoldPrices) => {
    try {
      await updateGoldPrices(payload);
      fetchPrice();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอัปเดตราคา");
    }
  };

  useEffect(() => {
    if (!isSystemReady) return;

    const interval = setInterval(fetchPrice, 300000);

    if (supabase) {
      const channel = supabase
        .channel("gold-price-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gold_prices" },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            if (realtimeTimeout.current) clearTimeout(realtimeTimeout.current);
            realtimeTimeout.current = setTimeout(() => {
              fetchPrice();
            }, 1000);
          },
        )
        .subscribe();

      return () => {
        window.clearInterval(interval);
        if (channel) {
          supabase?.removeChannel(channel);
        }
      };
    }
    return () => clearInterval(interval);
  }, [isSystemReady, fetchPrice]);
  return { prices, fetchPrice, handleSavePrice };
}
