import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ForgivenessGame from './ForgivenessGame';

export default function ForgivenessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
            求原谅小工具
          </h1>
          <p className="text-lg text-center text-gray-600 mb-12">
            惹女朋友生气了？用这个互动小工具求原谅，让她破涕为笑
          </p>
          
          <ForgivenessGame />
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 