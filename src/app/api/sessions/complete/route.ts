import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const sessionId = formData.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  const { data: session, error: fetchError } =
    await supabase
      .from("sessions")
      .select("id, status")
      .eq("id", sessionId)
      .eq("tutor_id", user.id)
      .single();

  if (fetchError || !session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  // Only IN_PROGRESS sessions can be completed.
  if (session.status !== "IN_PROGRESS") {
    return NextResponse.json(
      {
        error:
          "Only in-progress sessions can be completed.",
      },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "COMPLETED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("tutor_id", user.id)
    .eq("status", "IN_PROGRESS");

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(`/tutor/sessions/${sessionId}`, request.url)
  );
}