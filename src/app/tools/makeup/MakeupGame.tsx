'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaSmile, FaMeh, FaSadTear, FaLaughBeam, FaRegPaperPlane } from 'react-icons/fa';

// 定义消息类型接口
interface Message {
  text: string;
  type: 'user' | 'system';
}

// 甜言蜜语和开心话语
const sweetMessages = [
  "你生气的样子也很可爱，但我更喜欢你笑起来的样子",
  "我知道我做错了，原谅我好吗？",
  "你是我生命中最重要的人",
  "我每天都在想，怎么才能让你更开心",
  "你的笑容是我最大的幸福",
  "我们一起度过的每一刻都是我的珍宝",
  "我永远都不会让你一个人",
  "你的开心是我最大的心愿",
  "我们一起笑，一起哭，一起度过每一天",
  "没有你，我的世界不完整"
];

// 问题集
const questions = [
  "今天发生了什么让你不开心的事情呢？",
  "能告诉我是什么让你心情不好吗？",
  "你现在最想做什么事情？",
  "有什么我能为你做的吗？",
  "什么能让你现在感觉好一点？"
];

// 针对常见抱怨的回复
const responsePatterns = [
  {
    keywords: ["工作", "加班", "累", "疲惫", "老板"],
    responses: [
      "工作确实很累人，你辛苦了。回家了就好好放松，让我来照顾你",
      "你工作那么辛苦，真的很了不起。我很崇拜你的坚强和努力",
      "辛苦工作的你最棒了，我希望能为你分担一些压力"
    ]
  },
  {
    keywords: ["吵架", "争吵", "生气", "矛盾", "不理解"],
    responses: [
      "沟通中有些误会是正常的，但我一直很在乎你的感受",
      "我很抱歉让你不开心了，你的感受对我来说真的很重要",
      "我知道我有时候说话不够委婉，但我真的很爱你"
    ]
  },
  {
    keywords: ["想你", "miss", "想念", "见面", "距离"],
    responses: [
      "我也非常想你，即使不在一起的时候，我的心也一直和你在一起",
      "距离只会让我更加珍惜和你在一起的每一刻",
      "每天醒来第一件事就是想你，睡前最后一件事也是想你"
    ]
  },
  {
    keywords: ["不理我", "不回消息", "不联系", "冷落"],
    responses: [
      "我永远不会故意冷落你，如果有什么误会，我们可以好好沟通",
      "你是我最想联系的人，如果我没回消息，一定是有什么特殊情况",
      "对不起让你有被忽视的感觉，你永远是我心里最重要的人"
    ]
  },
  {
    keywords: ["不爱我", "变心", "不在乎", "爱情"],
    responses: [
      "我对你的爱从未改变，只会随着时间越来越深",
      "你是我生命中唯一的爱，我不可能不爱你",
      "我的心永远属于你，从遇见你的那一刻起就没有变过"
    ]
  }
];

// 开心的回应集
const happyResponses = [
  "看到你开心，我也跟着开心起来了",
  "你笑起来真好看，我可以一直看",
  "你开心的样子是我最喜欢的",
  "原来哄你开心这么简单啊，我要记下来",
  "以后每天都要这样开心，好吗？"
];

// 可爱表情
const emojis = ['❤️', '😊', '🌹', '✨', '🥰', '😘', '💕', '💖', '💓', '💝'];

// 快捷短语数据
const quickPhrases = [
  {
    category: "表达感情",
    phrases: [
      "我想你了",
      "我很抱歉",
      "我爱你",
      "你今天好吗"
    ]
  },
  {
    category: "表达需求",
    phrases: [
      "我想被抱抱",
      "陪我聊天",
      "想听甜言蜜语",
      "今天很累"
    ]
  }
];

