import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ScannedLineItem {
  name: string;
  amount: number;
  quantity?: number;
  unit_price?: number;
  suggested_category: string;
  is_vat?: boolean;
}

export interface ScannedReceipt {
  merchant_name: string | null;
  date: string | null;
  total_amount: number | null;
  vat_amount: number | null;
  currency: string;
  payment_method: string | null;
  line_items: ScannedLineItem[];
  raw_text: string;
}

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("receipt") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    // Call Claude Vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `Analyze this receipt image and extract all information. Return ONLY a valid JSON object with this exact structure, no markdown, no explanation:

{
  "merchant_name": "string or null",
  "date": "YYYY-MM-DD or null",
  "total_amount": number in Naira or null,
  "vat_amount": number in Naira or null,
  "currency": "NGN",
  "payment_method": "cash | bank_transfer | pos | mobile_money | card | null",
  "line_items": [
    {
      "name": "item name",
      "amount": number in Naira,
      "quantity": number or null,
      "unit_price": number or null,
      "suggested_category": "food | transport | health | utilities | education | entertainment | rent | other",
      "is_vat": false
    }
  ],
  "raw_text": "all visible text on the receipt"
}

Rules:
- All amounts must be in Naira (NGN). If amounts are in another currency, convert using current approximate rates and note in raw_text.
- If VAT is shown separately, include it as a line item with is_vat: true AND set vat_amount.
- Suggest the most specific category for each line item based on what it is.
- If the receipt is not in English, still extract the data.
- If the image is not a receipt, return {"error": "Not a receipt"}.
- Date format must be YYYY-MM-DD.`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response from vision API");
    }

    // Parse the JSON response
    let parsed: ScannedReceipt & { error?: string };
    try {
      parsed = JSON.parse(content.text.trim());
    } catch {
      throw new Error("Could not parse receipt data from image");
    }

    if ("error" in parsed && parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    return NextResponse.json({ receipt: parsed });
  } catch (err) {
    console.error("Receipt scan error:", err);
    return NextResponse.json(
      { error: "Failed to scan receipt. Please try again or enter manually." },
      { status: 500 }
    );
  }
}
