import { Order, EmbroideryStockItem } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'o-1',
    orderNumber: 'PK-2026-601',
    orderType: 'custom',
    customerName: 'Aishwarya Sen',
    customerPhone: '+91 98200 12345',
    customerAddress: 'Apartment 7B, Sea Breeze Towers, Worli, Mumbai',
    deliveryDate: '2026-07-15',
    courierTracking: 'DTDC - Mum - 781203',
    shipmentStatus: 'Pending',
    createdAt: '2026-06-20',
    sarees: [
      {
        id: 's-1-1',
        name: 'Heritage Banarasi Silk',
        type: 'Banarasi',
        colour: 'Crimson Red',
        price: 85000,
        source: 'Make-to-order',
        karigar: 'Ismailbhai Zardosi',
        embroideryTypes: ['Zari', 'Stone', 'Resham'],
        description: 'Heavy gold zari floral vines running across the border with custom hand-stitched real stones on the pallu.',
        sareePhoto: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
        embroideryPhoto: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
        tracking: {
          plainSareeReceived: true,
          givenToKarigar: true,
          givenToKarigarDate: '2026-06-21',
          receivedFromKarigar: false,
          receivedFromKarigarDate: ''
        },
        blouse: {
          added: true,
          charge: 4500,
          measurements: {
            bust: '36"',
            waist: '30"',
            shoulder: '14.5"',
            frontNeck: '7.5"',
            backNeck: '9"',
            sleeveLength: '11"',
            notes: 'Princess cut, back hooks, delicate gold dori tassels.'
          }
        },
        dupatta: {
          added: true,
          colour: 'Golden Yellow',
          fabric: 'Organza',
          embroidery: 'Scalloped gold borders with sparse thread butis',
          charge: 8500,
          photo: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600'
        }
      },
      {
        id: 's-1-2',
        name: 'Mustard Georgette Extravaganza',
        type: 'Georgette',
        colour: 'Mustard Gold',
        price: 32000,
        source: 'Ready stock',
        barcode: 'BC-991142',
        embroideryTypes: ['Thread', 'Sequence', 'Aari'],
        description: 'Floral border with sequenced geometric grids.',
        sareePhoto: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
        tracking: {
          plainSareeReceived: true,
          givenToKarigar: false,
          givenToKarigarDate: '',
          receivedFromKarigar: false,
          receivedFromKarigarDate: ''
        },
        blouse: {
          added: false,
          charge: 0
        },
        dupatta: {
          added: false,
          colour: '',
          fabric: '',
          embroidery: '',
          charge: 0
        }
      }
    ],
    payment: {
      total: 130000, // 85000 + 4500 + 8500 + 32000
      advance1: 50000,
      advance1Mode: 'UPI (GPay)',
      advance2: 30000,
      advance2Mode: 'Bank Transfer (HDFC)',
      balanceDue: 50000
    }
  },
  {
    id: 'o-2',
    orderNumber: 'PK-2026-602',
    orderType: 'custom',
    customerName: 'Priyanka Jhunjhunwala',
    customerPhone: '+91 97690 99887',
    customerAddress: 'Jolly Maker Chambers 2, Nariman Point, Mumbai',
    deliveryDate: '2026-06-29',
    courierTracking: '',
    shipmentStatus: 'Pending',
    createdAt: '2026-06-18',
    sarees: [
      {
        id: 's-2-1',
        name: 'Emerald Bridal Kanjivaram',
        type: 'Kanjivaram',
        colour: 'Emerald Green',
        price: 95000,
        source: 'Make-to-order',
        karigar: 'Rafiqbhai Karim',
        embroideryTypes: ['Zari', 'Cutwork', 'Stone'],
        description: 'Authentic 3-ply silk. Gold thread motifs with customized cutwork scalloped borders with heavy stonework highlight.',
        sareePhoto: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
        tracking: {
          plainSareeReceived: true,
          givenToKarigar: true,
          givenToKarigarDate: '2026-06-19',
          receivedFromKarigar: true,
          receivedFromKarigarDate: '2026-06-22'
        },
        blouse: {
          added: true,
          charge: 5000,
          measurements: {
            bust: '38"',
            waist: '32"',
            shoulder: '15"',
            frontNeck: '8"',
            backNeck: '10"',
            sleeveLength: '12"',
            notes: 'Elbow length sleeves with matching heavy cutwork border.'
          }
        },
        dupatta: {
          added: false,
          colour: '',
          fabric: '',
          embroidery: '',
          charge: 0
        }
      }
    ],
    payment: {
      total: 100000, // 95000 + 5000
      advance1: 80000,
      advance1Mode: 'Credit Card',
      advance2: 0,
      advance2Mode: '',
      balanceDue: 20000
    }
  },
  {
    id: 'o-3',
    orderNumber: 'PK-2026-603',
    orderType: 'online',
    customerName: 'Ritu Mehta',
    customerPhone: '+91 91102 33445',
    customerAddress: '1502, Orchid Heights, Sector 18, Vashi, Navi Mumbai',
    pinCode: '400703',
    deliveryDate: '2026-06-25',
    courierTracking: 'BlueDart - BD9920192',
    shipmentStatus: 'Dispatched',
    createdAt: '2026-06-21',
    sarees: [
      {
        id: 's-3-1',
        name: 'Chanderi Pastel Pink Rose',
        type: 'Chanderi',
        colour: 'Pastel Pink',
        price: 24500,
        source: 'Ready stock',
        barcode: 'BC-772102',
        embroideryTypes: ['Resham', 'Thread'],
        description: 'Delicate silk-cotton blend fabric with exquisite handwoven floral butis.',
        sareePhoto: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
        tracking: {
          plainSareeReceived: true,
          givenToKarigar: false,
          givenToKarigarDate: '',
          receivedFromKarigar: false,
          receivedFromKarigarDate: ''
        },
        blouse: {
          added: false,
          charge: 0
        },
        dupatta: {
          added: false,
          colour: '',
          fabric: '',
          embroidery: '',
          charge: 0
        }
      }
    ],
    payment: {
      total: 24500,
      advance1: 24500,
      advance1Mode: 'UPI (Razorpay Storefront)',
      advance2: 0,
      advance2Mode: '',
      balanceDue: 0
    }
  }
];

