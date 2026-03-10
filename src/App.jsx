import Hero from './components/Hero/Hero';
import ScanpathIntro from './components/ScanpathIntro/ScanpathIntro';
import NLDSection from './components/NLDSection/NLDSection';
import ScaSimSection from './components/ScaSimSection/ScaSimSection';
import MultiMatchSection from './components/MultiMatchSection/MultiMatchSection';
import ComparisonTable from './components/ComparisonTable/ComparisonTable';
import Sandbox from './components/Sandbox/Sandbox';
import Footer from './components/Footer/Footer';

export default function App() {
  return (
    <>
      <Hero />
      <ScanpathIntro />
      <NLDSection />
      <ScaSimSection />
      <MultiMatchSection />
      <ComparisonTable />
      <Sandbox />
      <Footer />
    </>
  );
}
