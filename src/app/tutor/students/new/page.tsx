"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewStudentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [subject, setSubject] = useState("");
  const [learningLevel, setLearningLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter the student's name.");
      return;
    }

    if (!subject.trim()) {
      setError("Please enter the subject.");
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

      const { error: insertError } = await supabase
        .from("students")
        .insert({
          tutor_id: user.id,
          name: name.trim(),
          email: email.trim() || null,
          age: age ? Number(age) : null,
          subject: subject.trim(),
          learning_level: learningLevel.trim() || null,
          learning_goals: learningGoals.trim() || null,
          strengths: strengths.trim() || null,
          weaknesses: weaknesses.trim() || null,
        });

      if (insertError) {
        console.error(insertError);
        setError(insertError.message);
        setLoading(false);
        return;
      }

      router.push("/tutor/students");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while adding the student.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">

          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <Link
              href="/tutor"
              className="text-2xl font-bold tracking-tight text-slate-900"
            >
              Tutor<span className="text-indigo-600">Flow</span>
            </Link>
          </div>

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

        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1">

          {/* TOP BAR */}
          <header className="flex h-20 items-center border-b border-slate-200 bg-white px-6 md:px-10">

            <div>
              <p className="text-sm text-slate-500">
                Tutor workspace
              </p>

              <h1 className="text-xl font-bold text-slate-900">
                Add Student
              </h1>
            </div>

          </header>

          {/* FORM AREA */}
          <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

            <Link
              href="/tutor/students"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Students
            </Link>

            <div className="mt-6">

              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Student Profile
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add information about your student to personalize future
                tutoring sessions and AI recommendations.
              </p>

            </div>

            {/* FORM CARD */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm"
            >

              {/* BASIC INFORMATION */}
              <div className="border-b border-slate-100 p-6 md:p-8">

                <div className="mb-6">

                  <h3 className="font-bold text-slate-900">
                    Basic Information
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Basic details about the student.
                  </p>

                </div>

                <div className="grid gap-6 md:grid-cols-2">

                  {/* NAME */}
                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Student Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      disabled={loading}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* EMAIL */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* AGE */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Age
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 16"
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* SUBJECT */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Subject <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Mathematics"
                      disabled={loading}
                      required
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* LEVEL */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Learning Level
                    </label>

                    <select
                      value={learningLevel}
                      onChange={(e) => setLearningLevel(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    >
                      <option value="">Select level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>

                  </div>

                </div>

              </div>

              {/* LEARNING PROFILE */}
              <div className="border-b border-slate-100 p-6 md:p-8">

                <div className="mb-6">

                  <h3 className="font-bold text-slate-900">
                    Learning Profile
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    These details help TutorFlow personalize AI-generated
                    session plans.
                  </p>

                </div>

                <div className="space-y-6">

                  {/* GOALS */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Learning Goals
                    </label>

                    <textarea
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder="What does the student want to achieve?"
                      rows={4}
                      disabled={loading}
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* STRENGTHS */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Strengths
                    </label>

                    <textarea
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      placeholder="What topics or skills does the student do well in?"
                      rows={3}
                      disabled={loading}
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                  {/* WEAKNESSES */}
                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Areas to Improve
                    </label>

                    <textarea
                      value={weaknesses}
                      onChange={(e) => setWeaknesses(e.target.value)}
                      placeholder="Which topics or skills need more attention?"
                      rows={3}
                      disabled={loading}
                      className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                    />

                  </div>

                </div>

              </div>

              {/* FOOTER */}
              <div className="p-6 md:p-8">

                {error && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <Link
                    href="/tutor/students"
                    className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Adding Student..." : "Add Student"}
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