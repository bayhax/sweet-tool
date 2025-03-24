'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaAngry, 
  FaSmile, 
  FaBomb, 
  FaHandRock, 
  FaTools, 
  FaMusic,
  FaBolt
} from 'react-icons/fa';

// 定义游戏中的物品类型
interface Item {
  id: number;
  type: 'balloon' | 'bubble' | 'plate' | 'pillow' | 'drum';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isBroken: boolean;
}

// 定义常量
const MAX_ITEMS = 20; // 最大物品数量
const STRESS_REDUCTION_PER_CLICK = 5; // 每次点击减少的压力值

// 解压方式 - 更新图标和名称
const reliefModes = [
  { id: 'balloon', name: '气球', icon: <FaBomb className="text-red-500" />, color: 'bg-red-100 hover:bg-red-200' },
  { id: 'bubble', name: '泡泡', icon: <FaTools className="text-blue-500" />, color: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'plate', name: '盘子', icon: <FaHandRock className="text-orange-500" />, color: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'pillow', name: '枕头', icon: <FaBolt className="text-purple-500" />, color: 'bg-purple-100 hover:bg-purple-200' },
  { id: 'drum', name: '铃铛', icon: <FaMusic className="text-green-500" />, color: 'bg-green-100 hover:bg-green-200' },
];

// 鼓励的语句 - 改为更幽默、哄人的语句
const encouragements = [
  "这个泡泡爆得真好听！",
  "看来心情好一点了吧？",
  "你笑起来真好看！",
  "你看，生气的情绪被你赶跑啦！",
  "再来点击几下，我猜你已经在偷笑了~",
  "这么厉害，生气的情绪都被你消灭了！",
  "继续点击，我保证你会笑出来~"
];

