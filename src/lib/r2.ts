import "server-only";

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET_VIDEOS =
  process.env.R2_BUCKET_VIDEOS ?? "lacteos-vides-videos";

const PUBLIC_BASE_VIDEOS = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL_VIDEOS ?? ""
).replace(/\/$/, "");

// Cache-Control aplicado a todos los videos subidos a R2. Como cualquier cambio
// se hace re-subiendo con una key nueva (UUID), es seguro marcarlo inmutable.
export const VIDEO_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** URLs públicas de R2 (custom domain o pub-*.r2.dev) para las que aplicamos cabeceras HTTP. */
export function isR2VideoPublicUrl(url: string): boolean {
  if (!url) return false;
  const base = PUBLIC_BASE_VIDEOS;
  try {
    const u = new URL(url);
    if (base && url.startsWith(`${base}/`)) return true;
    if (u.hostname.endsWith(".r2.dev")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Fuerza `Cache-Control` (y conserva `Content-Type`) en el objeto ya subido.
 * Algunos flujos con presigned PUT no dejan el `Cache-Control` visible en GET
 * vía `r2.dev`; un CopyObject sobre sí mismo con REPLACE es el patrón estándar
 * en APIs compatibles con S3.
 */
export async function ensureVideoHttpCacheHeaders(key: string): Promise<void> {
  const client = getR2Client();
  const head = await client.send(
    new HeadObjectCommand({ Bucket: R2_BUCKET_VIDEOS, Key: key })
  );
  const contentType = head.ContentType ?? "video/mp4";

  await client.send(
    new CopyObjectCommand({
      Bucket: R2_BUCKET_VIDEOS,
      CopySource: `${R2_BUCKET_VIDEOS}/${key}`,
      Key: key,
      MetadataDirective: "REPLACE",
      ContentType: contentType,
      CacheControl: VIDEO_CACHE_CONTROL,
    })
  );
}

function getR2Client(): S3Client {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "Faltan variables de entorno R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY"
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

export type PresignedVideoUpload = {
  uploadUrl: string;
  publicUrl: string;
  contentType: string;
  cacheControl: string;
};

/**
 * Genera una presigned URL para subir un video al bucket R2 con las cabeceras
 * de caché correctas firmadas. El cliente debe enviar exactamente esas mismas
 * cabeceras (`Content-Type`, `Cache-Control`) al hacer el PUT.
 */
export async function createVideoPresignedUpload(params: {
  key: string;
  contentType: string;
}): Promise<PresignedVideoUpload> {
  if (!PUBLIC_BASE_VIDEOS) {
    throw new Error(
      "Falta NEXT_PUBLIC_R2_PUBLIC_BASE_URL_VIDEOS para construir las URLs públicas."
    );
  }

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_VIDEOS,
    Key: params.key,
    ContentType: params.contentType,
    CacheControl: VIDEO_CACHE_CONTROL,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${PUBLIC_BASE_VIDEOS}/${params.key}`;

  return {
    uploadUrl,
    publicUrl,
    contentType: params.contentType,
    cacheControl: VIDEO_CACHE_CONTROL,
  };
}

/** Borra un objeto del bucket de videos. No falla si el objeto no existe. */
export async function deleteVideoObject(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_VIDEOS, Key: key })
  );
}

/**
 * Dada una URL pública del bucket (p. ej. `https://pub-xxx.r2.dev/<key>`),
 * devuelve la `key` del objeto o `null` si no se puede extraer.
 */
export function extractVideoKeyFromPublicUrl(url: string): string | null {
  if (!url) return null;
  try {
    if (PUBLIC_BASE_VIDEOS && url.startsWith(`${PUBLIC_BASE_VIDEOS}/`)) {
      return url.slice(PUBLIC_BASE_VIDEOS.length + 1) || null;
    }
    const parsed = new URL(url);
    const trimmed = parsed.pathname.replace(/^\/+/, "");
    return trimmed || null;
  } catch {
    return null;
  }
}
