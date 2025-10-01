/**
 * Icon Constants
 * 
 * Centralized icon names for consistent usage throughout the app.
 * All icons use Ionicons 'outline' variants for a clean, modern look.
 */

export const AppIcons = {
  // Navigation & Actions
  back: 'arrow-back-outline' as const,
  close: 'close-outline' as const,
  menu: 'menu-outline' as const,
  more: 'ellipsis-horizontal-outline' as const,
  
  // Bird & Nature  
  bird: 'paw-outline' as const,               // Animal icon (closest to wildlife/birds)
  search: 'search-outline' as const,
  scan: 'scan-outline' as const,
  eye: 'eye-outline' as const,
  
  // Camera & Media
  camera: 'camera-outline' as const,
  image: 'image-outline' as const,
  images: 'images-outline' as const,
  gallery: 'images-outline' as const,
  
  // User & Account
  person: 'person-outline' as const,
  logout: 'log-out-outline' as const,
  login: 'log-in-outline' as const,
  deleteAccount: 'trash-outline' as const,
  
  // Settings & Preferences
  settings: 'settings-outline' as const,
  language: 'language-outline' as const,
  theme: 'moon-outline' as const,
  themeSun: 'sunny-outline' as const,
  
  // Shopping & Credits
  card: 'card-outline' as const,
  wallet: 'wallet-outline' as const,
  cash: 'cash-outline' as const,
  cart: 'cart-outline' as const,
  
  // Information & Status
  info: 'information-circle-outline' as const,
  help: 'help-circle-outline' as const,
  warning: 'warning-outline' as const,
  alert: 'alert-circle-outline' as const,
  success: 'checkmark-circle-outline' as const,
  error: 'close-circle-outline' as const,
  
  // Navigation Tabs
  home: 'home-outline' as const,
  history: 'time-outline' as const,
  stats: 'bar-chart-outline' as const,
  
  // Actions
  add: 'add-outline' as const,
  edit: 'create-outline' as const,
  delete: 'trash-outline' as const,
  share: 'share-social-outline' as const,
  download: 'download-outline' as const,
  refresh: 'refresh-outline' as const,
  
  // Confidence & Quality
  checkmark: 'checkmark-circle' as const,
  checkmarkCircle: 'checkmark-circle' as const,
  star: 'star-outline' as const,
  starFilled: 'star' as const,
  heart: 'heart-outline' as const,
  heartFilled: 'heart' as const,
  
  // UI Elements
  chevronRight: 'chevron-forward-outline' as const,
  chevronLeft: 'chevron-back-outline' as const,
  chevronUp: 'chevron-up-outline' as const,
  chevronDown: 'chevron-down-outline' as const,
  
  // Zoom & View
  zoomIn: 'add-circle-outline' as const,
  zoomOut: 'remove-circle-outline' as const,
  expand: 'expand-outline' as const,
  
  // Time & Date
  clock: 'time-outline' as const,
  calendar: 'calendar-outline' as const,
  
  // Location
  location: 'location-outline' as const,
  map: 'map-outline' as const,
  
  // Communication
  mail: 'mail-outline' as const,
  notification: 'notifications-outline' as const,
  
  // Data & Files
  document: 'document-outline' as const,
  folder: 'folder-outline' as const,
  cloud: 'cloud-outline' as const,
  
  // Special
  sparkle: 'sparkles-outline' as const,
  sparkles: 'sparkles-outline' as const,
  rocket: 'rocket-outline' as const,
  trophy: 'trophy-outline' as const,
} as const;

/**
 * Type for all available icon names
 */
export type AppIconName = typeof AppIcons[keyof typeof AppIcons];

/**
 * Helper to get icon name with type safety
 */
export function getIcon(name: keyof typeof AppIcons): AppIconName {
  return AppIcons[name];
}
