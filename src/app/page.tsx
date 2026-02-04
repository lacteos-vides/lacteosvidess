export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Lácteos Vides</h1>
      <p className="mt-2 text-zinc-600">
        Visualizador de precios y videos
      </p>
      <p className="mt-6 text-sm text-zinc-400">
        Rutas públicas: <a href="/productos" className="text-amber-600 hover:underline">/productos</a> | /videos
      </p>
      <a
        href="/admin"
        className="mt-8 text-sm text-blue-600 hover:underline"
      >
        Ir al panel admin →
      </a>
    </div>
  );
}
