'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaRegSadTear, FaRegSmile } from 'react-icons/fa';

// 甜言蜜语和道歉的话
const sweetMessages = [
  "我错了，原谅我好吗？",
  "没有你的日子就像没有阳光一样暗淡",
  "你是我生命中最重要的人",
  "你的笑容是我最大的幸福",
  "我真的很想你",
  "我爱你胜过一切",
  "你是我的全世界",
  "没有你，我的世界不完整"
];

export default function ForgivenessGame() {
  const [stage, setStage] = useState(0);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [message, setMessage] = useState(sweetMessages[0]);
  const [isComplete, setIsComplete] = useState(false);

  // 随机生成甜言蜜语
  useEffect(() => {
    if (stage > 0 && stage < 5) {
      const randomIndex = Math.floor(Math.random() * sweetMessages.length);
      setMessage(sweetMessages[randomIndex]);
    }
  }, [stage]);

  // 处理"不原谅"按钮的移动
  const handleNoButtonHover = () => {
    if (isComplete) return;
    
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    setNoButtonPosition({ x, y });
    
    // 添加一颗心
    const newHeart = {
      id: Date.now(),
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50
    };
    setHearts(prev => [...prev, newHeart]);
  };

  // 处理"原谅"按钮点击
  const handleYesClick = () => {
    if (stage < 4) {
      setStage(prev => prev + 1);
    } else {
      setIsComplete(true);
      setStage(5);
    }
  };

  // 重新开始游戏
  const resetGame = () => {
    setStage(0);
    setNoButtonPosition({ x: 0, y: 0 });
    setHearts([]);
    setMessage(sweetMessages[0]);
    setIsComplete(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden">
      {/* 漂浮的心形背景 */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, scale: 0, x: heart.x, y: heart.y }}
            animate={{ 
              opacity: [1, 0.8, 0],
              scale: [0, 1, 1.5],
              y: heart.y - 100
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute text-pink-500"
          >
            <FaHeart size={20} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 主要内容 */}
      <div className="text-center relative z-10">
        {!isComplete ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="text-6xl mb-6 flex justify-center">
                {stage === 0 ? <FaRegSadTear className="text-blue-500" /> : <FaHeart className="text-pink-500" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{message}</h2>
              <p className="text-gray-600">
                {stage === 0 
                  ? "我做错了事，请你原谅我好吗？" 
                  : `已经说了 ${stage} 次对不起了，你愿意原谅我吗？`}
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 items-center h-20">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md"
                onClick={handleYesClick}
              >
                原谅你
              </motion.button>
              
              <motion.button
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                animate={{
                  x: noButtonPosition.x,
                  y: noButtonPosition.y,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onMouseEnter={handleNoButtonHover}
                onClick={handleNoButtonHover}
              >
                不原谅
              </motion.button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="py-8"
          >
            <div className="text-6xl mb-6 flex justify-center">
              <FaRegSmile className="text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">谢谢你原谅我！</h2>
            <p className="text-gray-600 mb-8">
              我保证以后会更加珍惜你，爱护你
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md"
              onClick={resetGame}
            >
              重新开始
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 