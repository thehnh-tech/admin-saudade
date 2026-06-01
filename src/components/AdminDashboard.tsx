"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Boxes,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  PackageCheck,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  Shirt,
  ShoppingBag,
  Trash2,
  Users,
  X
} from "lucide-react";
import type { AdminData, Garment, Order, Product, ProductStatus, PublicFeedPhoto } from "@/lib/types";

type Tab = "overview" | "accounts" | "marketplace" | "orders" | "public-feed";

type ProductFormState = {
  title: string;
  shortTitle: string;
  colorway: string;
  price: string;
  status: ProductStatus;
  category: string;
  collection: string;
  description: string;
  vibe: string;
  cardImage: string;
  tags: string;
  sizes: string;
};

const productStatuses: ProductStatus[] = ["draft", "coming-soon", "available"];

const emptyProductForm: ProductFormState = {
  title: "SAUDADE Night Access Oversized T-Shirt",
  shortTitle: "Night Access Tee",
  colorway: "White / Red",
  price: "69",
  status: "draft",
  category: "T-shirts",
  collection: "SAUDADE 0024 - Night Access",
  description: "",
  vibe: "",
  cardImage: "/assets/tee-white-red-card.png",
  tags: "night access, qr memory",
  sizes: "XS, S, M, L, XL, XXL"
};

const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "accounts", label: "Accounts", icon: Users },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "orders", label: "Orders", icon: PackageCheck },
  { id: "public-feed", label: "Public Feed", icon: Images }
];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100);
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formFromProduct(product: Product): ProductFormState {
  return {
    title: product.title,
    shortTitle: product.shortTitle,
    colorway: product.colorway,
    price: String(product.price),
    status: product.status,
    category: product.category,
    collection: product.collection,
    description: product.description ?? "",
    vibe: product.vibe ?? "",
    cardImage: product.cardImage,
    tags: product.tags.join(", "),
    sizes: product.sizes.join(", ")
  };
}

function productPayload(form: ProductFormState) {
  const price = Number(form.price.replace(",", "."));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Price must be a valid number.");
  }

  return {
    title: form.title.trim(),
    shortTitle: form.shortTitle.trim() || form.title.trim(),
    colorway: form.colorway.trim(),
    price,
    status: form.status,
    category: form.category.trim(),
    collection: form.collection.trim(),
    description: form.description.trim() || undefined,
    vibe: form.vibe.trim() || undefined,
    cardImage: form.cardImage.trim() || undefined,
    tags: splitList(form.tags),
    sizes: splitList(form.sizes)
  };
}

async function adminApi<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body ? String(body.error) : "Request failed.";
    throw new Error(message);
  }
  return body as T;
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const inputClass = "mt-2 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink";
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.14em] text-stone">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${inputClass} min-h-28 py-3`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${inputClass} h-11`}
        />
      )}
    </label>
  );
}

function ProductFields({
  form,
  setForm
}: {
  form: ProductFormState;
  setForm: (form: ProductFormState) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField label="Title" value={form.title} onChange={(title) => setForm({ ...form, title })} />
      <TextField label="Short title" value={form.shortTitle} onChange={(shortTitle) => setForm({ ...form, shortTitle })} />
      <TextField label="Colorway" value={form.colorway} onChange={(colorway) => setForm({ ...form, colorway })} />
      <TextField label="Price EUR" value={form.price} onChange={(price) => setForm({ ...form, price })} />
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-stone">Status</span>
        <select
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value as ProductStatus })}
          className="mt-2 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink"
        >
          {productStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
      <TextField label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} />
      <TextField label="Collection" value={form.collection} onChange={(collection) => setForm({ ...form, collection })} />
      <TextField label="Card image" value={form.cardImage} onChange={(cardImage) => setForm({ ...form, cardImage })} />
      <TextField label="Tags" value={form.tags} onChange={(tags) => setForm({ ...form, tags })} />
      <TextField label="Sizes" value={form.sizes} onChange={(sizes) => setForm({ ...form, sizes })} />
      <div className="sm:col-span-2">
        <TextField label="Description" value={form.description} onChange={(description) => setForm({ ...form, description })} multiline />
      </div>
      <div className="sm:col-span-2">
        <TextField label="Vibe" value={form.vibe} onChange={(vibe) => setForm({ ...form, vibe })} multiline />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-bone p-4 shadow-soft">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-stone">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

