import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(`
      *,
      students (
        id,
        name,
        email,
        subject,
        learning_level
      )
    `)
    .eq("tutor_id", user.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ sessions });
}

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

  const {
    student_id,
    title,
    topic,
    scheduled_at,
    duration_minutes,
  } = body;

  if (!student_id || !title || !scheduled_at) {
    return NextResponse.json(
      {
        error:
          "student_id, title and scheduled_at are required",
      },
      { status: 400 }
    );
  }

  const duration = Number(duration_minutes || 60);

  const { data: session, error } = await supabase.rpc(
    "schedule_session",
    {
      p_student_id: student_id,
      p_title: title,
      p_topic: topic || "",
      p_scheduled_at: scheduled_at,
      p_duration_minutes: duration,
    }
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { session },
    { status: 201 }
  );
}