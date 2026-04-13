import axios from "axios";
import { supabase } from "../config/supabase";

const API_URL = import.meta.env.VITE_API_URL;
const PIN = import.meta.env.VITE_UPDATE_PIN;

export interface GoldPrices {
  barBuy: number;
  barSale: number;
  ornaReturn: number;
  priceAt?: string;
  update_time?: string;
}

export const getGoldPrices = async (): Promise<GoldPrices> => {
  const res = await axios.get(`${API_URL}?t=${new Date().getTime()}`);
  return res.data;
};

export const updateGoldPrices = async (payload: GoldPrices) => {
  await axios.post(API_URL, payload);

  if (supabase) {
    const { error } = await supabase.rpc("insert_gold_prices_secure", {
      p_bar_buy: payload.barBuy,
      p_bar_sell: payload.barSale,
      p_ornament_buy: payload.ornaReturn,
      p_pin: PIN,
      p_source: "G99_Dashboard",
    });

    if (error) throw error;
  }
};
