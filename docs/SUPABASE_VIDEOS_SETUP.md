# Configuración de Supabase Storage para Videos

## Paso 1: Ejecutar la migración SQL

1. Ve al proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Entra a **SQL Editor**
3. Abre el archivo `supabase/migrations/004_videos_table_and_storage.sql`
4. Copia todo el contenido y pégalo en el editor
5. Ejecuta la consulta (**Run**)

Esto creará:
- La tabla `videos`
- El bucket `videos` en Storage (si no existe)
- Las políticas RLS para la tabla y el bucket

---

## Paso 2: Si el bucket no se creó automáticamente

Si al ejecutar la migración aparece un error relacionado con `storage.buckets`, crea el bucket manualmente:

1. En Supabase Dashboard → **Storage**
2. Clic en **New bucket**
3. Configura:
   - **Name:** `videos`
   - **Public bucket:** ON (para que las URLs sean accesibles sin autenticación)
   - **File size limit:** 500 MB (opcional)
   - **Allowed MIME types:** `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime` (opcional)

---

## Paso 3: Políticas de Storage (si hace falta)

Si los uploads fallan con permisos, verifica que existan políticas en **Storage** → **Policies** para el bucket `videos`:

1. **SELECT (lectura pública):** Permite que cualquiera vea los videos
2. **INSERT (subir):** Solo usuarios autenticados
3. **UPDATE (actualizar):** Solo usuarios autenticados
4. **DELETE (eliminar):** Solo usuarios autenticados

Puedes crearlas desde **Storage** → **Policies** → **New policy** usando las plantillas sugeridas.

---

## Paso 4: Variables de entorno

Asegúrate de tener en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

La `anon_key` es suficiente para Storage cuando el usuario está autenticado; las políticas RLS controlan el acceso.

---

## Paso 5: Si el bucket ya tenía 500 MB

Si creaste el bucket antes con 500 MB, ejecuta `supabase/migrations/005_videos_bucket_50mb.sql` para actualizar el límite a 50 MB.

---

## Resumen

- **Tabla `videos`:** id, name, file_url, order_index, created_at
- **Bucket `videos`:** público para lectura, subida/edición/borrado solo con sesión admin
- **Formatos aceptados:** MP4, WebM, OGG, MOV
- **Límite de archivo:** 50 MB por defecto
