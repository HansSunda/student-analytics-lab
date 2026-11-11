export interface DemoSalesRow {
  OrderID: string;
  OrderDate: string;
  CustomerSegment: 'Mahasiswa' | 'Korporat' | 'UMKM' | 'Individu';
  Region: string; // Intentional casing variations: Jakarta, jakarta, JAKARTA
  ProductCategory: 'Elektronik' | 'Perlengkapan Kantor' | 'Buku & Modul' | 'Aksesoris IT';
  ProductName: string;
  Quantity: number;
  UnitPrice: number;
  Discount: number | null; // Intentional nulls
  Revenue: number;
  Cost: number;
  Profit: number;
}

// Generate realistic Indonesian sales dataset
export function generateDemoDataset(): DemoSalesRow[] {
  const regions = [
    'Jakarta', 'Jakarta', 'jakarta', 'JAKARTA', 'Surabaya', 'Bandung', 
    'Medan', 'Semarang', 'Yogyakarta', 'Makassar', 'Denpasar'
  ];
  
  const categories: Array<DemoSalesRow['ProductCategory']> = [
    'Elektronik', 'Perlengkapan Kantor', 'Buku & Modul', 'Aksesoris IT'
  ];

  const productsByCategory: Record<DemoSalesRow['ProductCategory'], Array<{ name: string; price: number; cost: number }>> = {
    'Elektronik': [
      { name: 'Monitor LED 24"', price: 1650000, cost: 1300000 },
      { name: 'Keyboard Mekanikal', price: 450000, cost: 320000 },
      { name: 'Mouse Wireless Ergonomis', price: 185000, cost: 120000 },
      { name: 'Webcam Full HD 1080p', price: 380000, cost: 260000 }
    ],
    'Perlengkapan Kantor': [
      { name: 'Kertas HVS A4 80gr Rim', price: 58000, cost: 45000 },
      { name: 'Binder Clip Set Besar', price: 24000, cost: 15000 },
      { name: 'Desk Organizer Akrilik', price: 85000, cost: 55000 },
      { name: 'Stapler Heavy Duty', price: 95000, cost: 65000 }
    ],
    'Buku & Modul': [
      { name: 'Buku Metodologi Penelitian Bisnis', price: 125000, cost: 80000 },
      { name: 'Panduan Praktis Data Science', price: 160000, cost: 105000 },
      { name: 'Statistika Inferensial untuk Ekonomi', price: 110000, cost: 72000 },
      { name: 'Analisis Keuangan Korporasi', price: 145000, cost: 95000 }
    ],
    'Aksesoris IT': [
      { name: 'USB Flashdrive 64GB 3.0', price: 75000, cost: 48000 },
      { name: 'Kabel HDMI Braided 2M', price: 45000, cost: 25000 },
      { name: 'Laptop Stand Aluminium', price: 135000, cost: 85000 },
      { name: 'USB-C Multiport Adapter 6-in-1', price: 260000, cost: 175000 }
    ]
  };

  const segments: Array<DemoSalesRow['CustomerSegment']> = ['Mahasiswa', 'UMKM', 'Korporat', 'Individu'];

  const rows: DemoSalesRow[] = [];
  const baseDate = new Date('2024-01-01');

  // Generate 250 rows for snappy demo interaction
  for (let i = 1; i <= 250; i++) {
    const category = categories[i % categories.length];
    const productList = productsByCategory[category];
    const product = productList[i % productList.length];
    const segment = segments[i % segments.length];
    const region = regions[i % regions.length];

    const quantity = (i % 7) + 1;
    // Missing discount intentionally on some rows
    const hasDiscount = (i % 12 !== 0);
    const discount = hasDiscount ? parseFloat(((i % 5) * 0.05).toFixed(2)) : null;

    const effectiveDiscount = discount ?? 0;
    const revenue = Math.round(quantity * product.price * (1 - effectiveDiscount));
    const cost = Math.round(quantity * product.cost);
    const profit = revenue - cost;

    const date = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000 * 1.2));
    const dateStr = date.toISOString().split('T')[0];

    rows.push({
      OrderID: `ORD-2024-${String(i).padStart(4, '0')}`,
      OrderDate: dateStr,
      CustomerSegment: segment,
      Region: region,
      ProductCategory: category,
      ProductName: product.name,
      Quantity: quantity,
      UnitPrice: product.price,
      Discount: discount,
      Revenue: revenue,
      Cost: cost,
      Profit: profit
    });
  }

  // Insert intentional duplicates (e.g. 5 duplicate rows)
  for (let d = 0; d < 5; d++) {
    rows.push({ ...rows[d * 10] });
  }

  return rows;
}

