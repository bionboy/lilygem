import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const base = searchParams.get("base");
  const symbols = searchParams.get("symbols");
  const date = searchParams.get("date");

  if (!base) {
    return NextResponse.json({ error: "Base currency is required" }, { status: 400 });
  }

  try {
    let url = `https://api.exchangerate-api.com/v4/latest/${base}`;
    if (date) {
      // Check if date is in the future or too far in the past
      const requestDate = new Date(date);
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      if (requestDate > today || requestDate < thirtyDaysAgo) {
        // Return mock data for dates outside valid range
        const mockRates: Record<string, Record<string, number>> = {
          USD: { CAD: 1.35, USD: 1 },
          CAD: { USD: 0.74, CAD: 1 },
        };

        const targetSymbol = symbols || "CAD";
        const rate = mockRates[base]?.[targetSymbol] || 1;

        return NextResponse.json({
          base: base,
          rates: { [targetSymbol]: rate },
        });
      }

      url = `https://api.exchangerate-api.com/v4/${date}?base=${base}`;
      if (symbols) {
        url += `&symbols=${symbols}`;
      }
    } else if (symbols) {
      url += `?symbols=${symbols}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LilyGem/1.0)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Expected JSON response, got ${contentType}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Exchange rate API error:", error);

    // Return mock data for demo purposes
    const mockRates: Record<string, Record<string, number>> = {
      USD: { CAD: randOffset() + 2, USD: 1 },
      CAD: { USD: randOffset() + 0.5, CAD: 1 },
    };

    const targetSymbol = symbols || "CAD";
    const rate = mockRates[base]?.[targetSymbol] || 1;

    return NextResponse.json({
      base: base,
      rates: { [targetSymbol]: rate },
    });
  }
}

const randOffset = () => (Math.random() - 0.5) * 0.01;
