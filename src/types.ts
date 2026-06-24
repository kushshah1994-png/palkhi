/**
 * Types and helper functions for PALKHE — Embroidery Order Management
 */

export interface SareeMeasurements {
  bust?: string;
  waist?: string;
  shoulder?: string;
  frontNeck?: string;
  backNeck?: string;
  sleeveLength?: string;
  notes?: string;
  hip?: string;
  armhole?: string;
  frontNeckDepth?: string;
  backNeckDepth?: string;
  frontPhoto?: string;
  backPhoto?: string;
  sleevePhoto?: string;
  sketchPhoto?: string;
}

export interface SareeBlouse {
  added: boolean;
  charge: number;
  measurements?: SareeMeasurements;
}

export interface SareeDupatta {
  added: boolean;
  colour: string;
  fabric: string;
  embroidery: string;
  charge: number;
  photo?: string;
}

export type SareeSource = 'Ready stock' | 'Make-to-order' | 'Direct from supplier';

export interface SareeTracking {
  plainSareeReceived: boolean;
  givenToKarigar: boolean;
  givenToKarigarDate: string;
  receivedFromKarigar: boolean;
  receivedFromKarigarDate: string;
}

export interface SareeItem {
  id: string;
  name: string;
  type: string; // e.g. Banarasi, Kanjivaram
  colour: string;
  price: number;
  source: SareeSource;
  barcode?: string;
  karigar?: string;
  supplier?: string;
  embroideryTypes: string[]; // Zari, Thread, Mirror, Sequence, Aari, Cutwork, Resham, Stone
  description: string;
  sareePhoto?: string;
  embroideryPhoto?: string;
  tracking: SareeTracking;
  blouse: SareeBlouse;
  dupatta: SareeDupatta;
}

export type ShipmentStatus = 'Pending' | 'Dispatched' | 'Received by customer' | 'Review taken';

export interface OrderPayment {
  total: number;
  advance1: number;
  advance1Mode: string; // Cash, Card, UPI, Bank Transfer
  advance2: number;
  advance2Mode: string;
  balanceDue: number; // auto-calculated
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: 'custom' | 'online';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  pinCode?: string; // especially for online orders
  deliveryDate: string;
  courierTracking?: string;
  shipmentStatus: ShipmentStatus;
  sarees: SareeItem[];
  payment: OrderPayment;
  createdAt: string;
  // Advanced fields matching user's custom layout
  shopifyNumber?: string;
  salesHand?: string;
  country?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  instagramHandle?: string;
  orderSource?: string;
  courierCo?: string;
  courierCharges?: number;
  blouseCharges?: number;
  dupattaCharges?: number;
  shippingCharges?: number;
  advance1Receipt?: string;
  advance2Receipt?: string;
  cashMemoPhoto?: string;
  voucherSlipPhoto?: string;
  notes?: string;
}

export type EmbroideryPieceStatus = 'Pending' | 'Given to karigar' | 'Received from karigar' | 'Ready' | 'In stock' | 'Sold';

export interface EmbroideryStockItem {
  id: string;
  barcode: string;
  type: string;
  colour: string;
  karigar: string;
  status: EmbroideryPieceStatus;
  photo: string;
  notes: string;
  lastUpdated: string;
  clothPrice?: number;
  karigarWages?: number;
  materialsCost?: number;
  totalCost?: number;
  expectedDeliveryDate?: string;
  associatedOrderNumber?: string;
  party?: string;
  purpose?: string;
  linkedOrder?: string;
  qty?: number;
  embType?: string;
  photoUrl?: string;
  refUrl?: string;
  returnUrl?: string;
  givenDate?: string;
  expectedDate?: string;
  recdDate?: string;
  savedAt?: string;
  recdPalluUrl?: string;
  recdBorderUrl?: string;
}

// Utility function to capitalize each word in a string (Auto-capitalize)
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface AccessSettings {
  pages: {
    dashboard: boolean;
    orders: boolean;
    stock: boolean;
    online: boolean;
  };
  hideCustomRev: boolean;
  hideOnlineRev: boolean;
  hideEmbCost: boolean;
}

