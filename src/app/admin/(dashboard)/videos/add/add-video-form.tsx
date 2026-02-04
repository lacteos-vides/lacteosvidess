"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveVideoRecord } from "../actions";
import { useToast } from "@/components/ui/toast";
import {
  uploadVideoWithProgress,
  validateFileSize,
  formatFileSize,
  MAX_SIZE_MB,
} from "@/lib/video-upload";
import { Video, CheckCircle2 } from "lucide-react";

type Props = {
  defaultOrder: number;
};

const ALLOWED_EXT = ["mp4", "webm", "ogg", "mov"];
const ACCEPT = "video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov";

export function AddVideoForm({ defaultOrder }: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    setSelectedFile(null);

    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXT.includes(ext)) {
      setFileError("Formatos permitidos: MP4, WebM, OGG, MOV");
      return;
    }

    const sizeError = validateFileSize(file.size);
    if (sizeError) {
      setFileError(sizeError);
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current || !selectedFile) {
      if (!selectedFile) setFileError("Selecciona un archivo de video.");
      return;
    }

    const formData = new FormData(formRef.current);
    const name = (formData.get("name") as string)?.trim() ?? "";
    const order_index = parseInt(String(formData.get("order_index") ?? "1"), 10);

    if (!name) {
      toast.error("Error", "El nombre es obligatorio.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sesión expirada", "Inicia sesión nuevamente.");
        setUploading(false);
        return;
      }

      const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { publicUrl } = await uploadVideoWithProgress(
        selectedFile,
        path,
        session.access_token,
        (percent) => setUploadProgress(percent)
      );

      const saveData = new FormData();
      saveData.set("name", name);
      saveData.set("order_index", String(order_index));
      saveData.set("file_url", publicUrl);

      const result = await saveVideoRecord({ ok: false, errors: {} }, saveData);

      if (result.ok) {
        toast.success("Video creado", "El video se subió correctamente.");
        router.push("/admin/videos");
      } else if ("errors" in result) {
        const first = Object.values(result.errors)[0];
        toast.error("Error al guardar", typeof first === "string" ? first : "Revisa los campos.");
      }
    } catch (err) {
      toast.error(
        "Error al subir",
        err instanceof Error ? err.message : "No se pudo subir el video."
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={uploading}
          placeholder="Ej: Promo verano 2025"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-70"
        />
      </div>

      <div>
        <label htmlFor="order_index" className="mb-1.5 block text-sm font-medium text-slate-700">
          Orden de reproducción
        </label>
        <input
          id="order_index"
          name="order_index"
          type="number"
          min={1}
          disabled={uploading}
          defaultValue={defaultOrder}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-70"
        />
      </div>

      <div>
        <label htmlFor="file" className="mb-1.5 block text-sm font-medium text-slate-700">
          Archivo de video
        </label>
        <div className="flex flex-col gap-3">
          <input
            id="file"
            name="file"
            type="file"
            accept={ACCEPT}
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="file"
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed px-4 py-4 transition ${
              selectedFile
                ? "border-green-300 bg-green-50"
                : "border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50"
            } ${uploading ? "cursor-not-allowed opacity-70" : ""}`}
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                selectedFile ? "bg-green-200 text-green-700" : "bg-slate-200 text-slate-600"
              }`}
            >
              {selectedFile ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {selectedFile ? (
                <>
                  <p className="font-medium text-slate-900">{selectedFile.name}</p>
                  <p className="text-sm text-slate-600">
                    {formatFileSize(selectedFile.size)} — Clic para cambiar
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-700">Seleccionar archivo</p>
                  <p className="text-sm text-slate-500">
                    MP4, WebM, OGG, MOV. Máx. {MAX_SIZE_MB} MB
                  </p>
                </>
              )}
            </div>
          </label>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subiendo...</span>
                <span className="font-medium text-amber-600">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/admin/videos")}
          disabled={uploading}
          className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="inline-flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              {uploadProgress}%
            </>
          ) : (
            "Subir video"
          )}
        </button>
      </div>
    </form>
  );
}
