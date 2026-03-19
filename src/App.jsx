import Navigation from './layout/Navigation';
import IntroSection from './components/IntroSection/IntroSection';
import PatternsSection from './components/PatternsSection/PatternsSection';
import FactorsSection from './components/FactorSection/FactorsSection';
import SandboxSection from './components/SandboxSection/SandboxSection';
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
