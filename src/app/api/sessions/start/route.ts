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

  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", session_id)
    .eq("tutor_id", user.id)
    .single();

  if (fetchError || !session) {
    return NextResponse.json(
      { error: "Session not found" },
      { status: 404 }
    );
  }

  if (session.status !== "SCHEDULED") {
    return NextResponse.json(
      {
        error: `Cannot start a session in ${session.status} state`,
      },
      { status: 409 }
    );
  }

  const { data: updatedSession, error } = await supabase
    .from("sessions")
    .update({
      status: "IN_PROGRESS",
      updated_at: new Date().toISOString(),
    })
    .eq("id", session_id)
    .eq("tutor_id", user.id)
    .eq("status", "SCHEDULED")
    .select()
    .single();

  if (error || !updatedSession) {
    return NextResponse.json(
      { error: error?.message || "Unable to start session" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    session: updatedSession,
  });
}