import { useState, useRef, useEffect, useCallback } from "react";
import {
  getGoldPrices,
  updateGoldPrices,
  broadcastForceClearLocal,
  subscribeToGoldPriceUpdates,
  type GoldPrices,
} from "../services/api";

type GoldPricesWithTime = GoldPrices & { update_time?: string };

export function useGoldPrice(
  isSystemReady: boolean,
  branchId: string,
  onPriceUpdated?: () => void,
) {
  const LOCAL_STORAGE_KEY = `g99_local_price_${branchId}`;
  const AUTO_FETCH_KEY = `g99_auto_fetch_${branchId}`;

  const [centralPrices, setCentralPrices] = useState<GoldPrices>({
    barBuy: 0,
    barSale: 0,
    ornaReturn: 0,
  });

  const [localPrices, setLocalPrices] = useState<GoldPrices | null>(() => {
    if (!branchId) return null;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [isAutoFetch, setIsAutoFetch] = useState<boolean>(() => {
    if (!branchId) return true;
    const saved = localStorage.getItem(AUTO_FETCH_KEY);
    return saved !== null ? saved === "true" : true;
  });

  const lastUpdateKey = useRef<string>("");
  const realtimeTimeout = useRef<number | null>(null);
  const onPriceUpdatedRef = useRef(onPriceUpdated);

  useEffect(() => {
    onPriceUpdatedRef.current = onPriceUpdated;
  }, [onPriceUpdated]);

  useEffect(() => {
    if (branchId) {
      localStorage.setItem(AUTO_FETCH_KEY, String(isAutoFetch));
    }
  }, [isAutoFetch, branchId, AUTO_FETCH_KEY]);

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
    if (branchId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    }
    setIsAutoFetch(false);
    if (onPriceUpdatedRef.current) onPriceUpdatedRef.current();
  };

  const saveAdminPrice = async (
    payload: GoldPrices,
    forceUpdateAll: boolean,
  ) => {
    await updateGoldPrices(payload);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barSale: Number(payload.barSale),
            barBuy: Number(payload.barBuy),
          }),
        });
      }
    } catch (error) {
      console.error(error);
    }

    if (forceUpdateAll) {
      await broadcastForceClearLocal();
    }

    fetchPrice(true);
  };

  const clearLocalPrice = useCallback(() => {
    setLocalPrices(null);
    if (branchId) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setIsAutoFetch(true);
    if (onPriceUpdatedRef.current) onPriceUpdatedRef.current();
    fetchPrice(true);
  }, [branchId, LOCAL_STORAGE_KEY, fetchPrice]);
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

    const subscription = subscribeToGoldPriceUpdates(
      () => {
        if (realtimeTimeout.current)
          window.clearTimeout(realtimeTimeout.current);
        realtimeTimeout.current = window.setTimeout(() => {
          fetchPrice();
        }, 1000);
      },
      clearLocalPrice,
      isAutoFetch,
    );

    return () => {
      if (interval) window.clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [isSystemReady, isAutoFetch, fetchPrice, clearLocalPrice]);
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
