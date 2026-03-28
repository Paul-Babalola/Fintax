import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// ── GET /api/budget ───────────────────────────────────────────────────────────
// Returns all budget limits for the user, with this month's actual spend per category.

export async function GET(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0];

  const [{ data: budgets }, { data: expenses }] = await Promise.all([
    supabase
      .from("budgets")
      .select("*, user_categories(name)")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("expenses")
      .select("amount, category, custom_category_id")
      .eq("user_id", user.id)
      .gte("date", monthStart),
  ]);

  // Aggregate spend — same pattern as the dashboard
  const spentByFixed = (expenses ?? [])
    .filter((e) => !e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {});

  const spentByCustom = (expenses ?? [])
    .filter((e) => e.custom_category_id)
    .reduce<Record<string, number>>((acc, e) => {
      acc[e.custom_category_id!] = (acc[e.custom_category_id!] ?? 0) + e.amount;
      return acc;
    }, {});

  const budgetsWithSpend = (budgets ?? []).map((b) => {
    const spent = b.custom_category_id
      ? (spentByCustom[b.custom_category_id] ?? 0)
      : (spentByFixed[b.category] ?? 0);

    return {
      ...b,
      spent,
      remaining: b.monthly_limit - spent,
      pct: b.monthly_limit > 0
        ? Math.min(100, Math.round((spent / b.monthly_limit) * 100))
        : 0,
    };
  });

  return NextResponse.json({ budgets: budgetsWithSpend });
}

// ── PUT /api/budget ───────────────────────────────────────────────────────────
// Creates or updates a single budget limit.
// Body: { category, monthly_limit, custom_category_id? }
// For fixed categories:  { category: "food", monthly_limit: 50000 }
// For custom categories: { category: "other", monthly_limit: 30000, custom_category_id: "uuid" }

const VALID_CATEGORIES = new Set([
  "rent","food","transport","utilities","health",
  "education","entertainment","other",
]);

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, monthly_limit, custom_category_id } = body;

  if (!category || !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json(
      { error: `category must be one of: ${[...VALID_CATEGORIES].join(", ")}` },
      { status: 400 }
    );
  }
  if (typeof monthly_limit !== "number" || monthly_limit <= 0) {
    return NextResponse.json(
      { error: "monthly_limit must be a positive number" },
      { status: 400 }
    );
  }

  // Verify custom category ownership if provided
  if (custom_category_id) {
    const { data: cat } = await supabase
      .from("user_categories")
      .select("id")
      .eq("id", custom_category_id)
      .eq("user_id", user.id)
      .single();

    if (!cat) {
      return NextResponse.json(
        { error: "custom_category_id not found or does not belong to you" },
        { status: 400 }
      );
    }
  }

  // Check if a budget already exists for this slot
  let existingQuery = supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", category as string);

  if (custom_category_id) {
    existingQuery = existingQuery.eq("custom_category_id", custom_category_id as string);
  } else {
    existingQuery = existingQuery.is("custom_category_id", null);
  }

  const { data: existing } = await existingQuery.maybeSingle();

  let data, error;

  if (existing) {
    // Update
    ({ data, error } = await supabase
      .from("budgets")
      .update({ monthly_limit: monthly_limit as number })
      .eq("id", existing.id)
      .select("*, user_categories(name)")
      .single());
  } else {
    // Insert
    ({ data, error } = await supabase
      .from("budgets")
      .insert({
        user_id:            user.id,
        category:           category as string,
        monthly_limit:      monthly_limit as number,
        custom_category_id: typeof custom_category_id === "string" ? custom_category_id : null,
        custom_label:       null,
      })
      .select("*, user_categories(name)")
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ budget: data }, { status: existing ? 200 : 201 });
}

// ── DELETE /api/budget?id=uuid ────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id query param required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
