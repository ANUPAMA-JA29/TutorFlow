import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SessionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "TUTOR") {
    redirect("/student");
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select(`
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
    `)
    .eq("tutor_id", user.id)
    .order("scheduled_at", { ascending: true });

  const statusStyles: Record<string, string> = {
    SCHEDULED:
      "bg-blue-50 text-blue-700 border-blue-200",

    IN_PROGRESS:
      "bg-amber-50 text-amber-700 border-amber-200",

    COMPLETED:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    AI_REVIEWED:
      "bg-purple-50 text-purple-700 border-purple-200",
  };

  const statusLabels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    AI_REVIEWED: "AI Reviewed",
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans">

      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <Link
              href="/tutor"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Tutor<span className="text-indigo-600">Flow</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">

            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <div className="mt-3 space-y-1">

              <Link
                href="/tutor"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="text-lg">⌂</span>
                Dashboard
              </Link>

              <Link
                href="/tutor/students"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="text-lg">♙</span>
                Students
              </Link>

              <Link
                href="/tutor/sessions"
                className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700"
              >
                <span className="text-lg">▣</span>
                Sessions
              </Link>

            </div>

          </nav>

          {/* Profile */}
          <div className="border-t border-slate-100 p-4">

            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {profile.full_name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-slate-900">
                  {profile.full_name}
                </p>

                <p className="text-xs text-slate-500">
                  Tutor
                </p>

              </div>

            </div>

          </div>

        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">

          {/* TOP BAR */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10">

            <div>

              <p className="text-sm text-slate-500">
                Tutor workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Sessions
              </h1>

            </div>

            <Link
              href="/tutor/sessions/new"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Schedule Session
            </Link>

          </header>

          {/* PAGE CONTENT */}
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Your Sessions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Schedule, manage and review your one-to-one tutoring sessions.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load sessions. Please refresh the page.
              </div>
            )}

            {/* Empty State */}
            {!sessions || sessions.length === 0 ? (

              <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                  ▣
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No sessions yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Schedule your first tutoring session with one of your students.
                </p>

                <Link
                  href="/tutor/sessions/new"
                  className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  + Schedule Session
                </Link>

              </div>

            ) : (

              <div className="space-y-4">

                {sessions.map((session) => {

                  const student = Array.isArray(session.students)
                    ? session.students[0]
                    : session.students;

                  return (

                    <Link
                      key={session.id}
                      href={`/tutor/sessions/${session.id}`}
                      className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* LEFT */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <h2 className="text-lg font-bold text-slate-900">
                              {session.title}
                            </h2>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                statusStyles[session.status] ||
                                "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {statusLabels[session.status] ||
                                session.status}
                            </span>

                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">

                            <span>
                              Student:{" "}
                              <span className="font-medium text-slate-700">
                                {student?.name || "Unknown"}
                              </span>
                            </span>

                            {student?.subject && (
                              <span>
                                Subject:{" "}
                                <span className="font-medium text-slate-700">
                                  {student.subject}
                                </span>
                              </span>
                            )}

                          </div>

                          {session.topic && (
                            <div className="mt-3">

                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Topic
                              </span>

                              <p className="mt-1 text-sm text-slate-700">
                                {session.topic}
                              </p>

                            </div>
                          )}

                        </div>

                        {/* RIGHT */}
                        <div className="flex shrink-0 items-center justify-between gap-8 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">

                          <div className="text-left lg:text-right">

                            <p className="text-sm font-semibold text-slate-900">
                              {new Date(
                                session.scheduled_at
                              ).toLocaleDateString(undefined, {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {new Date(
                                session.scheduled_at
                              ).toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {session.duration_minutes} minutes
                            </p>

                          </div>

                          <span className="text-xl text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500">
                            →
                          </span>

                        </div>

                      </div>

                    </Link>

                  );
                })}

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}