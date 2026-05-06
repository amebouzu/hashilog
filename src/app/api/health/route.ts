/**
 * 死活監視用エンドポイント
 * UptimeRobot 等から GET /api/health を監視 (キーワード `"ok":true`)
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { error } = await supabase
    .from("circuits")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json(
      { ok: false, db: false, ts: new Date().toISOString() },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    db: true,
    ts: new Date().toISOString()
  });
}