export default function MakeupGame() {
  const [stage, setStage] = useState(0);
  const [mood, setMood] = useState<'angry' | 'neutral' | 'happy'>('angry');
  const [messages, setMessages] = useState<Message[]>([
    { text: "嗨，看起来你心情不太好。我能做些什么让你开心起来呢？", type: 'system' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiRain, setShowEmojiRain] = useState(false);
  const [fallingEmojis, setFallingEmojis] = useState<{id: number, emoji: string, x: number, delay: number}[]>([]);
  const [askedQuestion, setAskedQuestion] = useState(false);
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 表情雨效果
  useEffect(() => {
    if (showEmojiRain) {
      const newEmojis = Array.from({ length: 30 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100, // 横向位置百分比
        delay: Math.random() * 2, // 随机延迟
      }));
      
      setFallingEmojis(newEmojis);
      
      // 5秒后停止表情雨
      const timer = setTimeout(() => {
        setShowEmojiRain(false);
        setFallingEmojis([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showEmojiRain]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 心情变化效果
  useEffect(() => {
    if (stage >= 3 && mood === 'angry') {
      setMood('neutral');
    } else if (stage >= 6 && mood === 'neutral') {
      setMood('happy');
      // 触发表情雨
      setShowEmojiRain(true);
    }
  }, [stage, mood]);

  // 获取关键词匹配的回复
  const getMatchingResponse = (userInput: string) => {
    for (const pattern of responsePatterns) {
      for (const keyword of pattern.keywords) {
        if (userInput.includes(keyword.toLowerCase())) {
          // 记录用户提到的话题
          const topic = pattern.keywords[0];
          if (!userTopics.includes(topic)) {
            setUserTopics(prev => [...prev, topic]);
          }
          
          const matchingResponses = pattern.responses;
          return matchingResponses[Math.floor(Math.random() * matchingResponses.length)];
        }
      }
    }
    return null;
  };

  // 生成个性化回复
  const generatePersonalizedResponse = () => {
    // 如果用户之前提到过某些话题，偶尔会回应这些话题
    if (userTopics.length > 0 && Math.random() > 0.7) {
      const topic = userTopics[Math.floor(Math.random() * userTopics.length)];
      for (const pattern of responsePatterns) {
        if (pattern.keywords.includes(topic)) {
          return pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
        }
      }
    }
    
    // 如果用户心情变好，使用开心的回应
    if (mood === 'happy' && Math.random() > 0.5) {
      return happyResponses[Math.floor(Math.random() * happyResponses.length)];
    }
    
    // 否则使用甜言蜜语
    return sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const newMessages = [...messages, { text: inputValue, type: 'user' as const }];
    setMessages(newMessages);
    const userInput = inputValue.toLowerCase();
    setInputValue('');
    
    // 添加系统回复
    setTimeout(() => {
      let response = '';
      
      // 检查是否应该问问题
      if (!askedQuestion && stage === 1) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        response = randomQuestion;
        setAskedQuestion(true);
        setMessages(prev => [...prev, { text: response, type: 'system' as const }]);
        return;
      }
      
      // 根据用户输入选择合适的回复
      const matchingResponse = getMatchingResponse(userInput);
      
      if (matchingResponse) {
        response = matchingResponse;
      } else {
        // 如果没有匹配到关键词或者已经进入后期阶段
        response = generatePersonalizedResponse();
        
        // 最后阶段的特殊回复
        if (stage >= 8) {
          response = "看到你这么开心，我真的很满足。我爱你，永远爱你！";
        }
      }
      
      // 在某些回复中随机添加表情符号
      if (Math.random() > 0.5) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        response = `${response} ${randomEmoji}`;
      }
      
      setStage(prev => prev + 1);
      setMessages(prev => [...prev, { text: response, type: 'system' as const }]);
    }, 1000);
  };

  // 使用预设甜言蜜语
  const useSweetMessage = (index: number) => {
    const message = sweetMessages[index];
    setInputValue(message);
  };

  // 重置游戏
  const resetGame = () => {
    setStage(0);
    setMood('angry');
    setMessages([
      { text: "嗨，看起来你心情不太好。我能做些什么让你开心起来呢？", type: 'system' as const },
    ]);
    setShowEmojiRain(false);
    setFallingEmojis([]);
    setAskedQuestion(false);
    setUserTopics([]);
  };

  // 渲染心情图标
  const renderMoodIcon = () => {
    switch(mood) {
      case 'angry':
        return <FaSadTear className="text-red-500" size={36} />;
      case 'neutral':
        return <FaMeh className="text-yellow-500" size={36} />;
      case 'happy':
        return <FaLaughBeam className="text-green-500" size={36} />;
    }
  };

  // 渲染快捷短语
  const renderQuickPhrases = () => {
    return (
      <div className="mt-4 space-y-3">
        {quickPhrases.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-sm font-medium text-gray-700 mb-2">{group.category}:</h3>
            <div className="flex flex-wrap gap-2">
              {group.phrases.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(phrase)}
                  className="text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full hover:bg-pink-200 transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 relative overflow-hidden">
      {/* 表情雨效果 */}
      <AnimatePresence>
        {showEmojiRain && fallingEmojis.map(item => (
          <motion.div
            key={item.id}
            initial={{ y: -20, x: `${item.x}%`, opacity: 0 }}
            animate={{ y: '100vh', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 4,
              delay: item.delay,
              ease: 'easeInOut'
            }}
            className="absolute text-2xl pointer-events-none z-10"
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 心情状态 */}
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: mood === 'happy' ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 1,
            repeat: mood === 'happy' ? Infinity : 0,
            repeatDelay: 2
          }}
        >
          {renderMoodIcon()}
        </motion.div>
      </div>

      {/* 聊天区域 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 h-72 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.type === 'user' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="输入消息..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <FaRegPaperPlane />
        </button>
      </div>

      {/* 快捷短语 */}
      {renderQuickPhrases()}

      {/* 重置按钮 */}
      {mood === 'happy' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <p className="text-green-600 font-medium mb-3">女友已心情大好！</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            重新开始
          </button>
        </motion.div>
      )}
    </div>
  );
} 