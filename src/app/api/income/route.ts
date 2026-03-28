import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { RELIEF } from "@/lib/tax-engine/nta2025";

// ── GET /api/income ───────────────────────────────────────────────────────────
// Returns the authenticated user's income entries.
// Query params:
//   ?from=YYYY-MM-DD   filter from date (inclusive)
//   ?to=YYYY-MM-DD     filter to date (inclusive)
//   ?source=salary     filter by source type
//   ?limit=50          max rows (default 50, max 200)

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");
  const source = searchParams.get("source");
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);

  let query = supabase
    .from("income_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (from)   query = query.gte("date", from);
  if (to)     query = query.lte("date", to);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute summary totals in one pass
  const total     = (data ?? []).reduce((s, e) => s + e.amount, 0);
  const totalWHT  = (data ?? []).reduce((s, e) => s + (e.wht_amount ?? 0), 0);

  return NextResponse.json({
    entries: data,
    summary: {
      count:     data?.length ?? 0,
      total,
      total_wht: totalWHT,
    },
  });
}

// ── POST /api/income ──────────────────────────────────────────────────────────
// Creates a new income entry.
// Body: { amount, source, date, notes?, wht_already_paid? }

const VALID_SOURCES = new Set(["salary","freelance","investment","rental","other"]);
const WHT_SOURCES   = new Set(["investment","rental"]);

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

  // ── Validate ──
  const { amount, source, date, notes, wht_already_paid } = body;

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }
  if (!source || !VALID_SOURCES.has(source as string)) {
    return NextResponse.json(
      { error: `source must be one of: ${[...VALID_SOURCES].join(", ")}` },
      { status: 400 }
    );
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  // ── WHT auto-calculation ──
  const hasWHT   = WHT_SOURCES.has(source as string);
  const whtRate  = hasWHT ? RELIEF.WHT_INVESTMENT_INCOME : null;
  const whtAmount = hasWHT
    ? (typeof wht_already_paid === "number"
        ? wht_already_paid
        : Math.round((amount as number) * RELIEF.WHT_INVESTMENT_INCOME))
    : null;

  const { data, error } = await supabase
    .from("income_entries")
    .insert({
      user_id:    user.id,
      amount:     amount as number,
      source:     source as string,
      date:       date as string,
      notes:      typeof notes === "string" ? notes.trim() || null : null,
      wht_rate:   whtRate,
      wht_amount: whtAmount,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entry: data }, { status: 201 });
}
