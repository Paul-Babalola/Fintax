"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  id: string;
  table: "income_entries" | "expenses";
  editHref: string;
}

export function EntryActions({ id, table, editHref }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting]     = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from(table).delete().eq("id", id);
    setDeleting(false);
    setConfirming(false);
    if (!error) router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Edit */}
      <Link
        href={editHref}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      {/* Delete */}
      {confirming ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Delete?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-destructive hover:underline disabled:opacity-50"
          >
            {deleting ? "…" : "Yes"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-muted-foreground hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
