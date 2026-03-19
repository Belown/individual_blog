import Navigation from './layout/Navigation';
import IntroSection from './components/IntroSection';
import PatternsSection from './components/PatternsSection';
import FactorsSection from './components/FactorsSection';
import SandboxSection from './components/SandboxSection';
import Footer from './layout/Footer';

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <IntroSection />
        <PatternsSection />
        <FactorsSection />
        <SandboxSection />
      </main>
      <Footer />
    </>
  );
}
