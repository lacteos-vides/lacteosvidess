"use client";

/* Pantalla de productos para TV: sin scroll, letra grande, llamativa */

const MOCK_PRODUCTOS = [
  { name: "Quesillo Blanco Especial", price: 2.9, category: "Quesillo" },
  { name: "Quesillo Súper Especial", price: 3.0, category: "Quesillo" },
  { name: "Queso Duro Viejo", price: 4.5, category: "Queso" },
  { name: "Queso Majado", price: 3.5, category: "Queso" },
  { name: "Crema Natural", price: 2.8, category: "Crema" },
  { name: "Mantequilla", price: 3.2, category: "Crema" },
  { name: "Leche Entera 1L", price: 1.5, category: "Leche" },
  { name: "Leche Descremada 1L", price: 1.6, category: "Leche" },
  { name: "Yogurt Natural", price: 2.2, category: "Yogurt" },
  { name: "Requesón", price: 2.5, category: "Quesillo" },
  { name: "Cuajada", price: 2.7, category: "Quesillo" },
  { name: "Queso Fresco", price: 3.8, category: "Queso" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function ProductosDisplayPage() {
  const mid = Math.ceil(MOCK_PRODUCTOS.length / 2);
  const col1 = MOCK_PRODUCTOS.slice(0, mid);
  const col2 = MOCK_PRODUCTOS.slice(mid);

  return (
    <div className="fixed inset-0 flex h-screen w-screen flex-col overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat blur-[3px]"
          style={{ backgroundImage: "url('/brand/BANNER%20PARA%20IMPRESION2.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/50 via-amber-900/35 to-amber-950/55" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-[20%] h-32 w-32 animate-pulse rounded-full bg-amber-400/10 blur-3xl" />
          <div className="absolute right-[15%] bottom-[30%] h-40 w-40 animate-pulse rounded-full bg-yellow-300/10 blur-3xl" style={{ animationDelay: "1s" }} />
        </div>
      </div>

      {/* Contenido: sin scroll, todo visible */}
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-4 md:p-6 lg:p-8">
        {/* Header compacto: logo + título + slogan en una fila */}
        <header className="mb-4 flex shrink-0 items-center justify-center gap-4 md:mb-6 md:gap-6">
          <div className="animate-float shrink-0 drop-shadow-2xl">
            <img
              src="/brand/IMAGEN_PRINCIPAL.png"
              alt="Lácteos Vides"
              className="h-16 w-auto md:h-20"
            />
          </div>
          <div className="flex flex-col items-center gap-0.5 md:items-start">
            <div className="relative overflow-hidden rounded-xl bg-amber-500/20 px-4 py-2 backdrop-blur-sm md:px-6 md:py-3">
              <div className="absolute inset-0 animate-shimmer rounded-xl" />
              <h1 className="relative text-2xl font-black tracking-tight text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                LÁCTEOS VIDES
              </h1>
            </div>
            <p className="animate-pulse-glow text-sm font-bold text-amber-200 md:text-lg lg:text-xl">
              ✦ La mejor calidad al mejor precio ✦
            </p>
          </div>
        </header>

        {/* Listado: letra grande, animado, sin scroll */}
        <main className="flex min-h-0 flex-1 items-center justify-center">
          <div className="grid w-full max-w-6xl flex-1 grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-12 md:gap-y-2 lg:gap-x-16 lg:gap-y-3">
            <ul className="flex min-h-0 flex-1 flex-col justify-evenly gap-1 md:gap-2">
              {col1.map((p, i) => (
                <ProductRow key={i} product={p} index={i} formatPrice={formatPrice} />
              ))}
            </ul>
            <ul className="flex min-h-0 flex-1 flex-col justify-evenly gap-1 md:gap-2">
              {col2.map((p, i) => (
                <ProductRow key={i} product={p} index={i + mid} formatPrice={formatPrice} />
              ))}
            </ul>
          </div>
        </main>

        {/* Footer mínimo */}
        <footer className="mt-2 shrink-0 text-center md:mt-4">
          <span className="rounded-full bg-amber-500/15 px-4 py-1.5 text-xs font-semibold text-amber-200/90 backdrop-blur-sm md:text-sm">
            Catálogo de productos — Frescos y deliciosos
          </span>
        </footer>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  index,
  formatPrice,
}: {
  product: { name: string; price: number };
  index: number;
  formatPrice: (n: number) => string;
}) {
  return (
    <li
      className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 transition-colors md:px-4 md:py-3"
      style={{
        animation: `product-attract 3s ease-in-out infinite`,
        animationDelay: `${index * 0.5}s`,
      }}
    >
      <span
        className="min-w-0 flex-1 font-bold text-white drop-shadow-lg"
        style={{
          animation: "row-highlight 4s ease-in-out infinite",
          animationDelay: `${index * 0.35}s`,
          fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
        }}
      >
        {product.name}
      </span>
      <span
        className="shrink-0 rounded-lg bg-amber-400/30 px-3 py-1.5 font-black text-amber-100"
        style={{
          animation: "price-pop 3s ease-in-out infinite",
          animationDelay: `${index * 0.3 + 0.5}s`,
          fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
        }}
      >
        {formatPrice(product.price)}
      </span>
    </li>
  );
}
