import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc]">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold text-[#3b82f6]">
            IntelliHire
          </div>
          <nav className="flex gap-6">
            <Link href="/login" className="hover:text-[#3b82f6] transition-colors">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-[#3b82f6] hover:bg-[#2563eb] px-4 py-2 rounded-md transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </header>

        <main className="flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Your AI-Powered <br />
            <span className="text-[#3b82f6]">Career Intelligence</span> Platform
          </h1>
          <p className="text-xl md:text-2xl text-[#94a3b8] mb-10 max-w-2xl">
            One user. One persistent career context. Five specialized modules.
            One global AI assistant.
          </p>
          <div className="flex gap-4">
            <Link
              href="/register"
              className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 rounded-md text-lg transition-colors"
            >
              Start Your Journey
            </Link>
            <Link
              href="/login"
              className="border border-[#3b82f6] hover:bg-[#0b0f19]/80 text-[#3b82f6] px-8 py-3 rounded-md text-lg transition-colors"
            >
              I Have an Account
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
            {[
              {
                title: "Career Intelligence",
                desc: "AI-powered career analysis, resume optimization, and skill gap identification",
                color: "text-[#10b981]",
              },
              {
                title: "Adaptive Assessment",
                desc: "Smart skill assessments with adaptive difficulty and real-time feedback",
                color: "text-[#8b5cf6]",
              },
              {
                title: "Interview Simulator",
                desc: "AI technical and HR interview practice with personalized coaching",
                color: "text-[#f59e0b]",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="p-6 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-[#3b82f6] transition-colors"
              >
                <div className={`text-3xl mb-4 font-bold ${card.color}`}>✓</div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-[#94a3b8]">{card.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
