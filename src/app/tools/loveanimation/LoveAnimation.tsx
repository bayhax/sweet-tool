'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaStar, FaCrown, FaGift, FaMusic, FaCommentDots } from 'react-icons/fa';

// 定义消息类型
interface Message {
  id: number;
  text: string;
  type: 'text' | 'heart' | 'flower' | 'star' | 'gift' | 'music';
  position: {x: number, y: number};
}

// 甜言蜜语集合
const sweetMessages = [
  "每天都想见到你的笑容",
  "你是我生命中最美好的遇见",
  "有你的日子，每一天都很特别",
  "你的眼睛真好看，像星星一样闪烁",
  "想和你一起去看遍世界的美景",
  "你的笑容是我一天的动力",
  "每天醒来最幸福的事就是想到你",
  "我喜欢你胜过喜欢世界上任何事物",
  "你是我的小太阳，照亮我的每一天",
  "走过千山万水，最想邂逅的还是你",
  "我希望我的余生都有你在身边",
  "你的笑容是这世界上最动人的风景",
  "特别想和你一起看海，看山，看日出",
  "你的快乐是我最大的幸福",
  "想把我所有的温柔都给你",
];

// 互动回应
const interactionResponses = [
  "你真的好甜啊~",
  "我喜欢你喜欢到不知道说什么好了",
  "这瞬间太美好了，想永远珍藏",
  "和你在一起的每一刻都很珍贵",
  "你是我永远的小情人",
  "此刻我只想抱抱你",
  "我的爱意已经溢出屏幕了",
  "想要为你写满整个宇宙的情书",
  "遇见你是我最幸运的事",
  "这一刻只想和你分享",
];

// 花样类型
const itemTypes = ['heart', 'star', 'flower', 'gift', 'music'];

