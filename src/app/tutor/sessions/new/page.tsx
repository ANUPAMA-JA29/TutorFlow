"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Student = {
  id: string;
  name: string;
  subject: string | null;
};

export default function NewSessionPage() {
  const router = useRouter();
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("id, name, subject")
        .eq("tutor_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setError("Failed to load students.");
      } else {
        setStudents(data || []);
      }

      setLoadingStudents(false);
    }

    loadStudents();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!studentId) {
      setError("Please select a student.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a session title.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    const startTime = new Date(scheduledAt);

    if (isNaN(startTime.getTime())) {
      setError("Invalid date and time.");
      return;
    }

    if (startTime <= new Date()) {
      setError("Session must be scheduled for a future time.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: scheduleError } = await supabase.rpc(
        "schedule_session",
        {
          p_student_id: studentId,
          p_title: title.trim(),
          p_topic: topic.trim(),
          p_scheduled_at: startTime.toISOString(),
          p_duration_minutes: Number(duration),
        }
      );

      if (scheduleError) {
        console.error(scheduleError);

        const message = scheduleError.message.toLowerCase();

        if (message.includes("already has another session")) {
          setError(
            "This time overlaps with another active session. Please choose a different time."
          );
        } else if (message.includes("student not found")) {
          setError(
            "The selected student could not be found or is not assigned to you."
          );
        } else if (message.includes("invalid duration")) {
          setError("Please select a valid session duration.");
        } else {
          setError(scheduleError.message);
        }

        setLoading(false);
        return;
      }

      router.push("/tutor/sessions");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while scheduling the session.");
      setLoading(false);
    }
  }

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

          {/* Bottom info */}
          <div className="border-t border-slate-100 p-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                TutorFlow
              </p>

              <p className="mt-1 text-sm text-slate-600">
                AI-powered tutoring workspace
              </p>
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
                Schedule Session
              </h1>
            </div>

          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

            {/* BACK */}
            <Link
              href="/tutor/sessions"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Back to Sessions
            </Link>

            {/* PAGE TITLE */}
            <div className="mt-6">

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Plan a Tutoring Session
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Schedule a one-to-one session with one of your students.
              </p>

            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >

              {/* SESSION DETAILS */}
              <div className="border-b border-slate-100 p-6 md:p-8">

                <div className="mb-6">

                  <h3 className="font-bold text-slate-900">
                    Session Details
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose the student and define what the session will cover.
                  </p>

                </div>

                <div className="space-y-6">

                  {/* STUDENT */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Student <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={loadingStudents || loading}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    >

                      <option value="">
                        {loadingStudents
                          ? "Loading students..."
                          : "Select a student"}
                      </option>

                      {students.map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.name}
                          {student.subject
                            ? ` — ${student.subject}`
                            : ""}
                        </option>
                      ))}

                    </select>

                    {!loadingStudents && students.length === 0 && (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                        No students found. Add a student before scheduling a
                        session.
                      </div>
                    )}

                  </div>

                  {/* TITLE */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Session Title <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Mathematics - Algebra"
                      disabled={loading}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* TOPIC */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Topic
                    </label>

                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Quadratic Equations"
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      The topic will help the AI generate a more relevant
                      session plan.
                    </p>

                  </div>

                </div>

              </div>

              {/* TIME */}
              <div className="border-b border-slate-100 p-6 md:p-8">

                <div className="mb-6">

                  <h3 className="font-bold text-slate-900">
                    Date & Time
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose when the tutoring session will take place.
                  </p>

                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  {/* DATE TIME */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Date & Time <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      disabled={loading}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* DURATION */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Duration
                    </label>

                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>

                  </div>

                </div>

              </div>

              {/* SCHEDULING PROTECTION */}
              <div className="p-6 md:p-8">

                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">

                  <div className="flex gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                      ✓
                    </div>

                    <div>

                      <h3 className="font-semibold text-indigo-950">
                        Automatic scheduling protection
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-indigo-800">
                        TutorFlow checks your existing active sessions and
                        prevents overlapping bookings for the same tutor.
                      </p>

                    </div>

                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <Link
                    href="/tutor/sessions"
                    className="rounded-lg border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      loadingStudents ||
                      students.length === 0
                    }
                    className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Scheduling..."
                      : "Schedule Session"}
                  </button>

                </div>

              </div>

            </form>

          </div>

        </section>

      </div>
    </main>
  );
}