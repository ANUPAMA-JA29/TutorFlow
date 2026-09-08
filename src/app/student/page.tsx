import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "AI_REVIEWED":
      return "bg-purple-50 text-purple-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function statusLabel(status: string) {
  return status
    .replace("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function StudentDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "STUDENT") {
    redirect("/tutor");
  }

  // Find the student record linked to this login
  const { data: student } = await supabase
    .from("students")
    .select(
      "id, name, email, subject, learning_level, learning_goals"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  let sessions: any[] = [];

  if (student) {
    const { data } = await supabase
      .from("sessions")
      .select(
        `
        id,
        title,
        topic,
        scheduled_at,
        duration_minutes,
        status,
        students (
          name,
          subject
        )
      `
      )
      .eq("student_id", student.id)
      .order("scheduled_at", { ascending: true });

    sessions = data || [];
  }

  const now = new Date();

  const upcomingSessions = sessions.filter(
    (session) =>
      new Date(session.scheduled_at) >= now &&
      session.status !== "COMPLETED" &&
      session.status !== "AI_REVIEWED"
  );

  const pastSessions = sessions.filter(
    (session) =>
      session.status === "COMPLETED" ||
      session.status === "AI_REVIEWED"
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                T
              </div>

              <div>
                <h1 className="font-bold text-slate-900">TutorFlow</h1>
                <p className="text-xs text-slate-500">Student Portal</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/student"
              className="flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
            >
              <span>▦</span>
              Dashboard
            </Link>
          </nav>

          <div className="border-t p-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {profile.full_name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {profile.email || user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="flex items-center justify-between px-6 py-5 lg:px-8">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                Student Dashboard
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Welcome, {profile.full_name.split(" ")[0]} 👋
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of your lessons, notes and homework.
              </p>
            </div>

            <div className="hidden rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 sm:block">
              Student
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {/* Student profile */}
          {student && (
            <section className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {student.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {student.subject || "Subject not specified"}
                      {student.learning_level
                        ? ` • ${student.learning_level}`
                        : ""}
                    </p>
                  </div>
                </div>

                {student.learning_goals && (
                  <div className="max-w-xl rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Learning Goal
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {student.learning_goals}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {!student && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800">
                Student profile not linked
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Your login is working, but your tutor has not linked your
                student profile yet.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Upcoming Sessions</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {upcomingSessions.length}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Completed Sessions</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pastSessions.length}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">AI Reviewed</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {
                  sessions.filter(
                    (session) => session.status === "AI_REVIEWED"
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Upcoming */}
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Upcoming Sessions
                </h3>
                <p className="text-sm text-slate-500">
                  Your scheduled one-to-one lessons
                </p>
              </div>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  📅
                </div>

                <h4 className="mt-4 font-semibold text-slate-900">
                  No upcoming sessions
                </h4>

                <p className="mt-1 text-sm text-slate-500">
                  Your upcoming lessons will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/student/sessions/${session.id}`}
                    className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-slate-900">
                            {session.title}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                              session.status
                            )}`}
                          >
                            {statusLabel(session.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          {session.topic || "General lesson"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-left md:text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatDate(session.scheduled_at)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatTime(session.scheduled_at)} •{" "}
                          {session.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Past sessions */}
          <section className="mt-10">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Past Sessions
              </h3>
              <p className="text-sm text-slate-500">
                Review your completed lessons and AI summaries
              </p>
            </div>

            {pastSessions.length === 0 ? (
              <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  No completed sessions yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/student/sessions/${session.id}`}
                    className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md md:flex-row md:items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {session.title}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(session.scheduled_at)}
                        {session.topic
                          ? ` • ${session.topic}`
                          : ""}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                        session.status
                      )}`}
                    >
                      {statusLabel(session.status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}