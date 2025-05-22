'use client';

import LoveNotes from './LoveNotes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LoveNotesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <LoveNotes />
      </main>
      <Footer />
    </div>
  );
} 