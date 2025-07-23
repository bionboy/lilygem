import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

// TODO (@bionboy, 25-07-23): build this feature out and test this code

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const baseCurrency = searchParams.get("baseCurrency");
  const targetCurrency = searchParams.get("targetCurrency");

  try {
    let query = supabaseAdmin
      .from("user_transactions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }
    if (baseCurrency) {
      query = query.eq("base_currency", baseCurrency);
    }
    if (targetCurrency) {
      query = query.eq("target_currency", targetCurrency);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      date,
      baseCurrency,
      targetCurrency,
      baseAmount,
      targetAmount,
      exchangeRate,
      transactionType,
      description,
    } = body;

    // Validate required fields
    if (
      !date ||
      !baseCurrency ||
      !targetCurrency ||
      !baseAmount ||
      !targetAmount ||
      !exchangeRate ||
      !transactionType
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: transaction, error } = await supabaseAdmin
      .from("user_transactions")
      .insert({
        user_id: session.user.id,
        date,
        base_currency: baseCurrency,
        target_currency: targetCurrency,
        base_amount: baseAmount,
        target_amount: targetAmount,
        exchange_rate: exchangeRate,
        transaction_type: transactionType,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
