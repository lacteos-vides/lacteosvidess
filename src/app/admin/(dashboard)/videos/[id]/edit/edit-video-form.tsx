"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateVideo, updateVideoWithUrl, type ActionResult } from "../../actions";
import { validateFileSize, formatFileSize, MAX_SIZE_MB } from "@/lib/video-upload";
import { uploadVideoWithProgress } from "@/lib/video-upload";
import { Video as VideoIcon, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { Video } from "@/lib/types/database";

type Props = {
  video: Video;
};

export function EditVideoForm({ video }: Props) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [replaceFile, setReplaceFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [state, formAction] = useActionState(
    (prev: ActionResult, fd: FormData) => updateVideo(video.id, prev, fd),
    { ok: false, errors: {} } as ActionResult
  );
  const lastSuccessRef = useRef(false);
  const lastErrorRef = useRef<string>("");
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.ok && !lastSuccessRef.current) {
      lastSuccessRef.current = true;
      toast.success("Video actualizado", "Los cambios se guardaron correctamente.");
      router.push("/admin/videos");
    } else if (!state.ok && "errors" in state) {
      const errs = state.errors;
      if (Object.keys(errs).length > 0) {
        const errorKey = JSON.stringify(errs);
        if (errorKey !== lastErrorRef.current) {
          lastErrorRef.current = errorKey;
          const firstError = Object.values(errs)[0];
          toast.error("Error al guardar", typeof firstError === "string" ? firstError : "Revisa los campos.");
        }
      }
    }
  }, [state, toast, router]);

  async function handleSubmit(e: React.FormEvent) {
    if (!replaceFile || !selectedFile) {
      return;
    }
    e.preventDefault();
    if (!formRef.current) return;

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

      const result = await updateVideoWithUrl(video.id, { ok: false, errors: {} }, saveData);

      if (result.ok) {
        toast.success("Video actualizado", "Los cambios se guardaron correctamente.");
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

  const needsClientUpload = replaceFile && selectedFile;
  const submitDisabled = replaceFile && !selectedFile;
  const isSubmitting = uploading || pending;

  return (
    <form
      ref={formRef}
      action={needsClientUpload ? undefined : formAction}
      onSubmit={needsClientUpload ? handleSubmit : undefined}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="replace_file" value={replaceFile ? "true" : "false"} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isSubmitting}
          defaultValue={video.name}
          placeholder="Ej: Promo verano 2025"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-70"
        />
        {!state.ok && "errors" in state && state.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
        )}
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
          disabled={isSubmitting}
          defaultValue={video.order_index}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-70"
        />
        {!state.ok && "errors" in state && state.errors?.order_index && (
          <p className="mt-1 text-sm text-red-600">{state.errors.order_index}</p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Archivo actual</p>
        <a
          href={video.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber-600 hover:text-amber-700"
        >
          Ver video actual
        </a>
      </div>

      <div>
        <label className="mb-2 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={replaceFile}
            onChange={(e) => {
              setReplaceFile(e.target.checked);
              setSelectedFile(null);
              setFileError(null);
            }}
            disabled={isSubmitting}
            className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-slate-700">Reemplazar con nuevo archivo</span>
        </label>
        {replaceFile && (
          <div className="mt-3 flex flex-col gap-3">
            <input
              id="file"
              name="file"
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov"
              disabled={isSubmitting}
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileError(null);
                setSelectedFile(file ?? null);
                if (file) {
                  const sizeErr = validateFileSize(file.size);
                  if (sizeErr) setFileError(sizeErr);
                }
              }}
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
                  <VideoIcon className="h-6 w-6" />
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

            {(fileError || (!state.ok && "errors" in state && state.errors?.file)) && (
              <p className="text-sm text-red-600">
                {fileError || ("errors" in state ? state.errors?.file : "")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/admin/videos")}
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || submitDisabled}
          className="inline-flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              {uploadProgress}%
            </>
          ) : pending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              Guardando...
            </>
          ) : (
            "Guardar cambios"
          )}
        </button>
      </div>
    </form>
  );
}
