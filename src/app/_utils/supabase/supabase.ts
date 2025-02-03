import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { createId } from "../cuid/cuid";

export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const storageUtils = {
  upload: async (file: File | Blob, bucket: string) => {
    const { data } = await supabase.storage
      .from(bucket)
      .upload(createId(), file);
    const { data: uploaded } = supabase.storage
      .from(bucket)
      .getPublicUrl(data?.path ?? "");
    return uploaded.publicUrl;
  },
  uploadFromDataURL: async (dataURL: string, bucket: string) => {
    const blob = await fetch(dataURL).then((r) => r.blob());
    return storageUtils.upload(blob, bucket);
  },
  uploadFromBlob: async (blob: Blob, bucket: string) => {
    return storageUtils.upload(blob, bucket);
  },
};
