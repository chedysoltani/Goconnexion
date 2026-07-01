import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './home/components/HeroSection';
import ProblemSection from './home/components/ProblemSection';
import FeaturesSection from './home/components/FeaturesSection';
import VideoSection from './home/components/VideoSection';
import HowItWorksSection from './home/components/HowItWorksSection';
import HumanAspectSection from './home/components/HumanAspectSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <VideoSection />
        <HowItWorksSection />
        <HumanAspectSection />
      </main>
      <Footer />
    </>
  );
}