import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type SessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionPage({
  params,
}: SessionPageProps) {
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
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "TUTOR") {
    redirect("/student");
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .select(`
      id,
      title,
      topic,
      scheduled_at,
      duration_minutes,
      status,
      students (
        id,
        name,
        email,
        subject,
        learning_level,
        learning_goals,
        strengths,
        weaknesses
      )
    `)
    .eq("id", id)
    .eq("tutor_id", user.id)
    .single();

  if (error || !session) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Session not found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              This session does not exist or you do not have access to it.
            </p>

            <Link
              href="/tutor/sessions"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Back to Sessions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const student = Array.isArray(session.students)
    ? session.students[0]
    : session.students;

  const statusLabels: Record<string, string> = {
    SCHEDULED: "Scheduled",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    AI_REVIEWED: "AI Reviewed",
  };

  const statusStyles: Record<string, string> = {
    SCHEDULED:
      "border-blue-200 bg-blue-50 text-blue-700",

    IN_PROGRESS:
      "border-amber-200 bg-amber-50 text-amber-700",

    COMPLETED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    AI_REVIEWED:
      "border-purple-200 bg-purple-50 text-purple-700",
  };

  const lifecycle = [
    {
      number: "1",
      title: "Scheduled",
      description: "Session has been scheduled.",
      active: true,
    },
    {
      number: "2",
      title: "In Progress",
      description: "Tutor is conducting the session.",
      active:
        session.status === "IN_PROGRESS" ||
        session.status === "COMPLETED" ||
        session.status === "AI_REVIEWED",
    },
    {
      number: "3",
      title: "Completed",
      description: "Session notes and homework can be finalized.",
      active:
        session.status === "COMPLETED" ||
        session.status === "AI_REVIEWED",
    },
    {
      number: "4",
      title: "AI Reviewed",
      description: "AI-generated summary and recommendations are available.",
      active: session.status === "AI_REVIEWED",
    },
  ];

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

        {/* MAIN */}
        <section className="flex-1">

          {/* TOP BAR */}
          <header className="flex h-20 items-center border-b border-slate-200 bg-white px-6 md:px-10">

            <div>

              <p className="text-sm text-slate-500">
                Tutor workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Session Details
              </h1>

            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">

            {/* BACK */}
            <Link
              href="/tutor/sessions"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Back to Sessions
            </Link>

            {/* SESSION HEADER */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      {session.title}
                    </h2>

                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[session.status] ||
                        "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {statusLabels[session.status] ||
                        session.status}
                    </span>

                  </div>

                  {session.topic && (
                    <p className="mt-3 text-sm text-slate-500">
                      Topic:{" "}
                      <span className="font-medium text-slate-700">
                        {session.topic}
                      </span>
                    </p>
                  )}

                </div>

                <div className="rounded-xl bg-slate-50 px-5 py-4">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Session ID
                  </p>

                  <p className="mt-1 max-w-[180px] truncate text-xs font-medium text-slate-600">
                    {session.id}
                  </p>

                </div>

              </div>

              {/* SESSION INFO */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Student
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {student?.name || "Unknown"}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Scheduled
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {new Date(
                      session.scheduled_at
                    ).toLocaleDateString(undefined, {
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

                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Duration
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {session.duration_minutes} minutes
                  </p>

                </div>

              </div>

            </div>

            {/* STUDENT PROFILE */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                  {student?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Student Profile
                  </h2>

                  <p className="text-sm text-slate-500">
                    Information used to personalize tutoring sessions.
                  </p>

                </div>

              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {student?.name || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {student?.email || "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Subject
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {student?.subject || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Learning Level
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {student?.learning_level || "Not specified"}
                  </p>
                </div>

                <div className="md:col-span-2">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Learning Goals
                  </p>

                  <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {student?.learning_goals ||
                      "No learning goals added yet."}
                  </div>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Strengths
                  </p>

                  <div className="mt-2 rounded-lg bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                    {student?.strengths ||
                      "No strengths recorded yet."}
                  </div>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Areas to Improve
                  </p>

                  <div className="mt-2 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    {student?.weaknesses ||
                      "No improvement areas recorded yet."}
                  </div>

                </div>

              </div>

            </div>

            {/* LIFECYCLE */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Session Lifecycle
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  TutorFlow sessions progress through four controlled states.
                </p>

              </div>

              <div className="mt-8">

                {lifecycle.map((step, index) => (

                  <div key={step.title}>

                    <div className="flex items-start gap-4">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          step.active
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {step.active ? "✓" : step.number}
                      </div>

                      <div className="pt-1">

                        <p
                          className={`font-semibold ${
                            step.active
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {step.description}
                        </p>

                      </div>

                    </div>

                    {index < lifecycle.length - 1 && (
                      <div className="ml-[21px] h-8 border-l-2 border-slate-100" />
                    )}

                  </div>

                ))}

              </div>

              {/* CURRENT STATE */}
              <div className="mt-8 rounded-xl border border-indigo-100 bg-indigo-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Current State
                </p>

                <p className="mt-1 text-lg font-bold text-indigo-950">
                  {statusLabels[session.status] ||
                    session.status}
                </p>

                <p className="mt-1 text-sm text-indigo-700">
                  The session is currently in the{" "}
                  <span className="font-semibold">
                    {statusLabels[session.status] ||
                      session.status}
                  </span>{" "}
                  state.
                </p>

              </div>

            </div>

            {/* AI PREVIEW */}
            <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-6 shadow-sm md:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  ✦
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-900">
                    AI Session Assistant
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    TutorFlow uses the student's learning profile,
                    goals, strengths and areas to improve to generate
                    personalized session planning and post-session insights.
                  </p>

                </div>

              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <p className="font-semibold text-slate-800">
                    Before the session
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    AI can prepare a structured lesson plan based on the
                    student's profile and today's topic.
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    AI Planning
                  </span>

                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

                  <p className="font-semibold text-slate-800">
                    After the session
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    AI can summarize notes, identify strengths and gaps,
                    and suggest homework and next steps.
                  </p>

                  <span className="mt-4 inline-block rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                    AI Review
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}