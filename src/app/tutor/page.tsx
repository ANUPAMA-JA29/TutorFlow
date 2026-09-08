import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TutorDashboard() {
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

  // Student count
  const { count: studentCount } = await supabase
    .from("students")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("tutor_id", user.id);

  // Upcoming sessions count
  const { count: upcomingCount } = await supabase
    .from("sessions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("tutor_id", user.id)
    .in("status", ["SCHEDULED", "IN_PROGRESS"]);

  // Completed sessions count
  const { count: completedCount } = await supabase
    .from("sessions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("tutor_id", user.id)
    .in("status", ["COMPLETED", "AI_REVIEWED"]);

  // Upcoming sessions
  const { data: upcomingSessions } = await supabase
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
    .in("status", ["SCHEDULED", "IN_PROGRESS"])
    .order("scheduled_at", {
      ascending: true,
    })
    .limit(3);

  const statusStyles: Record<string, string> = {
    SCHEDULED:
      "bg-blue-50 text-blue-700 border-blue-100",

    IN_PROGRESS:
      "bg-amber-50 text-amber-700 border-amber-100",
  };

  const statusLabels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
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
                className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700"
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
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <span className="text-lg">▣</span>
                Sessions
              </Link>

            </div>
          </nav>

          {/* Bottom profile */}
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
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <Link
                href="/tutor/sessions/new"
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                + Schedule Session
              </Link>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">

            {/* Welcome */}
            <div className="mb-8">

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Good to see you, {profile.full_name?.split(" ")[0]} 👋
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening with your tutoring sessions.
              </p>

            </div>

            {/* STATS */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {/* Students */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Students
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {studentCount ?? 0}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-xl">
                    ♙
                  </div>

                </div>

                <Link
                  href="/tutor/students"
                  className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Manage students →
                </Link>

              </div>

              {/* Upcoming */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Upcoming Sessions
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {upcomingCount ?? 0}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl">
                    ◷
                  </div>

                </div>

                <Link
                  href="/tutor/sessions"
                  className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View sessions →
                </Link>

              </div>

              {/* Completed */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Completed Sessions
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {completedCount ?? 0}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-xl">
                    ✓
                  </div>

                </div>

                <Link
                  href="/tutor/sessions"
                  className="mt-5 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View history →
                </Link>

              </div>

            </div>

            {/* LOWER SECTION */}
            <div className="mt-8 grid gap-6 lg:grid-cols-3">

              {/* UPCOMING SESSIONS */}
              <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Upcoming Sessions
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your next tutoring sessions
                    </p>
                  </div>

                  <Link
                    href="/tutor/sessions"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View all
                  </Link>

                </div>

                <div className="p-6">

                  {!upcomingSessions ||
                  upcomingSessions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                        ◷
                      </div>

                      <h3 className="mt-4 font-semibold text-slate-900">
                        No upcoming sessions
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Schedule a session with one of your students.
                      </p>

                      <Link
                        href="/tutor/sessions/new"
                        className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        Schedule Session
                      </Link>

                    </div>
                  ) : (

                    <div className="space-y-4">

                      {upcomingSessions.map((session) => {

                        const student = Array.isArray(
                          session.students
                        )
                          ? session.students[0]
                          : session.students;

                        return (
                          <Link
                            key={session.id}
                            href={`/tutor/sessions/${session.id}`}
                            className="block rounded-lg border border-slate-200 p-5 transition hover:border-indigo-200 hover:bg-slate-50"
                          >

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                              <div className="min-w-0">

                                <div className="flex items-center gap-3">

                                  <h3 className="truncate font-semibold text-slate-900">
                                    {session.title}
                                  </h3>

                                  <span
                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                      statusStyles[
                                        session.status
                                      ] ||
                                      "bg-slate-50 text-slate-600"
                                    }`}
                                  >
                                    {statusLabels[
                                      session.status
                                    ] ||
                                      session.status}
                                  </span>

                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                  {student?.name || "Unknown student"}
                                  {student?.subject
                                    ? ` • ${student.subject}`
                                    : ""}
                                </p>

                              </div>

                              <div className="shrink-0 text-left sm:text-right">

                                <p className="text-sm font-semibold text-slate-900">
                                  {new Date(
                                    session.scheduled_at
                                  ).toLocaleDateString(
                                    undefined,
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {new Date(
                                    session.scheduled_at
                                  ).toLocaleTimeString(
                                    undefined,
                                    {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    }
                                  )}{" "}
                                  •{" "}
                                  {session.duration_minutes} min
                                </p>

                              </div>

                            </div>

                          </Link>
                        );
                      })}

                    </div>

                  )}

                </div>

              </div>

              {/* QUICK ACTIONS */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-100 px-6 py-5">

                  <h2 className="font-bold text-slate-900">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Common tutor tasks
                  </p>

                </div>

                <div className="space-y-3 p-6">

                  <Link
                    href="/tutor/students/new"
                    className="group block rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg group-hover:bg-white">
                        +
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          Add Student
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Create a student profile
                        </p>
                      </div>

                    </div>

                  </Link>

                  <Link
                    href="/tutor/sessions/new"
                    className="group block rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg group-hover:bg-white">
                        +
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          Schedule Session
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Plan a tutoring session
                        </p>
                      </div>

                    </div>

                  </Link>

                  <Link
                    href="/tutor/sessions"
                    className="group block rounded-lg border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg group-hover:bg-white">
                        ✓
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          Session History
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Review past sessions
                        </p>
                      </div>

                    </div>

                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}