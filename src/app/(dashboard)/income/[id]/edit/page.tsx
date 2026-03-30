import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EditIncomeForm } from "@/components/forms/edit-income-form";

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entry } = await supabase
    .from("income_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!entry) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit income entry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update the details of this entry.
        </p>
      </div>
      <EditIncomeForm entry={entry} />
    </div>
  );
}
