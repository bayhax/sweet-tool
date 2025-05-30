'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaPen, FaPaperPlane, FaRedo, FaCopy, FaTimes } from 'react-icons/fa';
import { IoIosPaper } from 'react-icons/io';
import { PiNotePencilFill } from 'react-icons/pi';
import confetti from 'canvas-confetti';

interface Note {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
}

const colors = [
  'bg-pink-100',
  'bg-purple-100',
  'bg-blue-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-red-100',
];

// 一些预设的甜蜜话语
const sweetWords = [
  '遇见你是我最美丽的意外',
  '你的笑容是我每天坚持的动力',
  '余生请多指教',
  '我的世界因你而精彩',
  '你的出现，让我的生命有了美丽的意义',
  '希望我的温柔，能成为你的避风港',
  '有你的每一天，都是特别的日子',
  '你是我最珍贵的礼物',
  '愿做你的小太阳，为你的生活带来光亮',
  '你值得被全世界温柔以待',
];

export default function LoveNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [mode, setMode] = useState<'create' | 'view'>('create');
  const [copied, setCopied] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);
  
  // 从URL参数中读取笔记
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedNotes = searchParams.get('notes');
    
    if (encodedNotes) {
      try {
        const decodedNotes = JSON.parse(decodeURIComponent(atob(encodedNotes)));
        
        // 确保在查看模式下也有动画延迟属性
        if (decodedNotes && Array.isArray(decodedNotes)) {
          decodedNotes.forEach((note, index) => {
            if (note.delay === undefined) {
              note.delay = index * 0.15;
            }
          });
        }
        
        setNotes(decodedNotes);
        setMode('view');
        triggerConfetti();
      } catch (e) {
        console.error('Failed to parse notes from URL', e);
      }
    }
  }, []);
  
  // 生成随机位置、旋转和缩放
  const generateRandomProps = (index: number, textLength: number) => {
    // 根据索引计算扩散角度和距离
    const angle = Math.random() * Math.PI * 2; // 随机角度 0-360度
    
    // 统一的距离设置，因为纸条大小现在比较一致
    const minDistance = 80;
    const maxDistance = 120 + (index * 12);
    const distance = minDistance + Math.random() * (maxDistance - minDistance);
    
    // 使用极坐标转换为笛卡尔坐标
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    return {
      x,
      y,
      rotation: Math.random() * 30 - 15,
      scale: 0.85 + Math.random() * 0.3, // 统一的缩放范围
      delay: index * 0.15,
    };
  };
  
  // 添加新纸条
  const addNote = () => {
    if (!currentNote.trim()) return;
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const { x, y, rotation, scale, delay } = generateRandomProps(notes.length, currentNote.length);
    
    const newNote: Note = {
      id: Date.now().toString(),
      text: currentNote,
      color,
      x, y, rotation, scale, delay
    };
    
    setNotes([...notes, newNote]);
    setCurrentNote('');
  };
  
  // 生成分享链接
  const generateShareUrl = () => {
    if (notes.length === 0) return;
    
    const encodedNotes = btoa(encodeURIComponent(JSON.stringify(notes)));
    const url = `${window.location.origin}${window.location.pathname}?notes=${encodedNotes}`;
    setShareUrl(url);
  };
  
  // 复制链接到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // 重置所有纸条
  const resetNotes = () => {
    setNotes([]);
    setShareUrl('');
  };
  
  // 触发五彩纸屑效果
  const triggerConfetti = () => {
    if (confettiRef.current) {
      const { left, top, width, height } = confettiRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { 
          x: centerX / window.innerWidth,
          y: centerY / window.innerHeight
        }
      });
    }
  };
  
  // 选择预设的甜蜜话语
  const selectPreset = (text: string) => {
    setCurrentNote(text);
    setShowPresets(false);
  };
  
  // 点击纸条查看完整内容
  const handleNoteClick = (note: Note) => {
    if (mode === 'view') {
      setSelectedNote(note);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={confettiRef} className="relative min-h-[60vh] bg-white p-6 rounded-lg shadow-lg">
        {/* 标题 - 只在创建模式下显示 */}
        {mode === 'create' && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-600 flex items-center justify-center gap-2">
              <PiNotePencilFill />
              爱的小纸条
            </h1>
            <p className="text-gray-600 mt-2">
              写下你的甜蜜话语，创建爱的小纸条
            </p>
          </div>
        )}
        
        {/* 飘落的纸条区域 */}
        <div className={`relative ${mode === 'create' ? 'min-h-[400px]' : 'min-h-[80vh]'} border-2 border-dashed border-pink-200 rounded-lg p-4 mb-6 overflow-hidden`}>
          <div className="absolute left-1/2 top-1/2 w-0 h-0 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
            <AnimatePresence>
              {notes.map((note, index) => {
                const isLongText = note.text.length > 15; // 降低长文本阈值
                
                // 获取预览文本
                const getPreviewText = () => {
                  if (mode === 'create') {
                    return note.text; // 创建模式显示完整文本
                  }
                  
                  if (isLongText) {
                    return note.text.substring(0, 8) + '...'; // 长文本只显示前8个字
                  }
                  
                  return note.text; // 短文本显示完整
                };
                
                return (
                  <motion.div
                    key={note.id}
                    className={`absolute p-3 rounded shadow-lg ${note.color} transform max-w-[160px] cursor-pointer`}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
                    animate={{ 
                      x: note.x,
                      y: note.y, 
                      opacity: 1,
                      rotate: note.rotation,
                      scale: note.scale
                    }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 60,
                      damping: 20,
                      duration: 1.2,
                      delay: note.delay || 0
                    }}
                    whileHover={{ 
                      scale: note.scale * 1.15, 
                      zIndex: 20,
                      rotate: 0,
                      transition: { duration: 0.2 }
                    }}
                    onClick={() => handleNoteClick(note)}
                    style={{ 
                      transformOrigin: 'center center',
                      zIndex: 10 - index,
                    }}
                  >
                    <div className="flex items-start">
                      <IoIosPaper className="text-pink-500 mr-2 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium break-words text-sm leading-relaxed">
                          {getPreviewText()}
                        </p>
                        {/* 长文本提示 */}
                        {isLongText && mode === 'view' && (
                          <div className="mt-1 text-xs text-pink-400 text-center">
                            点击查看更多
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {notes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              {mode === 'create' 
                ? '添加纸条后将在这里显示...' 
                : '没有找到任何纸条，链接可能已失效'}
            </div>
          )}
        </div>
        
        {/* 创建模式的控制面板 */}
        {mode === 'create' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-grow relative">
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="写下你想说的甜蜜话语..."
                  className="w-full p-3 border border-pink-300 rounded-lg focus:ring focus:ring-pink-200 focus:outline-none text-gray-800 font-medium"
                  rows={3}
                />
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="absolute right-3 top-3 text-pink-500 hover:text-pink-700"
                  title="查看甜蜜话语模板"
                >
                  <FaHeart />
                </button>
                
                {/* 预设甜蜜话语下拉菜单 */}
                {showPresets && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-pink-200">
                    <ul className="py-2 max-h-60 overflow-y-auto">
                      {sweetWords.map((text, index) => (
                        <li 
                          key={index}
                          className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-gray-700"
                          onClick={() => selectPreset(text)}
                        >
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={addNote}
                className="px-4 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center gap-1"
              >
                <FaPen />
                <span>添加纸条</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateShareUrl}
                disabled={notes.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                  notes.length === 0 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FaPaperPlane />
                <span>生成链接</span>
              </button>
              
              <button
                onClick={resetNotes}
                disabled={notes.length === 0}
                className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                  notes.length === 0 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <FaRedo />
                <span>重新开始</span>
              </button>
              
              {shareUrl && (
                <div className="flex-grow flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-grow bg-transparent border-none focus:outline-none text-sm text-gray-700 font-medium"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 whitespace-nowrap flex items-center"
                    title="复制链接"
                  >
                    <FaCopy className="mr-1" />
                    {copied && <span className="text-xs">已复制!</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 查看模式下的温馨提示 */}
        {mode === 'view' && notes.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-pink-500 text-lg font-medium">💕 有人为你准备了特别的惊喜 💕</p>
            <p className="text-gray-600 text-sm mt-2">点击纸条可以查看完整内容</p>
          </div>
        )}
      </div>
      
      {/* 使用说明 - 只在创建模式下显示 */}
      {mode === 'create' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-pink-600 mb-3">如何使用爱的小纸条</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>在文本框中输入你想表达的甜蜜话语</li>
            <li>点击"添加纸条"将话语添加到纸条墙上</li>
            <li>你可以添加多个纸条，每个都会有不同的颜色和位置</li>
            <li>完成后点击"生成链接"，然后复制链接</li>
            <li>将链接发送给你的心上人，当他/她打开链接时，将看到你的爱意纸条飘落的浪漫场景</li>
          </ol>
        </div>
      )}
      
      {/* 纸条详情弹窗 */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={`${selectedNote.color} p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[80vh] overflow-y-auto`}
          >
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-md"
            >
              <FaTimes />
            </button>
            <div className="flex items-start pr-8">
              <IoIosPaper className="text-pink-500 mr-3 mt-1 flex-shrink-0 text-xl" />
              <div>
                <p className="text-gray-800 font-medium text-base leading-relaxed whitespace-pre-wrap">
                  {selectedNote.text}
                </p>
                <div className="mt-4 text-xs text-gray-500 text-center">
                  💕 点击空白处关闭 💕
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 