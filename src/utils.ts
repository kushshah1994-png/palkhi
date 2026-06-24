import { Order, EmbroideryStockItem, capitalizeWords } from './types';

// Pin Code Directory for Beautiful Auto-Detect Simulation
export const PINCODE_DIRECTORY: Record<string, { city: string; state: string; area: string }> = {
  '400001': { city: 'Mumbai', state: 'Maharashtra', area: 'Fort, South Mumbai' },
  '400013': { city: 'Mumbai', state: 'Maharashtra', area: 'Lower Parel' },
  '400018': { city: 'Mumbai', state: 'Maharashtra', area: 'Worli' },
  '400021': { city: 'Mumbai', state: 'Maharashtra', area: 'Nariman Point' },
  '400049': { city: 'Mumbai', state: 'Maharashtra', area: 'Juhu' },
  '400050': { city: 'Mumbai', state: 'Maharashtra', area: 'Bandra West' },
  '400054': { city: 'Mumbai', state: 'Maharashtra', area: 'Santacruz West' },
  '400073': { city: 'Mumbai', state: 'Maharashtra', area: 'Chembur' },
  '400703': { city: 'Vashi', state: 'Maharashtra', area: 'Sector 18, Navi Mumbai' },
  '110001': { city: 'New Delhi', state: 'Delhi', area: 'Connaught Place' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', area: 'MG Road Area' },
  '300001': { city: 'Ahmedabad', state: 'Gujarat', area: 'Kalupur' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', area: 'George Town' },
};

export function autoDetectPinCode(pincode: string): { city: string; state: string; area: string } | null {
  const cleanPin = pincode.replace(/\s+/g, '');
  if (cleanPin.length === 6 && PINCODE_DIRECTORY[cleanPin]) {
    return PINCODE_DIRECTORY[cleanPin];
  }
  return null;
}

// Generate pre-filled WhatsApp link for orders
export function generateWhatsAppOrderMsg(order: Order, sareeIndex?: number): string {
  const customPrefix = `Dear ${order.customerName},\nThis is Palkhi Sarees Mumbai.\n`;
  let msg = '';
  
  if (sareeIndex !== undefined && order.sarees[sareeIndex]) {
    const saree = order.sarees[sareeIndex];
    msg = `${customPrefix}Your customer order *${order.orderNumber}* status for saree *${saree.name}* (${saree.colour}) has been updated.\n- Source: ${saree.source}\n- Tracking Progress: \n  • Received: ${saree.tracking.plainSareeReceived ? '✅' : '❌'}\n  • With Karigar: ${saree.tracking.givenToKarigar ? `✅ (Since ${saree.tracking.givenToKarigarDate})` : '❌'}\n  • Handover Ready: ${saree.tracking.receivedFromKarigar ? `✅ (Finished ${saree.tracking.receivedFromKarigarDate})` : '❌'}\n\nThank you for choosing Palkhi Sarees, Estd. 1991.`;
  } else {
    msg = `${customPrefix}Your order *${order.orderNumber}* is registered in our dashboard.\nTotal Items: ${order.sarees.length}\nShipment Status: *${order.shipmentStatus}*\nEstimated Delivery: ${order.deliveryDate}\nOutstanding Balance: ₹${order.payment.balanceDue.toLocaleString('en-IN')}\n\nWe appreciate your patronage.`;
  }
  
  return `https://api.whatsapp.com/send?phone=${order.customerPhone.replace(/[\s+()-]/g, '')}&text=${encodeURIComponent(msg)}`;
}

// Generate WhatsApp link for standalone embroidery pieces to Karigars
export function generateWhatsAppKarigarMsg(item: EmbroideryStockItem): string {
  const msg = `*PALKHI SAREES MUMBAI (Estd. 1991)*\n\n*KARIGAR ASSIGNMENT UPDATE*\n-------------------------------\nBarcode: *${item.barcode}*\nPiece Type: *${item.type.replace(/_/g, ' ').toUpperCase()}*\nFabric Colour: *${item.colour}*\nAssigned Karigar: *${item.karigar}*\nCurrent Status: *${item.status}*\nLast Updated: ${item.lastUpdated}\n\nInstructions: Please keep design details and thread density pristine.\nReference Asset Link: ${item.photo}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
}

// Helper to auto-format text with title casing during typing
export function formatTitleCase(val: string): string {
  return capitalizeWords(val);
}
