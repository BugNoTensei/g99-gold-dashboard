import { useState, useEffect, useRef, useCallback } from "react";
import {
  getGoldPrices,
  updateGoldPrices,
  type GoldPrices,
} from "../services/api";
import { supabase } from "../config/supabase";

const LOCAL_STORAGE_KEY = "g99_local_branch_price";

type GoldPricesWithTime = GoldPrices & { update_time?: string };

export function useGoldPrice(
  isSystemReady: boolean,
  onPriceUpdated?: () => void,
) {
  const [centralPrices, setCentralPrices] = useState<GoldPrices>({
    barBuy: 0,
    barSale: 0,
    ornaReturn: 0,
  });

  const [localPrices, setLocalPrices] = useState<GoldPrices | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
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

  const prices = localPrices || centralPrices;
  const isUsingLocal = localPrices !== null;

  const fetchPrice = useCallback(
    async (force: boolean = false) => {
      try {
        const data = await getGoldPrices();
        if (!data || !data.barBuy || data.barBuy <= 0) return;

        if (!isAutoFetch && !isUsingLocal && !force) return;

        const dataWithTime = data as GoldPricesWithTime;
        const currentKey =
          dataWithTime.priceAt ||
          dataWithTime.update_time ||
          `${data.barBuy}-${data.barSale}-${data.ornaReturn}`;

        if (
          lastUpdateKey.current !== "" &&
          lastUpdateKey.current !== currentKey
        ) {
          if (onPriceUpdatedRef.current) {
            onPriceUpdatedRef.current();
          }
        }

        lastUpdateKey.current = currentKey;
        setCentralPrices(data);
      } catch (error) {
        console.error(error);
      }
    },
    [isAutoFetch, isUsingLocal],
  );

  const saveBranchPrice = (payload: GoldPrices) => {
    setLocalPrices(payload);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    if (onPriceUpdatedRef.current) onPriceUpdatedRef.current();
  };

  const saveAdminPrice = async (
    payload: GoldPrices,
    forceUpdateAll: boolean,
  ) => {
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

    if (forceUpdateAll && supabase) {
      await supabase.channel("gold-price-updates").send({
        type: "broadcast",
        event: "force_clear_local",
        payload: { message: "Admin forced update" },
      });
    }

    fetchPrice(true);
  };

  const clearLocalPrice = () => {
    setLocalPrices(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    if (onPriceUpdatedRef.current) onPriceUpdatedRef.current();
  };

  useEffect(() => {
    if (!isSystemReady) return;

    let interval: number | undefined;

    const loadInitialData = async () => {
      await fetchPrice();
    };
    loadInitialData();

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

            if (!isAutoFetch) return;

            if (realtimeTimeout.current)
              window.clearTimeout(realtimeTimeout.current);
            realtimeTimeout.current = window.setTimeout(() => {
              fetchPrice();
            }, 1000);
          },
        )
        .on("broadcast", { event: "force_clear_local" }, () => {
          clearLocalPrice();
          setIsAutoFetch(true);
          fetchPrice(true);
        })
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

  return {
    prices,
    fetchPrice,
    isAutoFetch,
    setIsAutoFetch,
    isUsingLocal,
    saveBranchPrice,
    saveAdminPrice,
    clearLocalPrice,
  };
}
