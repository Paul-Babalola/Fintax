"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  table: "income_entries" | "expenses";
  label: string;   // e.g. "income entry" or "Food expense" — shown in confirm dialog
}

export function DeleteEntryButton({ id, table, label }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    const { error } = await supabase.from(table).delete().eq("id", id);

    setDeleting(false);
    setConfirming(false);

    if (!error) router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
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
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${label}`}
      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
