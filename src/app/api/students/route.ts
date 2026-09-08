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

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ students });
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
    name,
    email,
    age,
    subject,
    learning_level,
    learning_goals,
    strengths,
    weaknesses,
    user_id,
  } = body;

  if (!name || !subject) {
    return NextResponse.json(
      { error: "Name and subject are required" },
      { status: 400 }
    );
  }

  const { data: student, error } = await supabase
    .from("students")
    .insert({
      tutor_id: user.id,
      user_id: user_id || null,
      name,
      email: email || null,
      age: age ? Number(age) : null,
      subject,
      learning_level: learning_level || null,
      learning_goals: learning_goals || null,
      strengths: strengths || null,
      weaknesses: weaknesses || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { student },
    { status: 201 }
  );
}