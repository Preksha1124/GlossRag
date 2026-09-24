// Mirrors web-client/tailwind.config.js so both platforms feel like one product.
export const colors = {
  ink: "#1B1F3B",
  canvas: "#F7F5F0",
  slate: "#4A5160",
  amber: "#F2A93B",
  mint: "#3FB8A6",
  coral: "#E85D4C",
  white: "#FFFFFF",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  md: 12,
  lg: 16,
} as const;
