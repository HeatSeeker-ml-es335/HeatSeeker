import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProblemDatasetSection } from './components/ProblemDatasetSection';
import { PipelineSection } from './components/PipelineSection';
import { ThermalExplorer } from './components/ThermalExplorer';
import { BenchmarksSection } from './components/BenchmarksSection';
import { ApplicationsFooterSection } from './components/ApplicationsFooterSection';

export default function App() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemDatasetSection />
        <PipelineSection />
        <ThermalExplorer />
        <BenchmarksSection />
        <ApplicationsFooterSection />
      </main>
    </div>
  );
}
