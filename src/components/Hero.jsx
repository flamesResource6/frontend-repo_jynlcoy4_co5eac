import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden bg-slate-950">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur border border-white/10">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-sm text-cyan-200">Futuristic Student Application Portal</span>
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Apply with a story-driven, modern experience
          </h1>
          <p className="mt-4 text-cyan-100/80 text-lg md:text-xl">
            Secure login, guided multi-step forms, payments, and dashboards for both students and admins — all in one elegant flow.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
    </section>
  )
}
