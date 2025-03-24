'use client';

import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-pink-600 font-bold text-xl">
          <FaHeart className="text-pink-500" />
          <span>甜言蜜语工具箱</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-gray-700 hover:text-pink-500 transition-colors">
            首页
          </Link>
          <Link href="/tools/forgiveness" className="text-gray-700 hover:text-pink-500 transition-colors">
            求原谅
          </Link>
          <Link href="/tools/makeup" className="text-gray-700 hover:text-pink-500 transition-colors">
            哄女友开心
          </Link>
          <Link href="/tools/stressrelief" className="text-gray-700 hover:text-pink-500 transition-colors">
            解压出气包
          </Link>
        </nav>
      </div>
    </header>
  );
} 