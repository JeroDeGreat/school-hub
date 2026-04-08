"use client";

import Image from "next/image";
import { FileUp } from "lucide-react";
import { useState } from "react";
import type { AttachmentPayload } from "@/lib/types/app";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { attachmentLabel, initialsFor } from "@/lib/utils";

export function Avatar({
  name,
  url,
  size = 40,
}: {
  name: string;
  url?: string | null;
  size?: number;
}) {
  return url ? (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      className="rounded-full object-cover"
    />
  ) : (
    <div
      className="grid rounded-full bg-accent/12 text-xs font-semibold"
      style={{ width: size, height: size, placeItems: "center" }}
    >
      {initialsFor(name)}
    </div>
  );
}

export function AttachmentButton({
  attachment,
}: {
  attachment: AttachmentPayload | null;
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  if (!attachment) {
    return null;
  }

  if (attachment.bucket === "preview") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold">
        <FileUp className="h-3.5 w-3.5" />
        {attachmentLabel(attachment)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const { data } = await supabase.storage
          .from(attachment.bucket)
          .createSignedUrl(attachment.path, 1800);

        if (data?.signedUrl) {
          window.open(data.signedUrl, "_blank", "noopener,noreferrer");
        }
      }}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-xs font-semibold"
    >
      <FileUp className="h-3.5 w-3.5" />
      {attachmentLabel(attachment)}
    </button>
  );
}
