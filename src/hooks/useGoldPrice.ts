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
  const lastUpdateKey = useRef<string>("");
  const realtimeTimeout = useRef<number | null>(null);
  const onPriceUpdatedRef = useRef(onPriceUpdated);

  useEffect(() => {
    onPriceUpdatedRef.current = onPriceUpdated;
  }, [onPriceUpdated]);

  const fetchPrice = useCallback(async () => {
    try {
      const data = await getGoldPrices();

      if (!data || !data.barBuy || data.barBuy <= 0) return;

      const currentKey =
        data.priceAt || `${data.barBuy}-${data.barSale}-${data.ornaReturn}`;

      if (
        lastUpdateKey.current !== "" &&
        lastUpdateKey.current !== currentKey
      ) {
        if (onPriceUpdatedRef.current) onPriceUpdatedRef.current();
      }

      lastUpdateKey.current = currentKey;
      setPrices(data);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSavePrice = async (payload: GoldPrices) => {
    await updateGoldPrices(payload);
    fetchPrice();
  };

  useEffect(() => {
    if (!isSystemReady) return;

    const interval = window.setInterval(fetchPrice, 300000);

    if (supabase) {
      const channel = supabase
        .channel("gold-price-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gold_prices" },
          (payload) => {
            if (payload.eventType === "DELETE") return;
            if (realtimeTimeout.current)
              window.clearTimeout(realtimeTimeout.current);
            realtimeTimeout.current = window.setTimeout(() => {
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
    return () => window.clearInterval(interval);
  }, [isSystemReady, fetchPrice]);

  return { prices, fetchPrice, handleSavePrice };
}
