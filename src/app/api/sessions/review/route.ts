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

  const body = await request.json();
  const { session_id } = body;

  if (!session_id) {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 }
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", session_id)
    .eq("tutor_id", user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  if (session.status !== "COMPLETED") {
    return NextResponse.json(
      {
        error:
          "AI review can only be triggered for completed sessions",
      },
      { status: 409 }
    );
  }

  const response = await fetch(
    new URL("/api/ai/review", request.url),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        session_id,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    return NextResponse.json(
      {
        error:
          errorData.error ||
          "AI review could not be generated",
      },
      { status: response.status }
    );
  }

  const review = await response.json();

  const { data: updatedSession, error: updateError } =
    await supabase
      .from("sessions")
      .update({
        status: "AI_REVIEWED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id)
      .eq("tutor_id", user.id)
      .eq("status", "COMPLETED")
      .select()
      .single();

  if (updateError || !updatedSession) {
    return NextResponse.json(
      {
        error:
          updateError?.message ||
          "Could not update session status",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    session: updatedSession,
    review: review.review,
  });
}