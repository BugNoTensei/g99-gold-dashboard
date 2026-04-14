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

export const uploadPromotionBanner = async (
  file: File,
  branchId: string = "main",
) => {
  if (!supabase) throw new Error("Supabase is not initialized");

  const fileExt = file.name.split(".").pop();
  const fileName = `${branchId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("promotions")
    .upload(filePath, file, {
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("promotions").getPublicUrl(filePath);

  const { error: dbError } = await supabase
    .from("branch_promotions")
    .insert([{ branch_id: branchId, image_url: publicUrl }]);

  if (dbError) throw dbError;
  return publicUrl;
};

export const deletePromotionBanner = async (id: string, imageUrl: string) => {
  if (!supabase) throw new Error("Supabase is not initialized");

  const { error: dbError } = await supabase
    .from("branch_promotions")
    .delete()
    .eq("id", id);

  if (dbError) throw dbError;

  const fileName = imageUrl.split("/").pop();
  if (fileName) {
    await supabase.storage.from("promotions").remove([fileName]);
  }
};
