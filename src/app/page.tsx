'use client';

import Link from 'next/link';
import { FaHeart, FaRegSadTear, FaAngry } from 'react-icons/fa';
import { PiNotePencilFill } from 'react-icons/pi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const tools = [
  {
    id: 'forgiveness',
    title: '求原谅小工具',
    description: '惹女朋友生气了？用这个互动小工具求原谅，让她破涕为笑',
    icon: <FaRegSadTear className="text-blue-500" />,
    color: 'bg-blue-100 hover:bg-blue-200',
    link: '/tools/forgiveness'
  },
  {
    id: 'makeup',
    title: '哄女友开心',
    description: '女朋友生气了？用这个交互式聊天工具哄她开心，让她心情舒畅',
    icon: <FaHeart className="text-pink-500" />,
    color: 'bg-pink-100 hover:bg-pink-200',
    link: '/tools/makeup'
  },
  {
    id: 'stressrelief',
    title: '出气包',
    description: '心情不好？用这个趣味互动小游戏发泄压力，让负面情绪一扫而空',
    icon: <FaAngry className="text-red-500" />,
    color: 'bg-red-100 hover:bg-red-200',
    link: '/tools/stressrelief'
  },
  {
    id: 'lovenotes',
    title: '爱的小纸条',
    description: '写下甜蜜的话语，对方打开链接时会看到飘落的纸条效果，浪漫又温馨',
    icon: <PiNotePencilFill className="text-purple-500" />,
    color: 'bg-purple-100 hover:bg-purple-200',
    link: '/tools/lovenotes'
  },
  // 未来可以添加更多工具
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                甜蜜的小工具，<span className="text-pink-500">暖心的大惊喜</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                精心设计的互动小工具，让你轻松传达爱意，哄女朋友开心
              </p>
              <div className="flex justify-center gap-4">
                <Link 
                  href="/tools/forgiveness"
                  className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md flex items-center gap-2"
                >
                  <FaHeart />
                  <span>立即体验</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Tools Section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              我们的甜蜜工具
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool) => (
                <Link key={tool.id} href={tool.link}>
                  <motion.div 
                    className={`p-6 rounded-xl shadow-md ${tool.color} transition-all cursor-pointer h-full`}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-white rounded-full">
                        {tool.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">{tool.title}</h3>
                    </div>
                    <p className="text-gray-600">{tool.description}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}
