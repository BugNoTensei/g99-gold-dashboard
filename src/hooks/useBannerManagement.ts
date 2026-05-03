import { useState, useEffect, useCallback } from "react";
import {
  getPromotionBanners,
  uploadPromotionBanner,
  deletePromotionBanner,
} from "../services/api";
import { SYS_ROLES, ADMIN_BRANCH_ID, STORAGE_KEYS } from "../config/constants";
import type { UserRole, PromotionBanner } from "../types";

export interface Banner {
  id: string;
  url: string;
}

export function useBannerManagement(
  userRole: UserRole | null,
  branchId: string,
  onShowToast: (msg: string, type: "success" | "error") => void,
) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [useAdminBanners, setUseAdminBanners] = useState(() => {
    return (
      localStorage.getItem(STORAGE_KEYS.USE_ADMIN_BANNERS(branchId)) !== "false"
    );
  });

  const fetchBanners = useCallback(async () => {
    const targetBranch =
      userRole === SYS_ROLES.ADMIN
        ? ADMIN_BRANCH_ID
        : useAdminBanners
          ? ADMIN_BRANCH_ID
          : branchId;
    try {
      const result: PromotionBanner[] = await getPromotionBanners(targetBranch);
      setBanners(
        result.map((b) => ({
          id: b.id,
          url: b.imageUrl,
        })),
      );
    } catch {
      setBanners([]);
    }
  }, [userRole, branchId, useAdminBanners]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.USE_ADMIN_BANNERS(branchId),
      String(useAdminBanners),
    );
    fetchBanners();
  }, [useAdminBanners, fetchBanners, branchId]);

  const handleUploadBanner = async (file: File) => {
    try {
      const targetBranch =
        userRole === SYS_ROLES.ADMIN ? ADMIN_BRANCH_ID : branchId;
      await uploadPromotionBanner(file, targetBranch);
      await fetchBanners();
      onShowToast("เพิ่มรูปโฆษณาสำเร็จ", "success");
    } catch {
      onShowToast("อัปโหลดไม่สำเร็จ", "error");
      throw new Error("Upload failed");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      const bannerToDelete = banners.find((b) => b.id === id);
      if (bannerToDelete) {
        const targetBranch =
          userRole === SYS_ROLES.ADMIN ? ADMIN_BRANCH_ID : branchId;
        await deletePromotionBanner(id, bannerToDelete.url, targetBranch);
        setBanners(banners.filter((b) => b.id !== id));
        onShowToast("ลบรูปโฆษณาสำเร็จ", "success");
      }
    } catch {
      onShowToast("ลบข้อมูลไม่สำเร็จ", "error");
      throw new Error("Delete failed");
    }
  };

  return {
    banners,
    useAdminBanners,
    setUseAdminBanners,
    fetchBanners,
    handleUploadBanner,
    handleDeleteBanner,
  };
}
