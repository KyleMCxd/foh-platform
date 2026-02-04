export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-gradient opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex flex-col items-center gap-8 text-center relative z-10 max-w-lg w-full">
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
            FOH Academy
          </h1>
          <p className="text-lg text-muted-foreground">
            Student Platform - Learning Management System
          </p>
        </div>

        <div className="w-full bg-white/50 backdrop-blur-xl border border-white/50 p-8 rounded-2xl shadow-xl shadow-indigo-500/10">
          <div className="flex flex-col gap-4">
            <a
              href="/dashboard"
              className="w-full text-center bg-brand-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              ENTER STUDENT PORTAL
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              Authorized Access Only. v1.2.0-light
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
