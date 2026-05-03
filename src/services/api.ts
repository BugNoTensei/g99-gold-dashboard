import axios from "axios";
import { supabase } from "../config/supabase";
import { ADMIN_BRANCH_ID } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL;
const PIN = import.meta.env.VITE_UPDATE_PIN;

export interface GoldPrices {
  barBuy: number;
  barSale: number;
  ornaReturn: number;
  priceAt?: string;
  update_time?: string;
}

export interface Branch {
  id: string;
  branch_name: string;
  branch_pin: string;
  is_configured: boolean;
  role?: "branch" | "admin";
}

export interface BranchLoginResult {
  id: string;
  branch_name: string;
  role: "branch" | "admin";
}

export interface PromotionBanner {
  id: string;
  imageUrl: string;
}

export const getGoldPrices = async (): Promise<GoldPrices> => {
  const res = await axios.get(API_URL);
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

export const getBranches = async (): Promise<Branch[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .order("branch_name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const setupBranchInitial = async (branchId: string, pin: string) => {
  if (!supabase) return;

  const { error } = await supabase.rpc("setup_branch_secure", {
    p_branch_id: branchId,
    p_new_pin: pin,
  });

  if (error) throw error;
};

export const addNewBranchByAdmin = async (name: string, adminPin: string) => {
  if (!supabase) return;

  const { error } = await supabase.rpc("add_new_branch_secure", {
    p_branch_name: name.trim(),
    p_admin_pin: adminPin,
  });

  if (error) {
    if (error.message.includes("Invalid Admin PIN")) {
      throw new Error("รหัสผ่านผู้ดูแลระบบ (Admin PIN) ไม่ถูกต้อง");
    }
    if (error.code === "23505") {
      throw new Error("ชื่อสาขานี้มีในระบบแล้ว");
    }
    throw error;
  }
};

export const uploadPromotionBanner = async (
  file: File,
  branchId: string = ADMIN_BRANCH_ID,
) => {
  if (!supabase) throw new Error("Supabase is not initialized");

  const fileExt = file.name.split(".").pop();
  const fileName = `${branchId}/${Date.now()}.${fileExt}`;
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

export const deletePromotionBanner = async (
  id: string,
  imageUrl: string,
  branchId: string = ADMIN_BRANCH_ID,
) => {
  if (!supabase) throw new Error("Supabase is not initialized");

  const { error: dbError } = await supabase
    .from("branch_promotions")
    .delete()
    .eq("id", id);

  if (dbError) throw dbError;

  const [urlWithoutQuery] = imageUrl.split("?");
  const fileName = urlWithoutQuery.split("/").pop();

  if (fileName) {
    await supabase.storage
      .from("promotions")
      .remove([`${branchId}/${fileName}`]);
  }
};

export const getPromotionBanners = async (
  branchId: string,
): Promise<PromotionBanner[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("branch_promotions")
    .select("id, image_url")
    .eq("branch_id", branchId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((item: { id: string; image_url: string }) => ({
    id: String(item.id),
    imageUrl: item.image_url,
  }));
};

export const verifyLoginPin = async (pin: string): Promise<"admin" | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("verify_login_pin", {
    p_pin: pin,
  });

  if (error) throw error;
  return data === "admin" ? "admin" : null;
};

export const verifyBranchPin = async (
  branchId: string,
  inputPin: string,
): Promise<boolean> => {
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("verify_branch_pin", {
    p_branch_id: branchId,
    p_pin: inputPin,
  });

  if (error) return false;
  return !!data;
};

export const verifyAdminPin = async (inputPin: string): Promise<boolean> => {
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("verify_admin_pin", {
    p_pin: inputPin,
  });

  if (error) {
    console.error("Error verifying admin pin:", error);
    return false;
  }

  return !!data;
};

export const resetBranchPin = async (
  branchId: string,
  adminPin: string,
  newPin: string,
) => {
  if (!supabase) return;

  const { error } = await supabase.rpc("reset_branch_pin_secure", {
    p_branch_id: branchId,
    p_admin_pin: adminPin,
    p_new_pin: newPin,
  });

  if (error) {
    if (error.message.includes("Invalid Admin PIN")) {
      throw new Error("รหัสผ่านผู้ดูแลระบบ (Admin PIN) ไม่ถูกต้อง");
    }
    throw error;
  }
};

export const deleteBranch = async (branchId: string, adminPin: string) => {
  if (!supabase) return;

  const { error } = await supabase.rpc("delete_branch_secure", {
    p_branch_id: branchId,
    p_admin_pin: adminPin,
  });

  if (error) {
    if (error.message.includes("Invalid Admin PIN")) {
      throw new Error("รหัสผ่านผู้ดูแลระบบ (Admin PIN) ไม่ถูกต้อง");
    }
    throw error;
  }
};

export const checkBranchExists = async (branchId: string): Promise<boolean> => {
  if (!supabase || !branchId) return false;

  const { data, error } = await supabase
    .from("branches")
    .select("id")
    .eq("id", branchId)
    .maybeSingle();

  if (error || !data) return false;
  return true;
};

export const broadcastForceClearLocal = async () => {
  if (!supabase) return;

  await supabase.channel("gold-price-updates").send({
    type: "broadcast",
    event: "force_clear_local",
    payload: { message: "Admin forced update" },
  });
};

export const subscribeToGoldPriceUpdates = (
  onDataUpdate: () => void,
  onForceClearLocal: () => void,
  autoFetch: boolean,
) => {
  const client = supabase;
  if (!client) {
    return {
      unsubscribe: () => {},
    };
  }

  const channel = client
    .channel("gold-price-updates")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "gold_prices" },
      (payload) => {
        if (payload.eventType === "DELETE") return;
        if (!autoFetch) return;
        onDataUpdate();
      },
    )
    .on("broadcast", { event: "force_clear_local" }, () => {
      onForceClearLocal();
    });

  channel.subscribe();

  return {
    unsubscribe: () => {
      client.removeChannel(channel);
    },
  };
};

export const authenticateDevicePin = async (
  branchId: string,
  pin: string,
): Promise<"branch" | "admin" | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("branches")
      .select("role")
      .eq("id", branchId)
      .eq("branch_pin", pin)
      .maybeSingle();

    if (error || !data) return null;

    return data.role as "branch" | "admin";
  } catch {
    return null;
  }
};
