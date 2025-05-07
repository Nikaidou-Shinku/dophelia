export const PLATFORMS = ["sfacg", "ciweimao"] as const;

export const PLATFORM_NAMES: Record<(typeof PLATFORMS)[number], string> = {
  sfacg: "菠萝包",
  ciweimao: "刺猬猫",
};
