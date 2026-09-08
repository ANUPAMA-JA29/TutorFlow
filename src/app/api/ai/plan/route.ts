import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
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

    const { data: session, error: sessionError } =
      await supabase
        .from("sessions")
        .select(`
          *,
          students (
            id,
            name,
            age,
            email,
            subject,
            learning_level,
            learning_goals,
            strengths,
            weaknesses
          )
        `)
        .eq("id", session_id)
        .eq("tutor_id", user.id)
        .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const student = session.students;

    if (!student) {
      return NextResponse.json(
        { error: "Student information not found" },
        { status: 404 }
      );
    }

    const { data: previousSessions } = await supabase
      .from("sessions")
      .select(`
        id,
        title,
        topic,
        scheduled_at,
        status
      `)
      .eq("student_id", student.id)
      .neq("id", session_id)
      .order("scheduled_at", {
        ascending: false,
      })
      .limit(5);

    const { data: previousReviews } = await supabase
      .from("ai_reviews")
      .select(`
        summary,
        strengths,
        weaknesses,
        next_steps
      `)
      .in(
        "session_id",
        (previousSessions || []).map(
          (item) => item.id
        )
      );

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are an expert one-to-one tutor session planner.

Create a practical lesson plan for the upcoming tutoring session.

STUDENT PROFILE
Name: ${student.name}
Age: ${student.age || "Not provided"}
Subject: ${student.subject || "Not provided"}
Learning level: ${student.learning_level || "Not provided"}
Learning goals: ${student.learning_goals || "Not provided"}
Strengths: ${student.strengths || "Not provided"}
Weaknesses: ${student.weaknesses || "Not provided"}

UPCOMING SESSION
Title: ${session.title}
Topic: ${session.topic || "Not specified"}
Duration: ${session.duration_minutes} minutes

PREVIOUS SESSIONS
${JSON.stringify(previousSessions || [], null, 2)}

PREVIOUS AI REVIEWS
${JSON.stringify(previousReviews || [], null, 2)}

Create a concise but useful plan containing:

1. Session objective
2. 5-10 minute warm-up
3. Main teaching activities
4. Practice activities
5. Questions to check understanding
6. Adaptations based on the student's weaknesses
7. How to use the student's strengths
8. End-of-session assessment
9. Suggested homework
10. Recommended next step

Use the student's profile and history. Do not create a generic lesson plan.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const plan = result.text || "No plan generated.";

    const { data: existingReview } = await supabase
      .from("ai_reviews")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    let savedReview;

    if (existingReview) {
      const { data, error } = await supabase
        .from("ai_reviews")
        .update({
          plan,
        })
        .eq("session_id", session_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      savedReview = data;
    } else {
      const { data, error } = await supabase
        .from("ai_reviews")
        .insert({
          session_id,
          plan,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      savedReview = data;
    }

    return NextResponse.json({
      plan,
      review: savedReview,
    });
  } catch (error) {
    console.error("AI plan error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI plan generation failed",
      },
      { status: 500 }
    );
  }
}