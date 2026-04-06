import { Controls } from './components/Controls';
import { Timeline } from './components/Timeline';
import { AgentState } from './components/AgentState';
import { MetricsPanel } from './components/MetricsPanel';

import { ParticleBackground } from './components/ParticleBackground';
import { CustomCursor } from './components/CustomCursor';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary-500/30 overflow-hidden text-slate-200">
      <CustomCursor />
      <ParticleBackground />
      
      <Controls />
      
      <main className="flex-1 p-4 md:p-6 relative z-10 h-full w-full">
        <div className="max-w-[1600px] mx-auto w-full h-[calc(100vh-8rem)]">
          {/* Main 3-column Layout */}
          <div className="flex gap-6 h-full">
            
            {/* Left Column: Timeline */}
            <div className="w-[320px] shrink-0 h-full">
              <Timeline />
            </div>

            {/* Center Column: Live Agent State */}
            <div className="flex-1 min-w-[500px] h-full">
              <AgentState />
            </div>

            {/* Right Column: Score & Metrics */}
            <div className="w-[340px] shrink-0 h-full">
              <MetricsPanel />
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