export default function LoveAnimation() {
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeScene, setActiveScene] = useState<number>(0);
  const [userInteraction, setUserInteraction] = useState<number>(0);
  const [showInputPanel, setShowInputPanel] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const stageRef = useRef<HTMLDivElement>(null);

  // 场景切换
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeScene < 3) {
        setActiveScene(prev => prev + 1);
      }
    }, 10000); // 10秒切换一次场景
    
    return () => clearTimeout(timer);
  }, [activeScene]);
  
  // 生成随机位置
  const getRandomPosition = () => {
    if (!stageRef.current) return {x: 50, y: 50};
    
    const stageWidth = stageRef.current.offsetWidth;
    const stageHeight = stageRef.current.offsetHeight;
    
    return {
      x: Math.random() * (stageWidth - 100) + 50,
      y: Math.random() * (stageHeight - 100) + 50
    };
  };

  // 添加互动元素
  const addInteractionItem = (type: 'text' | 'heart' | 'flower' | 'star' | 'gift' | 'music' = 'heart', text?: string) => {
    const newMessage: Message = {
      id: Date.now(),
      text: text || interactionResponses[Math.floor(Math.random() * interactionResponses.length)],
      type,
      position: getRandomPosition()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setUserInteraction(prev => prev + 1);
    
    // 3秒后移除消息
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 3000);
  };

  // 处理画布点击
  const handleStageClick = (e: React.MouseEvent) => {
    if (!stageRef.current) return;
    
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 随机选择一种类型的互动元素
    const type = itemTypes[Math.floor(Math.random() * itemTypes.length)] as 'heart' | 'flower' | 'star' | 'gift' | 'music';
    
    const newMessage: Message = {
      id: Date.now(),
      text: '',
      type,
      position: {x, y}
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 3秒后移除消息
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 3000);
  };

  // 发送甜言蜜语
  const sendSweetMessage = () => {
    const messageToSend = customMessage || selectedMessage || sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
    
    if (messageToSend) {
      addInteractionItem('text', messageToSend);
      setCustomMessage('');
      setSelectedMessage('');
      setShowInputPanel(false);
    }
  };

  // 组件主体部分
  return (
    <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-lg p-6 md:p-8 overflow-hidden">
      {/* 后续将添加渲染代码 */}
      {/* 互动标题 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-pink-600">与你的心动时刻</h2>
        <p className="text-gray-600">点击空白处创造惊喜，或发送甜言蜜语</p>
      </div>
      
      {/* 场景舞台 */}
      <div 
        ref={stageRef} 
        className="relative bg-gradient-to-b from-pink-50 to-purple-50 rounded-lg min-h-[400px] w-full overflow-hidden border-2 border-pink-200 shadow-inner"
        onClick={handleStageClick}
      >
        {/* 背景装饰 - 根据场景变化 */}
        <div className="absolute inset-0 pointer-events-none">
          {activeScene === 0 && (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1518972559233-77a46ee27125?q=80&w=1470')] bg-cover bg-center opacity-20"></div>
          )}
          {activeScene === 1 && (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1496062031456-07b8f162a322?q=80&w=1471')] bg-cover bg-center opacity-20"></div>
          )}
          {activeScene === 2 && (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?q=80&w=1470')] bg-cover bg-center opacity-20"></div>
          )}
          {activeScene === 3 && (
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1559310278-18a9192d909f?q=80&w=1470')] bg-cover bg-center opacity-20"></div>
          )}
        </div>
        
        {/* 动态元素 */}
        <AnimatePresence>
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                left: `${message.position.x}px`,
                top: `${message.position.y}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              {message.type === 'text' && (
                <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg max-w-[250px]">
                  <p className="text-pink-600 text-center">{message.text}</p>
                </div>
              )}
              
              {message.type === 'heart' && (
                <FaHeart className="text-pink-500 text-4xl animate-pulse" />
              )}
              
              {message.type === 'star' && (
                <FaStar className="text-yellow-400 text-4xl animate-spin-slow" />
              )}
              
              {message.type === 'flower' && (
                <div className="flower">
                  <div className="bg-pink-400 w-10 h-10 rounded-full flex items-center justify-center">
                    <div className="bg-yellow-300 w-5 h-5 rounded-full"></div>
                  </div>
                </div>
              )}
              
              {message.type === 'gift' && (
                <FaGift className="text-purple-500 text-4xl animate-bounce" />
              )}
              
              {message.type === 'music' && (
                <FaMusic className="text-blue-500 text-4xl animate-wiggle" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 场景底部装饰 */}
        <div className="absolute bottom-0 w-full">
          {activeScene === 0 && (
            <div className="h-16 bg-gradient-to-t from-pink-200/50 to-transparent"></div>
          )}
          {activeScene === 1 && (
            <div className="h-20 bg-gradient-to-t from-purple-200/50 to-transparent"></div>
          )}
          {activeScene === 2 && (
            <div className="h-24 bg-gradient-to-t from-blue-200/50 to-transparent"></div>
          )}
          {activeScene === 3 && (
            <div className="h-28 bg-gradient-to-t from-indigo-200/50 to-transparent"></div>
          )}
        </div>
        
        {/* 等待用户互动的提示 */}
        {messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center p-4 rounded-lg bg-white/70 backdrop-blur-sm"
            >
              <p className="text-pink-600 font-medium">点击屏幕创造美好瞬间</p>
              <p className="text-gray-500 text-sm mt-2">或发送一句甜言蜜语</p>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* 互动按钮区 */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => addInteractionItem('heart')}
          className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md flex items-center gap-2"
        >
          <FaHeart className="text-pink-200" />
          <span>心动</span>
        </button>
        
        <button
          onClick={() => setShowInputPanel(!showInputPanel)}
          className="px-4 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors shadow-md flex items-center gap-2"
        >
          <FaCommentDots className="text-purple-200" />
          <span>甜言蜜语</span>
        </button>
        
        <button
          onClick={() => addInteractionItem('gift')}
          className="px-4 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-2"
        >
          <FaGift className="text-indigo-200" />
          <span>小惊喜</span>
        </button>
        
        <button
          onClick={() => setActiveScene(prev => (prev + 1) % 4)}
          className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2"
        >
          <FaCrown className="text-blue-200" />
          <span>换场景</span>
        </button>
      </div>
      
      {/* 甜言蜜语输入面板 */}
      <AnimatePresence>
        {showInputPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 bg-white rounded-lg p-4 shadow-md"
          >
            <h3 className="text-lg font-medium text-pink-600 mb-3">选择或写一句甜言蜜语</h3>
            
            {/* 预设甜言蜜语 */}
            <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {sweetMessages.slice(0, 6).map((msg, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMessage(msg)}
                  className={`text-sm p-2 rounded-md border transition-colors text-left ${
                    selectedMessage === msg 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-pink-300 text-gray-700'
                  }`}
                >
                  {msg.length > 20 ? msg.substring(0, 20) + '...' : msg}
                </button>
              ))}
            </div>
            
            {/* 自定义消息输入 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="或输入你想说的话..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              
              <button
                onClick={sendSweetMessage}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                发送
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 互动计数 */}
      {userInteraction > 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            你们已经创造了 <span className="font-bold text-pink-600">{userInteraction}</span> 个美好瞬间
          </p>
        </div>
      )}
    </div>
  );
} 