export type Garment = {
  id: number;
  type: string;
  publicToken: string;
  clientId: string;
  qrCodeUrl: string;
  captureUrl: string;
  createdAt: string;
  clientPassword?: string | null;
};

export type ProductStatus = "available" | "coming-soon" | "draft";

export type Product = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  price: number;
  unitAmount: number;
  currency: "eur";
  collection: string;
  category: string;
  tags: string[];
  colorway: string;
  description: string;
  vibe: string;
  cardImage: string;
  details: string[];
  images: Array<{ label: string; src: string; kind: string }>;
  variants: Array<{ name: string; textile: string; print: string; accent: string }>;
  sizes: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderLineItem = {
  productId: string;
  title: string;
  variant: string;
  size: string;
  quantity: number;
  unitAmount: number;
};

export type Order = {
  id: number;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  customerEmail: string | null;
  amountTotal: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "fulfilled" | string;
  lineItems: OrderLineItem[];
  qrGarmentIds: number[];
  createdAt: string;
  updatedAt: string;
};

export type AdminData = {
  garments: Garment[];
  products: Product[];
  orders: Order[];
  errors: string[];
};