export default function StressReliefGame() {
  // 游戏状态
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [currentMode, setCurrentMode] = useState<string>('balloon');
  const [message, setMessage] = useState<string>('点击开始，赶走不开心的情绪！');
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [stressLevel, setStressLevel] = useState(100);
  const [combo, setCombo] = useState(0);  // 连击次数
  const [showBonus, setShowBonus] = useState(false);  // 显示奖励动画
  const [bonusPosition, setBonusPosition] = useState({x: 0, y: 0});  // 奖励动画位置
  const [lastClickTime, setLastClickTime] = useState(0);  // 上次点击时间
  const [isClient, setIsClient] = useState(false); // 客户端渲染标志
  const [confettiItems, setConfettiItems] = useState<React.ReactNode[]>([]); // 礼花粒子
  const [audioLoaded, setAudioLoaded] = useState(false); // 音频加载状态
  
  // 引用
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 检测是否客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 预加载音频
  useEffect(() => {
    if (!isClient) return;
    
    // 客户端渲染时，初始化AudioContext
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        console.log("AudioContext支持检测成功");
        setAudioLoaded(true);
      } else {
        console.warn("当前环境不支持AudioContext，音效将不可用");
        setAudioLoaded(true); // 也设置为已加载，避免阻塞游戏
      }
    } catch (err) {
      console.error("检测AudioContext失败:", err);
      setAudioLoaded(true); // 出错时也设置为已加载，避免阻塞游戏
    }
    
    return () => {
      // 清理资源
    };
  }, [isClient]);
  
  // 移除外部音效依赖，使用简单的音效函数
  function playInlineSound(type: string) {
    if (!isClient) return;
    
    // 使用AudioContext API创建简单的音效
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // 根据不同类型设置不同的音效参数
      switch(type) {
        case 'balloon':
          oscillator.type = 'sine';
          oscillator.frequency.value = 400;
          gainNode.gain.value = 0.1;
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'bubble':
          oscillator.type = 'sine';
          oscillator.frequency.value = 300;
          gainNode.gain.value = 0.1;
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.2);
          break;
        case 'plate':
          oscillator.type = 'square';
          oscillator.frequency.value = 200;
          gainNode.gain.value = 0.2;
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.4);
          break;
        case 'pillow':
          oscillator.type = 'triangle';
          oscillator.frequency.value = 150;
          gainNode.gain.value = 0.1;
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'drum':
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = 250;
          gainNode.gain.value = 0.15;
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          break;
        case 'applause':
          // 模拟掌声 - 多个短促的音效
          for(let i = 0; i < 8; i++) {
            setTimeout(() => {
              const tempOsc = audioContext.createOscillator();
              const tempGain = audioContext.createGain();
              tempOsc.type = 'triangle';
              tempOsc.frequency.value = 400 + Math.random() * 200;
              tempGain.gain.value = 0.05;
              tempGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              tempOsc.connect(tempGain);
              tempGain.connect(audioContext.destination);
              tempOsc.start();
              tempOsc.stop(audioContext.currentTime + 0.1);
            }, i * 80);
          }
          break;
        default:
          console.warn(`未知的音效类型: ${type}`);
          return false;
      }
      
      console.log(`播放内联音效: ${type}`);
      return true;
    } catch(err) {
      console.error('无法播放内联音效:', err);
      return false;
    }
  }
  
  // 播放音效的函数
  const playSound = (soundType: string) => {
    if (!isClient) {
      console.log(`跳过播放音效 ${soundType}: 客户端未就绪`);
      return;
    }
    
    // 使用内联音效替代外部音效
    playInlineSound(soundType);
  };
  
  // 自动生成物品的效果
  useEffect(() => {
    // 清理定时器
    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
      generationTimerRef.current = null;
    }
    
    if (isPlaying) {
      // 确保只有在游戏中才生成物品
      generateItems();
    }
    
    return () => {
      // 清理定时器
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
        generationTimerRef.current = null;
      }
    };
  }, [isPlaying]); // 仅依赖于游戏状态，不依赖于当前模式
  
  // 切换模式时更新物品
  useEffect(() => {
    if (isPlaying) {
      // 将所有物品标记为已破坏
      setItems(prevItems => prevItems.map(item => ({...item, isBroken: true})));
      
      // 等待动画完成后清空物品并生成新物品
      const timer = setTimeout(() => {
        setItems([]);
        const genTimer = setTimeout(() => {
          generateItems();
        }, 300);
        
        return () => clearTimeout(genTimer);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentMode]);
  
  // 开始游戏
  const startGame = () => {
    setIsPlaying(true);
    setItems([]);
    setScore(0);
    setStressLevel(100);
    setMessage('点击开始，赶走不开心的情绪！');
  };
  
  // 生成物品
  const generateItems = () => {
    if (!isPlaying || !gameAreaRef.current) return;
    
    // 检查物品数量是否达到上限
    if (items.length >= MAX_ITEMS) {
      console.log(`物品数量已达上限 (${MAX_ITEMS})，停止生成`);
      return;
    }
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    // 计算安全边距 - 避免物品生成在边缘
    const safeMargin = 100;
    
    // 计算安全区域的宽度和高度
    const safeWidth = gameArea.width - safeMargin * 2;
    const safeHeight = gameArea.height - safeMargin * 2;
    
    // 确保安全区域为正数
    if (safeWidth <= 0 || safeHeight <= 0) return;
    
    // 计算安全区域内的随机位置
    const x = safeMargin + Math.random() * safeWidth;
    const y = safeMargin + Math.random() * safeHeight;
    
    // 随机大小但不要太大
    const scale = 0.7 + Math.random() * 0.6;
    
    // 创建新物品，确保ID唯一
    const newItem: Item = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      x,
      y,
      scale,
      type: currentMode as 'balloon' | 'bubble' | 'plate' | 'pillow' | 'drum',
      isBroken: false,
      rotation: Math.random() * 360
    };
    
    setItems(prevItems => [...prevItems, newItem]);
    
    // 随机决定下一个物品生成的时间间隔 (1-3秒)
    const nextItemDelay = 1000 + Math.random() * 2000;
    
    generationTimerRef.current = setTimeout(generateItems, nextItemDelay);
  };
  
  // 切换模式
  const changeMode = (mode: string) => {
    if (currentMode === mode) return;
    setCurrentMode(mode);
  };
  
  // 结束游戏
  const endGame = () => {
    setIsPlaying(false);
    setMessage('你已经完全开心起来啦！记得下次心情不好也可以来玩～');
    
    // 5秒后自动重置游戏状态，准备下一轮
    setTimeout(() => {
      setConfetti(false);
      setItems([]);
      setScore(0);
      setStressLevel(100);
    }, 5000);
  };
  
  // 点击物品时的处理
  const handleItemClick = (item: Item) => {
    if (!isClient) return; // 确保只在客户端执行
    
    // 播放音效
    playSound(item.type);
    
    // 减少压力值
    setStressLevel(prev => {
      const newLevel = Math.max(0, prev - STRESS_REDUCTION_PER_CLICK);
      
      // 检查游戏是否结束
      if (newLevel === 0) {
        setMessage('恭喜你！已经彻底释放了压力！');
        setConfetti(true);
        playSound('applause');
        
        // 3秒后结束游戏
        setTimeout(() => {
          endGame();
        }, 3000);
      }
      
      return newLevel;
    });
    
    // 标记物品为已破坏
    setItems(prevItems => 
      prevItems.map(i => 
        i.id === item.id ? { ...i, isBroken: true } : i
      )
    );
    
    // 增加分数 - 根据连击增加分数
    const baseScore = 10;
    const comboMultiplier = Math.min(combo, 5); // 最高5倍
    const finalScore = baseScore * (comboMultiplier || 1);
    
    setScore(prev => prev + finalScore);
    
    // 随机显示鼓励消息
    if (Math.random() > 0.7) {
      const randomIndex = Math.floor(Math.random() * encouragements.length);
      setMessage(encouragements[randomIndex]);
    }
    
    // 两秒后删除已破坏的物品
    setTimeout(() => {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    }, 2000);
  };
  
  // 重新开始游戏
  const restartGame = () => {
    setIsPlaying(false);
    setConfetti(false);
    setMessage('准备好赶走不开心了吗？');
    setTimeout(() => {
      startGame();
    }, 500);
  };
  
  // 获取物品样式
  const getItemStyle = (item: Item) => {
    switch(item.type) {
      case 'balloon':
        return {
          width: `${50 * item.scale}px`,
          height: `${70 * item.scale}px`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          background: !item.isBroken ? 'radial-gradient(circle at 30% 30%, #ff9ff3, #f368e0)' : 'transparent',
          position: 'absolute' as const,
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `rotate(${item.rotation}deg)`,
          cursor: 'pointer',
          boxShadow: !item.isBroken ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
        };
      case 'bubble':
        return {
          width: `${60 * item.scale}px`,
          height: `${60 * item.scale}px`,
          borderRadius: '50%',
          background: !item.isBroken ? 'radial-gradient(circle at 30% 30%, rgba(214, 248, 255, 0.9), rgba(190, 231, 253, 0.7))' : 'transparent',
          border: !item.isBroken ? '2px solid rgba(255, 255, 255, 0.7)' : 'none',
          position: 'absolute' as const,
          left: `${item.x}px`,
          top: `${item.y}px`,
          boxShadow: !item.isBroken ? '0 0 15px rgba(255, 255, 255, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.5)' : 'none',
          cursor: 'pointer'
        };
      case 'plate':
        return {
          width: `${80 * item.scale}px`,
          height: `${20 * item.scale}px`,
          borderRadius: '50%',
          background: !item.isBroken ? 'linear-gradient(135deg, #fdcb6e, #e17055)' : 'transparent',
          border: !item.isBroken ? '1px solid #ff7675' : 'none',
          position: 'absolute' as const,
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `rotate(${item.rotation}deg)`,
          boxShadow: !item.isBroken ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
          cursor: 'pointer'
        };
      case 'pillow':
        return {
          width: `${80 * item.scale}px`,
          height: `${50 * item.scale}px`,
          borderRadius: '10px',
          background: !item.isBroken ? 'linear-gradient(135deg, #a29bfe, #6c5ce7)' : 'transparent',
          position: 'absolute' as const,
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `rotate(${item.rotation}deg)`,
          boxShadow: !item.isBroken ? '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.3)' : 'none',
          cursor: 'pointer'
        };
      case 'drum':
        return {
          width: `${60 * item.scale}px`,
          height: `${60 * item.scale}px`,
          borderRadius: '50%',
          background: !item.isBroken ? 'radial-gradient(circle at 30% 30%, #ffeaa7, #fdcb6e)' : 'transparent',
          border: !item.isBroken ? '3px solid #f9ca24' : 'none',
          position: 'absolute' as const,
          left: `${item.x}px`,
          top: `${item.y}px`,
          transform: `rotate(${item.rotation}deg)`,
          boxShadow: !item.isBroken ? '0 4px 8px rgba(0, 0, 0, 0.15)' : 'none',
          cursor: 'pointer'
        };
      default:
        return {};
    }
  };

  // 渲染破裂效果
  const renderBrokenEffect = (item: Item) => {
    if (!item.isBroken || !isClient) return null;
    
    switch(item.type) {
      case 'balloon':
        return (
          <div className="balloon-pieces">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`piece-${item.id}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 120, 
                  y: Math.random() * 120,
                  opacity: 0,
                  scale: Math.random() * 0.5 + 0.5 
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i % 2 === 0 ? '#ff9ff3' : '#f368e0',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(255, 159, 243, 0.2)',
                left: 0,
                top: 0
              }}
            />
          </div>
        );
      case 'bubble':
        return (
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(214, 248, 255, 0.5)',
              background: 'rgba(214, 248, 255, 0.2)',
              left: 0,
              top: 0,
              boxShadow: '0 0 10px rgba(214, 248, 255, 0.5)'
            }}
          />
        );
      case 'plate':
        return (
          <div className="plate-pieces">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`piece-${item.id}-${i}`}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 150, 
                  y: Math.random() * 150 - 50,
                  rotate: Math.random() * 360,
                  opacity: 0 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: `${(Math.random() * 20) + 10}px`,
                  height: `${(Math.random() * 10) + 5}px`,
                  background: i % 2 === 0 ? '#fdcb6e' : '#e17055',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}
              />
            ))}
          </div>
        );
      case 'pillow':
        return (
          <div className="pillow-pieces">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={`piece-${item.id}-${i}`}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 100, 
                  y: (Math.random() - 0.5) * 100,
                  scale: Math.random() * 0.8 + 0.2,
                  rotate: Math.random() * 180,
                  opacity: 0 
                }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: i % 3 === 0 ? '#a29bfe' : (i % 3 === 1 ? '#6c5ce7' : 'white'),
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '10px',
                background: 'rgba(162, 155, 254, 0.2)',
                left: 0,
                top: 0
              }}
            />
          </div>
        );
      case 'drum':
        return (
          <>
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid #f9ca24',
                background: 'rgba(253, 203, 110, 0.3)',
                left: 0,
                top: 0
              }}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                position: 'absolute',
                width: '50%',
                height: '50%',
                borderRadius: '50%',
                background: 'rgba(255, 234, 167, 0.7)',
                left: '25%',
                top: '25%'
              }}
            />
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`spark-${item.id}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                animate={{ 
                  x: Math.cos(i * Math.PI / 4) * 80,
                  y: Math.sin(i * Math.PI / 4) * 80,
                  opacity: 0,
                  scale: 0 
                }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#f9ca24',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 5px #ffeaa7'
                }}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  // 渲染模式选择按钮
  const renderModesSelection = () => {
    return (
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {reliefModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => changeMode(mode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentMode === mode.id 
                ? 'bg-gray-800 text-white' 
                : `${mode.color} text-gray-800`
            }`}
          >
            {mode.icon}
            <span>{mode.name}</span>
          </button>
        ))}
      </div>
    );
  };

  // 礼花效果
  useEffect(() => {
    if (!confetti || !isClient) {
      setConfettiItems([]);
      return;
    }
    
    // 客户端代码，生成礼花粒子
    const items = [...Array(80)].map((_, i) => {
      const size = Math.random() * 10 + 5;
      const colors = ['#ff9ff3', '#a29bfe', '#55efc4', '#ffeaa7', '#74b9ff', '#fd79a8', '#fdcb6e'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shapes = ['circle', 'square', 'triangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      let style: React.CSSProperties = {
        position: 'fixed',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        zIndex: 50
      };
      
      if (shape === 'circle') {
        style.borderRadius = '50%';
      } else if (shape === 'triangle') {
        style.width = '0';
        style.height = '0';
        style.backgroundColor = 'transparent';
        style.borderLeft = `${size/2}px solid transparent`;
        style.borderRight = `${size/2}px solid transparent`;
        style.borderBottom = `${size}px solid ${color}`;
      }
      
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 700;
      
      const startX = Math.random() * windowWidth;
      const randomOffsetX = (Math.random() - 0.5) * 200;
      const randomDuration = Math.random() * 4 + 2;
      const randomDelay = Math.random() * 5;
      const randomRotate = Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1);
      
      return (
        <motion.div
          key={`confetti-${i}`}
          initial={{
            x: startX,
            y: -20,
            opacity: 1,
            rotate: 0
          }}
          animate={{
            y: windowHeight + 20,
            rotate: randomRotate,
            x: startX + randomOffsetX
          }}
          transition={{
            duration: randomDuration,
            ease: "easeOut",
            repeat: Infinity,
            delay: randomDelay
          }}
          style={style}
        />
      );
    });
    
    setConfettiItems(items);
  }, [confetti, isClient]);
  
  // 渲染礼花效果 - 现在只是返回已经生成的礼花粒子
  const renderConfetti = () => {
    if (!confetti || !isClient) return null;
    return <div className="confetti-container">{confettiItems}</div>;
  };

  // 渲染奖励动画
  const renderBonus = () => {
    if (!showBonus) return null;
    
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 1 }}
        exit={{ scale: 2, opacity: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          left: `${bonusPosition.x}px`,
          top: `${bonusPosition.y}px`,
          color: '#f1c40f',
          fontWeight: 'bold',
          zIndex: 100,
          textShadow: '0 0 5px rgba(0,0,0,0.5)'
        }}
      >
        +30 连击奖励!
      </motion.div>
    );
  };

  // 渲染连击提示
  const renderCombo = () => {
    if (combo < 2 || !isPlaying) return null;
    
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md"
      >
        {combo}连击!
      </motion.div>
    );
  };

  // 主要渲染
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden">
      {/* 头部信息 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isPlaying ? (
            <div className="flex items-center justify-center gap-2">
              <span>情绪值:</span>
              <div className="w-40 h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-500"
                  style={{ width: `${stressLevel}%` }}
                ></div>
              </div>
              <span className="ml-2">{stressLevel}%</span>
            </div>
          ) : "出气包"}
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>
      
      {/* 游戏控制 */}
      <div className="mb-6 flex justify-center">
        {!isPlaying ? (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md flex items-center gap-2"
          >
            <FaSmile className="text-yellow-300" />
            <span>开始互动</span>
          </button>
        ) : (
          <button
            onClick={restartGame}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
          >
            重新开始
          </button>
        )}
      </div>
      
      {/* 模式选择 */}
      {isPlaying && renderModesSelection()}
      
      {/* 游戏区域 */}
      <div 
        ref={gameAreaRef}
        className="relative bg-gray-100 rounded-lg min-h-[300px] md:min-h-[400px] w-full overflow-hidden"
        style={{ touchAction: 'none' }}
      >
        {/* 游戏物品 */}
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={`item-${item.id}`}
              style={getItemStyle(item)}
              onClick={() => !item.isBroken && handleItemClick(item)}
              whileHover={!item.isBroken ? { scale: 1.1 } : {}}
              initial={!item.isBroken ? { scale: 0 } : {}}
              animate={!item.isBroken ? (isClient ? { 
                scale: 1,
                y: [item.y, item.y - 10, item.y], // 轻微的上下浮动动画
                transition: {
                  y: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }
              } : { scale: 1 }) : {}}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              {renderBrokenEffect(item)}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* 连击提示 */}
        <AnimatePresence>
          {renderCombo()}
        </AnimatePresence>
        
        {/* 奖励动画 */}
        <AnimatePresence>
          {renderBonus()}
        </AnimatePresence>
        
        {/* 开始提示 */}
        {isPlaying && items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">物品即将出现，准备好互动吧！</p>
          </div>
        )}
      </div>
      
      {/* 分数显示 */}
      {isPlaying && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold">快乐指数: {score}</p>
        </div>
      )}
      
      {/* 礼花效果 */}
      {renderConfetti()}
    </div>
  );
} 