export const INITIAL_EMBROIDERY_STOCK: EmbroideryStockItem[] = [
  {
    id: 'emb-1',
    barcode: 'EMB-PK901',
    type: 'Heavy Pallu Zardosi',
    colour: 'Deep Maroon',
    karigar: 'Ismailbhai Zardosi',
    status: 'Given to karigar',
    photo: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    notes: 'Intricate golden zari wirework with micro pearls for a premium royal handloom look.',
    lastUpdated: '2026-06-22',
    clothPrice: 15000,
    karigarWages: 28000,
    materialsCost: 9500,
    totalCost: 52500,
    expectedDeliveryDate: '2026-07-10',
    associatedOrderNumber: 'PK-2026-601'
  },
  {
    id: 'emb-2',
    barcode: 'EMB-PK902',
    type: 'Allover Resham Butis',
    colour: 'Royal Blue',
    karigar: 'Rafiqbhai Karim',
    status: 'Received from karigar',
    photo: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&q=80&w=600',
    notes: 'Multicolor pure silk thread floral embroidery scattered evenly all over the body.',
    lastUpdated: '2026-06-23',
    clothPrice: 12000,
    karigarWages: 18500,
    materialsCost: 6000,
    totalCost: 36500,
    expectedDeliveryDate: '2026-06-28',
    associatedOrderNumber: 'Stock (For Ready Sale)'
  },
  {
    id: 'emb-3',
    barcode: 'EMB-PK903',
    type: 'Cutwork Scalloped Border',
    colour: 'Jade Green',
    karigar: 'Maqbool Ansari',
    status: 'Ready',
    photo: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600',
    notes: 'Stunning geometric wave cutwork border on high quality satin backing.',
    lastUpdated: '2026-06-15',
    clothPrice: 8500,
    karigarWages: 14000,
    materialsCost: 4500,
    totalCost: 27000,
    expectedDeliveryDate: '2026-06-12',
    associatedOrderNumber: 'PK-2026-602'
  },
  {
    id: 'emb-4',
    barcode: 'EMB-PK904',
    type: 'Mirror and Aari Work',
    colour: 'Turquoise Blue',
    karigar: 'Ismailbhai Zardosi',
    status: 'Pending',
    photo: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
    notes: 'Kutch style mirror work inside chain stitch gold motifs.',
    lastUpdated: '2026-06-20',
    clothPrice: 9000,
    karigarWages: 21000,
    materialsCost: 8000,
    totalCost: 38000,
    expectedDeliveryDate: '2026-07-20',
    associatedOrderNumber: 'Showroom Sample'
  }
];

export const ALL_KARIGARS = [
  'Ismailbhai Zardosi',
  'Rafiqbhai Karim',
  'Maqbool Ansari',
  'Sajid Ali',
  'Devendra Vaskar'
];

export const EMBROIDERIES_TYPES_LIST = [
  'Zari',
  'Thread',
  'Mirror',
  'Sequence',
  'Aari',
  'Cutwork',
  'Resham',
  'Stone'
];

export const SAREE_TYPES_LIST = [
  'Banarasi',
  'Kanjivaram',
  'Paithani',
  'Chanderi',
  'Organza',
  'Georgette',
  'Bandhani',
  'Patola',
  'Gara',
  'Satin Silk',
  'Tissue'
];

export const PAYMENT_MODES = [
  'Cash',
  'Credit Card',
  'UPI (GPay)',
  'UPI (Razorpay Storefront)',
  'UPI (PhonePe)',
  'Bank Transfer (HDFC)',
  'Bank Transfer (ICICI)',
  'Cheque'
];