export function AdminDashboard({
  initialData,
  backendUrl,
  marketplaceUrl
}: {
  initialData: AdminData;
  backendUrl: string;
  marketplaceUrl: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialData.errors.join(" | "));
  const [busy, setBusy] = useState("");
  const [accountSearch, setAccountSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [publicFeedSearch, setPublicFeedSearch] = useState("");
  const [garmentType, setGarmentType] = useState("tshirt");
  const [createdGarment, setCreatedGarment] = useState<Garment | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});
  const [newProduct, setNewProduct] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<ProductFormState>(emptyProductForm);

  const stats = useMemo(() => {
    const availableProducts = data.products.filter((product) => product.status === "available").length;
    const paidOrders = data.orders.filter((order) => order.status === "paid").length;
    const revenue = data.orders
      .filter((order) => ["paid", "fulfilled"].includes(order.status))
      .reduce((total, order) => total + order.amountTotal, 0);

    return {
      accounts: data.garments.length,
      products: `${availableProducts}/${data.products.length}`,
      orders: paidOrders,
      revenue: formatAmount(revenue, "eur"),
      publicFeed: data.publicFeedPhotos.length
    };
  }, [data]);

  const filteredGarments = useMemo(() => {
    const needle = accountSearch.trim().toLowerCase();
    if (!needle) return data.garments;
    return data.garments.filter((garment) => (
      `${garment.id} ${garment.type} ${garment.clientId} ${garment.publicToken}`.toLowerCase().includes(needle)
    ));
  }, [accountSearch, data.garments]);

  const filteredProducts = useMemo(() => {
    const needle = productSearch.trim().toLowerCase();
    if (!needle) return data.products;
    return data.products.filter((product) => (
      `${product.id} ${product.title} ${product.shortTitle} ${product.colorway} ${product.status}`.toLowerCase().includes(needle)
    ));
  }, [productSearch, data.products]);

  const filteredOrders = useMemo(() => {
    const needle = orderSearch.trim().toLowerCase();
    if (!needle) return data.orders;
    return data.orders.filter((order) => (
      `${order.id} ${order.status} ${order.customerEmail ?? ""} ${order.stripeSessionId}`.toLowerCase().includes(needle)
    ));
  }, [data.orders, orderSearch]);

  const filteredPublicFeedPhotos = useMemo(() => {
    const needle = publicFeedSearch.trim().toLowerCase();
    if (!needle) return data.publicFeedPhotos;
    return data.publicFeedPhotos.filter((photo) => (
      `${photo.id} ${photo.email ?? ""} ${photo.captureMode} ${photo.moderationStatus} ${photo.userAgent ?? ""}`.toLowerCase().includes(needle)
    ));
  }, [data.publicFeedPhotos, publicFeedSearch]);

  function imageUrl(src: string) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (src.startsWith("/")) return `${marketplaceUrl}${src}`;
    return src;
  }

  async function refreshAll() {
    setBusy("refresh");
    setError("");
    try {
      const [garments, products, orders, publicFeedQr, publicFeedPhotos] = await Promise.all([
        adminApi<{ garments: Garment[] }>("/garments"),
        adminApi<{ products: Product[] }>("/products"),
        adminApi<{ orders: Order[] }>("/orders"),
        adminApi<{ qr: Garment | null }>("/public-feed/qr"),
        adminApi<{ photos: PublicFeedPhoto[] }>("/public-feed/photos")
      ]);
      setData({
        garments: garments.garments,
        products: products.products,
        orders: orders.orders,
        publicFeedQr: publicFeedQr.qr,
        publicFeedPhotos: publicFeedPhotos.photos,
        errors: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh admin data.");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  async function copy(value: string) {
    await navigator.clipboard?.writeText(value).catch(() => undefined);
  }

  async function createGarment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create-garment");
    setError("");
    try {
      const garment = await adminApi<Garment>("/garments", {
        method: "POST",
        body: JSON.stringify({ type: garmentType })
      });
      setCreatedGarment(garment);
      setData((current) => ({ ...current, garments: [garment, ...current.garments] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setBusy("");
    }
  }

  async function deleteGarment(garment: Garment) {
    if (!window.confirm(`Delete account #${garment.id}?`)) return;
    setBusy(`garment-${garment.id}`);
    setError("");
    try {
      await adminApi<{ ok: true }>(`/garments/${garment.id}`, { method: "DELETE" });
      setData((current) => ({ ...current, garments: current.garments.filter((item) => item.id !== garment.id) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account.");
    } finally {
      setBusy("");
    }
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("create-product");
    setError("");
    try {
      const response = await adminApi<{ product: Product }>("/products", {
        method: "POST",
        body: JSON.stringify(productPayload(newProduct))
      });
      setData((current) => ({ ...current, products: [response.product, ...current.products] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setBusy("");
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingProductId) return;
    setBusy(`product-${editingProductId}`);
    setError("");
    try {
      const response = await adminApi<{ product: Product }>(`/products/${editingProductId}`, {
        method: "PATCH",
        body: JSON.stringify(productPayload(editProduct))
      });
      setData((current) => ({
        ...current,
        products: current.products.map((product) => product.id === editingProductId ? response.product : product)
      }));
      setEditingProductId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setBusy("");
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete ${product.shortTitle}?`)) return;
    setBusy(`product-${product.id}`);
    setError("");
    try {
      await adminApi<{ ok: true }>(`/products/${product.id}`, { method: "DELETE" });
      setData((current) => ({ ...current, products: current.products.filter((item) => item.id !== product.id) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.");
    } finally {
      setBusy("");
    }
  }

  async function resendOrderEmail(order: Order) {
    setBusy(`order-${order.id}`);
    setError("");
    try {
      await adminApi<{ ok: true }>(`/orders/${order.id}/resend-email`, { method: "POST" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend email.");
    } finally {
      setBusy("");
    }
  }

  async function deletePublicFeedPhoto(photo: PublicFeedPhoto) {
    if (!window.confirm(`Delete public feed photo #${photo.id}?`)) return;
    setBusy(`public-feed-${photo.id}`);
    setError("");
    try {
      await adminApi<{ ok: true }>(`/public-feed/photos/${photo.id}`, { method: "DELETE" });
      setData((current) => ({
        ...current,
        publicFeedPhotos: current.publicFeedPhotos.filter((item) => item.id !== photo.id)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete public feed photo.");
    } finally {
      setBusy("");
    }
  }

  function startProductEdit(product: Product) {
    setEditingProductId(product.id);
    setEditProduct(formFromProduct(product));
  }

  function searchBox(value: string, onChange: (value: string) => void, label: string) {
    return (
      <label className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone" size={17} aria-hidden="true" />
        <span className="sr-only">{label}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-line bg-white pl-10 pr-3 text-sm font-bold text-ink"
          placeholder={label}
        />
      </label>
    );
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-0 z-30 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-lg object-contain" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-red">SAUDADE</p>
              <p className="text-lg font-black uppercase leading-none">Admin</p>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-black uppercase ${
                    selected ? "bg-red text-white" : "border border-line bg-bone text-ink"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-4 hidden h-11 w-full items-center justify-center gap-2 rounded-lg border border-line bg-bone px-3 text-sm font-black uppercase text-red lg:flex"
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </button>
        </aside>

        <section className="px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Backend: {backendUrl.replace(/^https?:\/\//, "")}</p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-none sm:text-4xl">Control Room</h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={refreshAll}
                disabled={busy === "refresh"}
                className="flex h-11 items-center gap-2 rounded-lg bg-red px-4 text-sm font-black uppercase text-white disabled:opacity-60"
              >
                <RefreshCw size={17} aria-hidden="true" />
                Refresh
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex h-11 items-center justify-center rounded-lg border border-line bg-bone px-3 text-red lg:hidden"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          {error ? (
            <p className="mt-4 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm font-bold text-red">{error}</p>
          ) : null}

          <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="Client accounts" value={stats.accounts} />
            <Stat label="Live products" value={stats.products} />
            <Stat label="Paid orders" value={stats.orders} />
            <Stat label="Gross paid" value={stats.revenue} />
            <Stat label="Public photos" value={stats.publicFeed} />
          </section>

          {activeTab === "overview" ? (
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <button type="button" onClick={() => setActiveTab("accounts")} className="rounded-lg border border-line bg-bone p-5 text-left shadow-soft">
                <Users className="text-red" size={24} aria-hidden="true" />
                <p className="mt-5 text-xl font-black uppercase">Accounts</p>
                <p className="mt-2 text-sm font-bold text-stone">{data.garments.length} QR/client kits</p>
              </button>
              <button type="button" onClick={() => setActiveTab("marketplace")} className="rounded-lg border border-line bg-bone p-5 text-left shadow-soft">
                <ShoppingBag className="text-red" size={24} aria-hidden="true" />
                <p className="mt-5 text-xl font-black uppercase">Marketplace</p>
                <p className="mt-2 text-sm font-bold text-stone">{data.products.length} catalog products</p>
              </button>
              <button type="button" onClick={() => setActiveTab("orders")} className="rounded-lg border border-line bg-bone p-5 text-left shadow-soft">
                <PackageCheck className="text-red" size={24} aria-hidden="true" />
                <p className="mt-5 text-xl font-black uppercase">Orders</p>
                <p className="mt-2 text-sm font-bold text-stone">{data.orders.length} Stripe records</p>
              </button>
              <button type="button" onClick={() => setActiveTab("public-feed")} className="rounded-lg border border-line bg-bone p-5 text-left shadow-soft">
                <Images className="text-red" size={24} aria-hidden="true" />
                <p className="mt-5 text-xl font-black uppercase">Public Feed</p>
                <p className="mt-2 text-sm font-bold text-stone">{data.publicFeedPhotos.length} sticker captures</p>
              </button>
            </section>
          ) : null}

          {activeTab === "accounts" ? (
            <section className="mt-6 grid gap-5 xl:grid-cols-[380px_1fr]">
              <form onSubmit={createGarment} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <QrCode className="text-red" size={21} aria-hidden="true" />
                  <h2 className="text-lg font-black uppercase">New account</h2>
                </div>
                <div className="mt-5">
                  <TextField label="Garment type" value={garmentType} onChange={setGarmentType} />
                </div>
                <button
                  type="submit"
                  disabled={busy === "create-garment"}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red px-4 text-sm font-black uppercase text-white disabled:opacity-60"
                >
                  <Plus size={17} aria-hidden="true" />
                  {busy === "create-garment" ? "Generating" : "Generate kit"}
                </button>

                {createdGarment ? (
                  <div className="mt-5 border-t border-line pt-5">
                    <img src={createdGarment.qrCodeUrl} alt="" className="aspect-square w-full rounded-lg border border-line bg-white object-contain" />
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Client ID</p>
                    <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-red">{createdGarment.clientId}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Password</p>
                    <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-red">{createdGarment.clientPassword ?? "not stored"}</p>
                  </div>
                ) : null}
              </form>

              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-black uppercase">Client accounts</h2>
                  {searchBox(accountSearch, setAccountSearch, "Search accounts")}
                </div>
                <div className="grid gap-3">
                  {filteredGarments.map((garment) => {
                    const showPassword = Boolean(revealedPasswords[garment.id]);
                    const password = garment.clientPassword ?? "";
                    return (
                      <article key={garment.id} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                        <div className="grid gap-4 sm:grid-cols-[1fr_112px]">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-black uppercase">{garment.type} #{garment.id}</p>
                              <span className="rounded-lg bg-red/10 px-2 py-1 text-xs font-black uppercase text-red">{formatDate(garment.createdAt)}</span>
                            </div>
                            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Client ID</p>
                            <p className="mt-1 break-all font-mono text-sm font-bold text-ink">{garment.clientId}</p>
                            <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Password</p>
                            <p className="mt-1 break-all font-mono text-sm font-bold text-ink">
                              {password ? (showPassword ? password : "*".repeat(Math.min(password.length, 14))) : "not stored"}
                            </p>
                            <a href={garment.captureUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 break-all text-sm font-black text-red">
                              <ExternalLink size={16} aria-hidden="true" />
                              {garment.captureUrl}
                            </a>
                          </div>
                          <img src={garment.qrCodeUrl} alt="" className="aspect-square w-28 rounded-lg border border-line bg-white object-contain" />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => copy(garment.clientId)} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                            <Copy size={15} aria-hidden="true" />
                            ID
                          </button>
                          {password ? (
                            <>
                              <button type="button" onClick={() => copy(password)} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                                <Copy size={15} aria-hidden="true" />
                                Password
                              </button>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswords((current) => ({ ...current, [garment.id]: !current[garment.id] }))}
                                className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase"
                              >
                                {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                                {showPassword ? "Hide" : "Show"}
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => deleteGarment(garment)}
                            disabled={busy === `garment-${garment.id}`}
                            className="flex h-10 items-center gap-2 rounded-lg border border-red/30 bg-red/10 px-3 text-xs font-black uppercase text-red disabled:opacity-60"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {filteredGarments.length === 0 ? <p className="rounded-lg border border-line bg-bone p-4 text-sm font-bold text-stone">No accounts found.</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "marketplace" ? (
            <section className="mt-6 grid gap-5 xl:grid-cols-[440px_1fr]">
              <form onSubmit={createProduct} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <Shirt className="text-red" size={21} aria-hidden="true" />
                  <h2 className="text-lg font-black uppercase">New product</h2>
                </div>
                <div className="mt-5">
                  <ProductFields form={newProduct} setForm={setNewProduct} />
                </div>
                <button
                  type="submit"
                  disabled={busy === "create-product"}
                  className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-red px-4 text-sm font-black uppercase text-white disabled:opacity-60"
                >
                  <Plus size={17} aria-hidden="true" />
                  {busy === "create-product" ? "Creating" : "Create product"}
                </button>
              </form>

              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-black uppercase">Catalog</h2>
                  {searchBox(productSearch, setProductSearch, "Search products")}
                </div>
                <div className="grid gap-3">
                  {filteredProducts.map((product) => {
                    const isEditing = editingProductId === product.id;
                    return (
                      <article key={product.id} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                        {isEditing ? (
                          <form onSubmit={saveProduct}>
                            <ProductFields form={editProduct} setForm={setEditProduct} />
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="submit"
                                disabled={busy === `product-${product.id}`}
                                className="flex h-10 items-center gap-2 rounded-lg bg-red px-3 text-xs font-black uppercase text-white disabled:opacity-60"
                              >
                                <Save size={15} aria-hidden="true" />
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProductId(null)}
                                className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase"
                              >
                                <X size={15} aria-hidden="true" />
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
                              <img src={imageUrl(product.cardImage)} alt="" className="aspect-square w-28 rounded-lg border border-line bg-white object-cover" />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-lg font-black uppercase">{product.shortTitle}</p>
                                  <span className="rounded-lg bg-red/10 px-2 py-1 text-xs font-black uppercase text-red">{product.status}</span>
                                </div>
                                <p className="mt-2 text-sm font-bold text-stone">{product.title}</p>
                                <p className="mt-2 text-sm font-black text-ink">{product.price} EUR - {product.colorway}</p>
                                <p className="mt-2 break-all font-mono text-xs text-stone">{product.id}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button type="button" onClick={() => startProductEdit(product)} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                                <Save size={15} aria-hidden="true" />
                                Edit
                              </button>
                              <a href={`${marketplaceUrl}/product/${product.id}`} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                                <ExternalLink size={15} aria-hidden="true" />
                                Open
                              </a>
                              <button
                                type="button"
                                onClick={() => deleteProduct(product)}
                                disabled={busy === `product-${product.id}`}
                                className="flex h-10 items-center gap-2 rounded-lg border border-red/30 bg-red/10 px-3 text-xs font-black uppercase text-red disabled:opacity-60"
                              >
                                <Trash2 size={15} aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </article>
                    );
                  })}
                  {filteredProducts.length === 0 ? <p className="rounded-lg border border-line bg-bone p-4 text-sm font-bold text-stone">No products found.</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "public-feed" ? (
            <section className="mt-6 grid gap-5 xl:grid-cols-[380px_1fr]">
              <div className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                <div className="flex items-center gap-2">
                  <QrCode className="text-red" size={21} aria-hidden="true" />
                  <h2 className="text-lg font-black uppercase">Sticker QR</h2>
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-stone">
                  Use this special QR for stickers. Captures sent through it can appear on the public marketplace homepage feed.
                </p>

                {data.publicFeedQr ? (
                  <div className="mt-5 border-t border-line pt-5">
                    <img src={data.publicFeedQr.qrCodeUrl} alt="" className="aspect-square w-full rounded-lg border border-line bg-white object-contain" />
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Capture URL</p>
                    <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-red">{data.publicFeedQr.captureUrl}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Public token</p>
                    <p className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-ink">{data.publicFeedQr.publicToken}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => copy(data.publicFeedQr?.captureUrl ?? "")} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                        <Copy size={15} aria-hidden="true" />
                        URL
                      </button>
                      <button type="button" onClick={() => copy(data.publicFeedQr?.qrCodeUrl ?? "")} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                        <Copy size={15} aria-hidden="true" />
                        QR image
                      </button>
                      <a href={data.publicFeedQr.captureUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                        <ExternalLink size={15} aria-hidden="true" />
                        Open
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 rounded-lg border border-red/30 bg-red/10 px-3 py-2 text-sm font-bold text-red">
                    The special QR is not available yet. Refresh after the backend is configured.
                  </p>
                )}
              </div>

              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-black uppercase">Public feed images</h2>
                  {searchBox(publicFeedSearch, setPublicFeedSearch, "Search public images")}
                </div>
                <div className="grid gap-3">
                  {filteredPublicFeedPhotos.map((photo) => (
                    <article key={photo.id} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-white">
                          <img src={imageUrl(photo.imageUrl)} alt="" className="h-full w-full object-cover" />
                          <span className="absolute left-2 top-2 rounded-lg bg-ink/80 px-2 py-1 font-mono text-[10px] font-black uppercase text-white">
                            {photo.primaryLabel ?? "Rear"}
                          </span>
                          {photo.secondaryImageUrl ? (
                            <div className="absolute right-2 top-2 h-[42%] w-[36%] overflow-hidden rounded-lg border-2 border-white bg-ink shadow-soft">
                              <img src={imageUrl(photo.secondaryImageUrl)} alt="" className="h-full w-full object-cover" />
                              <span className="absolute left-1 top-1 rounded-md bg-ink/80 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-white">
                                {photo.secondaryLabel ?? "Front"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-black uppercase">Photo #{photo.id}</p>
                            <span className="rounded-lg bg-red/10 px-2 py-1 text-xs font-black uppercase text-red">{photo.moderationStatus}</span>
                            <span className="rounded-lg bg-white px-2 py-1 text-xs font-black uppercase text-stone">{photo.captureMode}</span>
                          </div>
                          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Email</p>
                          <p className="mt-1 break-all text-sm font-bold text-ink">{photo.email ?? "No email"}</p>
                          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Created</p>
                          <p className="mt-1 font-mono text-sm font-bold text-ink">{formatDate(photo.createdAt)}</p>
                          <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-stone">Consent</p>
                          <p className="mt-1 text-sm font-bold text-ink">{photo.marketingConsent ? "Marketing consent accepted" : "No marketing consent recorded"}</p>
                          <p className="mt-3 break-all font-mono text-xs text-stone">{photo.userAgent ?? "No user agent"}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {photo.email ? (
                          <button type="button" onClick={() => copy(photo.email ?? "")} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                            <Copy size={15} aria-hidden="true" />
                            Email
                          </button>
                        ) : null}
                        <a href={photo.imageUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                          <ExternalLink size={15} aria-hidden="true" />
                          Image
                        </a>
                        <button
                          type="button"
                          onClick={() => deletePublicFeedPhoto(photo)}
                          disabled={busy === `public-feed-${photo.id}`}
                          className="flex h-10 items-center gap-2 rounded-lg border border-red/30 bg-red/10 px-3 text-xs font-black uppercase text-red disabled:opacity-60"
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                  {filteredPublicFeedPhotos.length === 0 ? <p className="rounded-lg border border-line bg-bone p-4 text-sm font-bold text-stone">No public feed images found.</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeTab === "orders" ? (
            <section className="mt-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-black uppercase">Orders</h2>
                {searchBox(orderSearch, setOrderSearch, "Search orders")}
              </div>
              <div className="grid gap-3">
                {filteredOrders.map((order) => (
                  <article key={order.stripeSessionId} className="rounded-lg border border-line bg-bone p-4 shadow-soft">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-black uppercase">Order #{order.id}</p>
                          <span className="rounded-lg bg-red/10 px-2 py-1 text-xs font-black uppercase text-red">{order.status}</span>
                        </div>
                        <p className="mt-2 text-sm font-bold text-stone">{order.customerEmail ?? "No email"}</p>
                        <p className="mt-2 font-mono text-xs text-stone">{formatDate(order.createdAt)}</p>
                      </div>
                      <p className="text-xl font-black">{formatAmount(order.amountTotal, order.currency)}</p>
                    </div>
                    <div className="mt-4 grid gap-2">
                      {order.lineItems.map((item, index) => (
                        <div key={`${item.productId}-${index}`} className="rounded-lg border border-line bg-white px-3 py-2">
                          <p className="text-sm font-black">{item.title}</p>
                          <p className="mt-1 text-sm font-bold text-stone">{item.variant} - {item.size} - x{item.quantity}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => resendOrderEmail(order)}
                        disabled={busy === `order-${order.id}` || !order.customerEmail}
                        className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Mail size={15} aria-hidden="true" />
                        Resend email
                      </button>
                      <button type="button" onClick={() => copy(order.stripeSessionId)} className="flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-black uppercase">
                        <Copy size={15} aria-hidden="true" />
                        Session
                      </button>
                    </div>
                  </article>
                ))}
                {filteredOrders.length === 0 ? <p className="rounded-lg border border-line bg-bone p-4 text-sm font-bold text-stone">No orders found.</p> : null}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
