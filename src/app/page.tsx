import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-3xl text-center">

        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl font-bold text-white">
            T
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            TutorFlow
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            AI-powered tutoring management platform
          </p>
        </div>

        {/* Description */}
        <div className="mx-auto max-w-xl">
          <p className="text-gray-500">
            Manage students, schedule sessions, take notes, and use AI
            to plan and review your tutoring sessions.
          </p>
        </div>

        {/* Login Button */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-black px-7 py-3.5 font-semibold text-white transition hover:bg-gray-800"
          >
            Sign In
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-2xl">👩‍🏫</div>
            <h3 className="mt-3 font-semibold">Manage Students</h3>
            <p className="mt-1 text-sm text-gray-500">
              Keep student profiles and learning goals organized.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-2xl">📅</div>
            <h3 className="mt-3 font-semibold">Schedule Sessions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Schedule sessions without tutor double booking.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="text-2xl">🤖</div>
            <h3 className="mt-3 font-semibold">AI Assistance</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate personalized plans and session reviews.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}