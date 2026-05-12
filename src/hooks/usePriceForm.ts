import { useState, useCallback } from "react";
import type { GoldPrices, UserRole } from "../types";
import { SYS_ROLES } from "../config/constants";
import { calculateOrnamentsReturnPrice } from "../utils/price";

interface UsePriceFormProps {
  currentPrices: GoldPrices;
  userRole: UserRole | null;
  isAutoFetch: boolean;
  onToggleAutoFetch: (status: boolean) => void;
}

export function usePriceForm({
  currentPrices,
  userRole,
  isAutoFetch,
  onToggleAutoFetch,
}: UsePriceFormProps) {
  const [formData, setFormData] = useState({
    barBuy: "",
    barSale: "",
    ornaReturn: "",
  });

  const resetForm = useCallback(() => {
    const barBuy = currentPrices.barBuy > 0 ? String(currentPrices.barBuy) : "";
    const barSale =
      currentPrices.barSale > 0 ? String(currentPrices.barSale) : "";
    let ornaReturn =
      currentPrices.ornaReturn > 0 ? String(currentPrices.ornaReturn) : "";

    if (isAutoFetch && currentPrices.barBuy > 0) {
      ornaReturn = String(calculateOrnamentsReturnPrice(currentPrices.barBuy));
    }

    setFormData({
      barBuy,
      barSale,
      ornaReturn,
    });
  }, [currentPrices, isAutoFetch]);

  const handleInputChange = (
    field: "barBuy" | "barSale" | "ornaReturn",
    value: string,
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "barBuy") {
        const buyPrice = Number(value);
        if (buyPrice > 0) {
          newData.ornaReturn = String(calculateOrnamentsReturnPrice(buyPrice));
        } else {
          newData.ornaReturn = "";
        }
      }

      return newData;
    });

    if (userRole === SYS_ROLES.ADMIN && isAutoFetch) {
      onToggleAutoFetch(false);
    }
  };

  return {
    formData,
    handleInputChange,
    resetForm,
  };
}
