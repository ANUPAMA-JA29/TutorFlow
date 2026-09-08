import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StudentSessionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "STUDENT") {
    redirect("/student");
  }

  const { data: student } = await supabase
    .from("students")
    .select("id, name, subject, learning_level")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    redirect("/student");
  }

  const { data: session } = await supabase
    .from("sessions")
    .select(`
      id,
      title,
      topic,
      scheduled_at,
      duration_minutes,
      status,
      tutor_id
    `)
    .eq("id", id)
    .eq("student_id", student.id)
    .single();

  if (!session) {
    redirect("/student");
  }

  const { data: notes } = await supabase
    .from("session_notes")
    .select("notes, homework, updated_at")
    .eq("session_id", id)
    .maybeSingle();

  const { data: review } = await supabase
    .from("ai_reviews")
    .select("plan, summary, strengths, weaknesses, homework, next_steps")
    .eq("session_id", id)
    .maybeSingle();

  const date = new Date(session.scheduled_at);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <a
          href="/student"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to dashboard
        </a>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-gray-500">Session</p>
              <h1 className="mt-1 text-3xl font-bold">{session.title}</h1>

              {session.topic && (
                <p className="mt-2 text-gray-600">
                  Topic: {session.topic}
                </p>
              )}
            </div>

            <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
              {session.status.replace("_", " ")}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Date</p>
              <p className="mt-1 font-semibold">
                {date.toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Time</p>
              <p className="mt-1 font-semibold">
                {date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="mt-1 font-semibold">
                {session.duration_minutes} minutes
              </p>
            </div>
          </div>
        </div>

        {review?.plan && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">AI Session Plan</h2>
            <div className="mt-4 whitespace-pre-wrap text-gray-700">
              {review.plan}
            </div>
          </section>
        )}

        {notes && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Tutor Notes</h2>

            {notes.notes && (
              <div className="mt-4">
                <h3 className="font-semibold">Notes</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {notes.notes}
                </p>
              </div>
            )}

            {notes.homework && (
              <div className="mt-5">
                <h3 className="font-semibold">Homework</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {notes.homework}
                </p>
              </div>
            )}
          </section>
        )}

        {review && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">AI Review</h2>

            {review.summary && (
              <div className="mt-4">
                <h3 className="font-semibold">Summary</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {review.summary}
                </p>
              </div>
            )}

            {review.strengths && (
              <div className="mt-5">
                <h3 className="font-semibold">Strengths</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {review.strengths}
                </p>
              </div>
            )}

            {review.weaknesses && (
              <div className="mt-5">
                <h3 className="font-semibold">Areas to Improve</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {review.weaknesses}
                </p>
              </div>
            )}

            {review.next_steps && (
              <div className="mt-5">
                <h3 className="font-semibold">Next Steps</h3>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {review.next_steps}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}