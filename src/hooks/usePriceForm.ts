import { useState, useCallback } from "react";
import type { GoldPrices, UserRole } from "../types";
import { SYS_ROLES } from "../config/constants";

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
    setFormData({
      barBuy: currentPrices.barBuy > 0 ? String(currentPrices.barBuy) : "",
      barSale: currentPrices.barSale > 0 ? String(currentPrices.barSale) : "",
      ornaReturn:
        currentPrices.ornaReturn > 0 ? String(currentPrices.ornaReturn) : "",
    });
  }, [currentPrices]);

  const handleInputChange = (
    field: "barBuy" | "barSale" | "ornaReturn",
    value: string,
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "barBuy") {
        const buyPrice = Number(value);
        if (buyPrice > 0) {
          const calculatedOrna = Math.floor(buyPrice * 0.95);
          newData.ornaReturn = String(calculatedOrna);
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
