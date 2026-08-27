export type Garment = {
  id: number;
  type: string;
  purpose?: "client-feed" | "public-feed";
  captureKind?: "client-feed" | "public-feed";
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

export type PublicFeedPhoto = {
  id: number;
  garmentId: number;
  imageUrl: string;
  secondaryImageUrl: string | null;
  createdAt: string;
  captureMode: string;
  primaryLabel?: string;
  secondaryLabel?: string | null;
  uploaderIp: string | null;
  email: string | null;
  marketingConsent: boolean;
  moderationStatus: string;
  userAgent: string | null;
};

export type AroundReportStatus = "open" | "actioned" | "dismissed";

export type AroundReportedPhoto = {
  id: string;
  aroundId: string;
  uploaderPseudo: string;
  status: "pending" | "approved" | "rejected" | "removed_by_moderation";
  /** null once the photo is purged (server emits null when purgeState !== "live"). */
  rearUrl: string | null;
  frontUrl?: string | null;
};

export type AroundReportedUser = {
  id: string;
  pseudo: string;
  status: "active" | "banned";
};

/**
 * A reported around: the reported content IS its name, and the report can come
 * from someone who never joined (they only received the push notification).
 * Neither `photo` nor `user` is set on such a report.
 */
export type AroundReportedAround = {
  id: string;
  name: string | null;
  ownerId: string;
  ownerPseudo: string;
  status: "active" | "closed" | "purging" | "purged";
  memberCount: number;
  photoCount: number;
};

export type AroundReport = {
  id: string;
  targetType: "photo" | "user" | "around";
  reason: string;
  comment?: string | null;
  status: AroundReportStatus;
  createdAt: string;
  reporterPseudo: string;
  photo?: AroundReportedPhoto | null;
  user?: AroundReportedUser | null;
  around?: AroundReportedAround | null;
};

export type AroundSummary = {
  id: string;
  name?: string | null;
  ownerPseudo?: string | null;
  status: "active" | "closed" | "purging" | "purged";
  memberCount: number;
  photoCount: number;
  radiusM: number;
  captureEndsAt: string;
  expiresAt: string;
  createdAt: string;
};

export type AdminData = {
  garments: Garment[];
  products: Product[];
  orders: Order[];
  publicFeedQr: Garment | null;
  publicFeedPhotos: PublicFeedPhoto[];
  aroundReports: AroundReport[];
  arounds: AroundSummary[];
  errors: string[];
};
