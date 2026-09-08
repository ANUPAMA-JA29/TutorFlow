import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentsPage() {
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

  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .eq("tutor_id", user.id)
    .order("created_at", { ascending: false });

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
                className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700"
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

        {/* MAIN */}
        <section className="flex-1">

          {/* TOP BAR */}
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10">

            <div>
              <p className="text-sm text-slate-500">
                Tutor workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Students
              </h1>
            </div>

            <Link
              href="/tutor/students/new"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              + Add Student
            </Link>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">

            {/* Page heading */}
            <div className="mb-8">

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Your Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage student profiles, learning goals and progress.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Unable to load students. Please refresh the page.
              </div>
            )}

            {/* Empty state */}
            {!students || students.length === 0 ? (

              <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-2xl">
                  ♙
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  No students yet
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Add your first student to start scheduling
                  personalized tutoring sessions.
                </p>

                <Link
                  href="/tutor/students/new"
                  className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  + Add Student
                </Link>

              </div>

            ) : (

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {students.map((student) => (

                  <div
                    key={student.id}
                    className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                  >

                    {/* Student header */}
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {student.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <h2 className="truncate font-bold text-slate-900">
                            {student.name}
                          </h2>

                          <p className="truncate text-sm text-slate-500">
                            {student.email || "No email"}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Divider */}
                    <div className="my-5 border-t border-slate-100" />

                    {/* Details */}
                    <div className="space-y-4">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Subject
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {student.subject || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Learning Level
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-800">
                          {student.learning_level || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Learning Goals
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {student.learning_goals ||
                            "No learning goals added yet."}
                        </p>
                      </div>

                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">

                      <span className="text-xs text-slate-400">
                        Student profile
                      </span>

                      <Link
                        href={`/tutor/sessions/new`}
                        className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                      >
                        Schedule →
                      </Link>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </section>

      </div>
    </main>
  );
}