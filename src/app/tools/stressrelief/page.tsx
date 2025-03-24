'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StressReliefGame from './StressReliefGame';

export default function StressReliefPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            出气包
          </h1>
          
          <StressReliefGame />
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 