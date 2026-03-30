import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { EditExpenseForm } from "@/components/forms/edit-expense-form";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: entry }, { data: userCategories }] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("user_categories")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  if (!entry) notFound();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit expense</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Update the details of this entry.
        </p>
      </div>
      <EditExpenseForm entry={entry} userCategories={userCategories ?? []} />
    </div>
  );
}
