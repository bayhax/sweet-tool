import Link from 'next/link';
import { FaGithub, FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-6 bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">用</span>
          <FaHeart className="text-pink-500" />
          <span className="text-gray-600">制作</span>
        </div>
        <div className="text-sm text-gray-500">
          © {new Date().getFullYear()} 甜言蜜语工具箱 | Sweet Tool
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="https://github.com/username/sweet-tool" 
            target="_blank"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaGithub size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
} 