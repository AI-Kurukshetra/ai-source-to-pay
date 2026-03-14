"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { uploadDocument } from "@/lib/actions/documentActions";
import Spinner from "@/components/ui/Spinner";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const allowedTypes = ["application/pdf", "image/jpeg", "image/png"] as const;

const uploadSchema = z.object({
  document_type: z.enum(
    ["gst_certificate", "company_registration", "bank_proof"],
    { message: "Select a document type." },
  ),
  file: z.custom<File>(
    (value) => value instanceof File,
    "Select a document file.",
  ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

function applyZodErrors(
  issues: z.ZodIssue[],
  setError: ReturnType<typeof useForm<UploadFormValues>>["setError"],
) {
  issues.forEach((issue) => {
    const field = issue.path[0];
    if (field === "document_type" || field === "file") {
      setError(field, { type: "manual", message: issue.message });
    }
  });
}

type DocumentUploadFormProps = {
  onUploaded?: () => void;
};

export default function DocumentUploadForm({
  onUploaded,
}: DocumentUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
    reset,
  } = useForm<UploadFormValues>({
    defaultValues: {
      document_type: "gst_certificate",
      file: undefined,
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
    };
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError("root", { message: "" });
    setProgress(10);

    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }

    progressTimer.current = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) {
          return current;
        }
        return Math.min(90, current + 8);
      });
    }, 300);

    const parsed = uploadSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(parsed.error.issues, setError);
      setLoading(false);
      setProgress(0);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      return;
    }

    const file = parsed.data.file;
    if (!allowedTypes.includes(file.type as (typeof allowedTypes)[number])) {
      setError("file", {
        type: "manual",
        message: "Only PDF, JPG, or PNG files are allowed.",
      });
      setLoading(false);
      setProgress(0);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError("file", {
        type: "manual",
        message: "File size must be 5MB or less.",
      });
      setLoading(false);
      setProgress(0);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      return;
    }

    const formData = new FormData();
    formData.append("document_type", parsed.data.document_type);
    formData.append("file", file);

    const result = await uploadDocument(formData);

    if (result?.error) {
      setError("root", { message: result.error });
      setLoading(false);
      setProgress(0);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      return;
    }

    setProgress(100);
    reset();
    setLoading(false);
    onUploaded?.();
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
    }
    setTimeout(() => setProgress(0), 600);
  });

  return (
    <form className="mt-6 space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 md:grid-cols-[1fr_2fr]">
        <div>
          <label className="text-sm font-medium text-slate-200">
            Document type
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
            {...register("document_type")}
          >
            <option value="gst_certificate">GST certificate</option>
            <option value="company_registration">Company registration</option>
            <option value="bank_proof">Bank proof</option>
          </select>
          {errors.document_type?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.document_type.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200">
            Upload file
          </label>
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png"
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-200"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0];
              if (selectedFile) {
                setValue("file", selectedFile, { shouldValidate: true });
              }
            }}
          />
          {errors.file?.message ? (
            <p className="mt-2 text-xs text-rose-400">
              {errors.file.message}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-slate-500">
            PDF, JPG, or PNG. Maximum size 5MB.
          </p>
        </div>
      </div>

      {errors.root?.message ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errors.root.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Spinner className="h-4 w-4 border-slate-950/20 border-t-slate-950" />
        ) : null}
        {loading ? "Uploading..." : "Upload document"}
      </button>

      {loading || progress > 0 ? (
        <div className="space-y-2">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">
            {progress < 100 ? "Uploading file..." : "Upload complete."}
          </p>
        </div>
      ) : null}
    </form>
  );
}
