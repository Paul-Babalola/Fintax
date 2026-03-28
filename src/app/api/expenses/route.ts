import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

// ── GET /api/expenses ─────────────────────────────────────────────────────────
// Query params:
//   ?from=YYYY-MM-DD
//   ?to=YYYY-MM-DD
//   ?category=food
//   ?deductible=true
//   ?limit=50

const VALID_CATEGORIES = new Set([
  "rent","food","transport","utilities","health",
  "education","entertainment","other",
]);

const VALID_DEDUCTION_TYPES = new Set([
  "rent_relief","pension","nhf","life_assurance",
]);

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from        = searchParams.get("from");
  const to          = searchParams.get("to");
  const category    = searchParams.get("category");
  const deductible  = searchParams.get("deductible");
  const limit       = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

  let query = supabase
    .from("expenses")
    .select("*, user_categories(name)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (from)      query = query.gte("date", from);
  if (to)        query = query.lte("date", to);
  if (category)  query = query.eq("category", category);
  if (deductible === "true")  query = query.eq("is_deductible", true);
  if (deductible === "false") query = query.eq("is_deductible", false);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total           = (data ?? []).reduce((s, e) => s + e.amount, 0);
  const totalDeductible = (data ?? [])
    .filter((e) => e.is_deductible)
    .reduce((s, e) => s + e.amount, 0);

  return NextResponse.json({
    entries: data,
    summary: {
      count:             data?.length ?? 0,
      total,
      total_deductible:  totalDeductible,
    },
  });
}

// ── POST /api/expenses ────────────────────────────────────────────────────────
// Body: { amount, category, date, notes?, is_deductible?, deduction_type?, custom_category_id? }

export async function POST(request: NextRequest) {
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

  const {
    amount, category, date, notes,
    is_deductible, deduction_type, custom_category_id,
  } = body;

  // ── Validate ──
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }
  if (!category || !VALID_CATEGORIES.has(category as string)) {
    return NextResponse.json(
      { error: `category must be one of: ${[...VALID_CATEGORIES].join(", ")}` },
      { status: 400 }
    );
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  if (is_deductible === true && !deduction_type) {
    return NextResponse.json(
      { error: "deduction_type is required when is_deductible is true" },
      { status: 400 }
    );
  }
  if (deduction_type && !VALID_DEDUCTION_TYPES.has(deduction_type as string)) {
    return NextResponse.json(
      { error: `deduction_type must be one of: ${[...VALID_DEDUCTION_TYPES].join(", ")}` },
      { status: 400 }
    );
  }

  // If custom_category_id provided, verify it belongs to this user
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

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      user_id:            user.id,
      amount:             amount as number,
      category:           category as string,
      date:               date as string,
      notes:              typeof notes === "string" ? notes.trim() || null : null,
      is_deductible:      is_deductible === true,
      deduction_type:     is_deductible === true ? (deduction_type as string) : null,
      custom_category_id: typeof custom_category_id === "string" ? custom_category_id : null,
    })
    .select("*, user_categories(name)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}
