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

    if (
      session.status !== "COMPLETED" &&
      session.status !== "AI_REVIEWED"
    ) {
      return NextResponse.json(
        {
          error:
            "AI review can only be generated after the session is completed",
        },
        { status: 409 }
      );
    }

    const student = session.students;

    const { data: notes } = await supabase
      .from("session_notes")
      .select("notes, homework")
      .eq("session_id", session_id)
      .maybeSingle();

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
You are an expert tutoring assistant reviewing a completed one-to-one tutoring session.

STUDENT PROFILE
Name: ${student.name}
Age: ${student.age || "Not provided"}
Subject: ${student.subject || "Not provided"}
Learning level: ${student.learning_level || "Not provided"}
Learning goals: ${student.learning_goals || "Not provided"}
Strengths: ${student.strengths || "Not provided"}
Weaknesses: ${student.weaknesses || "Not provided"}

SESSION
Title: ${session.title}
Topic: ${session.topic || "Not specified"}
Duration: ${session.duration_minutes} minutes

TUTOR NOTES
${notes?.notes || "No tutor notes were recorded."}

HOMEWORK ALREADY ASSIGNED
${notes?.homework || "No homework recorded."}

PREVIOUS SESSIONS
${JSON.stringify(previousSessions || [], null, 2)}

PREVIOUS AI REVIEWS
${JSON.stringify(previousReviews || [], null, 2)}

Analyze the session and produce:

SUMMARY:
A concise summary of what was covered.

STRENGTHS:
What the student did well.

WEAKNESSES:
What the student struggled with.

HOMEWORK:
Specific recommended homework based on this session.

NEXT STEPS:
What the tutor should focus on in the next session.

The review must use the student's profile, session notes, and history. Avoid generic statements.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText =
      result.text || "No AI review generated.";

    const { data: existingReview } = await supabase
      .from("ai_reviews")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    let review;

    if (existingReview) {
      const { data, error } = await supabase
        .from("ai_reviews")
        .update({
          summary: generatedText,
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

      review = data;
    } else {
      const { data, error } = await supabase
        .from("ai_reviews")
        .insert({
          session_id,
          summary: generatedText,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      review = data;
    }

    return NextResponse.json({
      review,
      generatedText,
    });
  } catch (error) {
    console.error("AI review error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI review generation failed",
      },
      { status: 500 }
    );
  }
}