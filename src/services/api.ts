import axios from "axios";
import { supabase } from "../config/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export interface GoldPrices {
  barBuy: number;
  barSale: number;
  ornaReturn: number;
  priceAt?: string;
}

export const getGoldPrices = async (): Promise<GoldPrices> => {
  const res = await axios.get(`${API_URL}?t=${new Date().getTime()}`);
  return res.data;
};

export const updateGoldPrices = async (payload: GoldPrices) => {
  await axios.post(API_URL, payload);
  if (supabase) {
    await supabase.from("gold_prices").insert([
      {
        source: "G99_Dashboard",
        bar_buy: payload.barBuy,
        bar_sell: payload.barSale,
        ornament_buy: payload.ornaReturn,
        update_time: new Date().toISOString(),
      },
    ]);
  }
};
