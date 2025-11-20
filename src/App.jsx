import Hero from './components/Hero'
import AuthAndDashboards from './components/AuthAndDashboards'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 selection:bg-cyan-400/30">
      <Hero />
      <AuthAndDashboards />
      <footer className="container mx-auto px-6 py-12 text-center text-white/50">
        Built with a storytelling experience, responsive and animated.
      </footer>
    </div>
  )
}

export default App
