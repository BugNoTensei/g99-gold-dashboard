export const SYS_ROLES = {
  ADMIN: "admin",
  BRANCH: "branch",
} as const;

export const ADMIN_BRANCH_ID = "main";

export const STORAGE_KEYS = {
  BRANCH_CONFIG: "g99_branch_config",
  USE_ADMIN_BANNERS: (branchId: string) => `g99_use_admin_banners_${branchId}`,
};

export const UPLOAD_LIMITS = {
  MAX_BANNERS: 5,
};
