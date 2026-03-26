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

  const [isAutoFetch, setIsAutoFetch] = useState<boolean>(() => {
    const saved = localStorage.getItem("autoFetchGold");
    return saved !== null ? saved === "true" : true;
  });

  const lastUpdateKey = useRef<string>("");
  const realtimeTimeout = useRef<number | null>(null);
  const onPriceUpdatedRef = useRef(onPriceUpdated);

  useEffect(() => {
    onPriceUpdatedRef.current = onPriceUpdated;
  }, [onPriceUpdated]);

  useEffect(() => {
    localStorage.setItem("autoFetchGold", String(isAutoFetch));
  }, [isAutoFetch]);

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
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleSavePrice = async (payload: GoldPrices) => {
    await updateGoldPrices(payload);

    try {
      await fetch("https://g99pawnpay.golden99.co.th/gold-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barSale: Number(payload.barSale),
          barBuy: Number(payload.barBuy),
        }),
      });
    } catch (error) {
      console.error(error);
    }

    fetchPrice();
  };

  useEffect(() => {
    if (!isSystemReady) return;

    let interval: number | undefined;

    if (isAutoFetch) {
      interval = window.setInterval(fetchPrice, 300000);
    }

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
        if (interval) window.clearInterval(interval);
        if (channel) supabase?.removeChannel(channel);
      };
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isSystemReady, isAutoFetch, fetchPrice]);

  return { prices, fetchPrice, handleSavePrice, isAutoFetch, setIsAutoFetch };
}
