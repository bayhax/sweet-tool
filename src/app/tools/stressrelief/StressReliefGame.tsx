'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSmile } from 'react-icons/fa';

// 定义游戏中的物品类型
interface Item {
  id: string;
  type: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  isBroken: boolean;
  brokenTime: number;
  color: string;
}

// 关卡设置
interface Level {
  id: number;
  name: string;
  target: number; // 目标分数
  itemCount: number; // 每次显示物品数量
  spawnSpeed: number; // 生成速度 (ms)
  balloonColors: string[]; // 气球可用颜色
  pointsPerClick: number; // 每次点击获得的分数
}

// 定义常量
const ITEM_DISAPPEAR_DELAY = 1500; // 物品消失延迟，单位ms

// 定义关卡
const LEVELS: Level[] = [
  { 
    id: 1, 
    name: "甜蜜初体验", 
    target: 50, 
    itemCount: 5, 
    spawnSpeed: 1200, 
    balloonColors: ['#ffadd1', '#78c2ff', '#ffd280'], 
    pointsPerClick: 5
  },
  { 
    id: 2, 
    name: "心动加速", 
    target: 100, 
    itemCount: 7, 
    spawnSpeed: 900, 
    balloonColors: ['#ff8ac0', '#62b6ff', '#ffc966', '#7cff94'], 
    pointsPerClick: 5
  },
  { 
    id: 3, 
    name: "浪漫气息", 
    target: 200, 
    itemCount: 8, 
    spawnSpeed: 700, 
    balloonColors: ['#ff6baa', '#4aa8ff', '#ffbb4d', '#62ff80', '#c880ff'], 
    pointsPerClick: 5
  },
  { 
    id: 4, 
    name: "幸福时光", 
    target: 300, 
    itemCount: 10, 
    spawnSpeed: 600, 
    balloonColors: ['#ff4d93', '#3399ff', '#ffad33', '#4dff6b', '#b366ff', '#ff6b6b'], 
    pointsPerClick: 10
  },
  { 
    id: 5, 
    name: "甜蜜王者", 
    target: 400, 
    itemCount: 12, 
    spawnSpeed: 500, 
    balloonColors: ['#ff3382', '#1a88ff', '#ff9f1a', '#33ff57', '#a64dff', '#ff5252', '#26c9ff'], 
    pointsPerClick: 10
  }
];

// 鼓励的语句 - 更甜蜜的版本
const encouragementMessages = [
  "这一刻，你的笑容比阳光还灿烂~",
  "你每次点击都让我心跳加速呢~",
  "和你一起玩游戏的时光真幸福~",
  "你的每一次点击都让我感到心动~",
  "你真是世界上最可爱的人！",
  "和你在一起的每一秒都很珍贵~",
  "你的笑容是这个世界上最美的风景~",
  "看着你开心的样子，我也变得好开心~",
  "你简直太厉害了，我好喜欢你哦~",
  "你知道吗？你玩游戏的样子特别迷人~"
];

const StressReliefGame: React.FC = () => {
  // 游戏状态
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState<string>('点击开始，赶走不开心的情绪！');
  const [isPlaying, setIsPlaying] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [combo, setCombo] = useState(0);  // 连击次数
  const [showBonus, setShowBonus] = useState(false);  // 显示奖励动画
  const [bonusPosition, setBonusPosition] = useState({x: 0, y: 0});  // 奖励动画位置
  const [lastClickTime, setLastClickTime] = useState(0);  // 上次点击时间
  const [isClient, setIsClient] = useState(false); // 客户端渲染标志
  
  // 连击UI相关状态
  const [showCombo, setShowCombo] = useState(false); // 显示连击提示
  const [comboPosition, setComboPosition] = useState({ x: 0, y: 0 }); // 连击提示位置
  const [comboText, setComboText] = useState(''); // 连击提示文本
  
  // 关卡相关状态
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [levelComplete, setLevelComplete] = useState(false);
  
  // 引用
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const generationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined); // 添加连击超时引用
  
  // 检测是否客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 预加载音频
  useEffect(() => {
    if (!isClient) return;
    
    // 客户端渲染时，初始化AudioContext
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext as typeof AudioContext;
      if (AudioContextClass) {
        console.log("AudioContext支持检测成功");
      } else {
        console.warn("当前环境不支持AudioContext，音效将不可用");
      }
    } catch (err) {
      console.error("检测AudioContext失败:", err);
    }
  }, [isClient]);
  
  // 播放音效的函数
  const playSound = (soundType: string) => {
    if (!isClient) {
      console.log(`跳过播放音效 ${soundType}: 客户端未就绪`);
      return;
    }
    
    // 实现简单的内联音效
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // 根据不同类型设置不同的音效参数
      switch(soundType) {
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
        case 'levelup':
          // 关卡提升音效
          for(let i = 0; i < 3; i++) {
            setTimeout(() => {
              const tempOsc = audioContext.createOscillator();
              const tempGain = audioContext.createGain();
              tempOsc.type = 'sine';
              tempOsc.frequency.value = 300 + (i * 100);
              tempGain.gain.value = 0.1;
              tempGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
              tempOsc.connect(tempGain);
              tempGain.connect(audioContext.destination);
              tempOsc.start();
              tempOsc.stop(audioContext.currentTime + 0.2);
            }, i * 150);
          }
          break;
        default:
          console.warn(`未知的音效类型: ${soundType}`);
      }
      
      console.log(`播放内联音效: ${soundType}`);
    } catch(err) {
      console.error('无法播放内联音效:', err);
    }
  };
  
  // 创建单个新物品的辅助函数
  const generateNewItem = () => {
    if (!isPlaying || !gameAreaRef.current || levelComplete) return null;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    // 增加安全边距，确保气球完全在可视区域内
    const safeMargin = 80;
    const maxItemSize = 100; // 增加最大物品尺寸估计值，确保足够大
    
    // 计算安全区域的宽度和高度
    const safeWidth = Math.max(50, gameArea.width - safeMargin * 2 - maxItemSize);
    const safeHeight = Math.max(50, gameArea.height - safeMargin * 2 - maxItemSize);
    
    // 计算安全区域内的随机位置
    const x = safeMargin + Math.random() * safeWidth;
    const y = safeMargin + Math.random() * safeHeight;
    
    // 控制大小范围，减小最大缩放以避免过大物品
    const scale = 0.6 + Math.random() * 0.3; // 缩小最大比例
    
    // 随机选择当前关卡可用的气球颜色
    const colorIndex = Math.floor(Math.random() * currentLevel.balloonColors.length);
    const balloonColor = currentLevel.balloonColors[colorIndex];
    
    // 创建新物品，确保ID唯一
    const newItem: Item = {
      id: `balloon-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x,
      y,
      scale,
      type: 'balloon',
      isBroken: false,
      rotation: Math.random() * 360,
      brokenTime: 0,
      color: balloonColor
    };
    
    console.log(`生成新气球: 颜色=${balloonColor}, 位置=(${x.toFixed(0)}, ${y.toFixed(0)})`);
    
    return newItem;
  };
  
  // 生成物品
  const generateItems = () => {
    if (!isPlaying || !gameAreaRef.current || levelComplete) return;
    
    // 如果物品数量未达到关卡限制，生成新物品
    if (items.length < currentLevel.itemCount) {
      const newItem = generateNewItem();
      if (newItem) {
        setItems(prevItems => [...prevItems, newItem]);
      }
    }
    
    // 设置下一次生成的时间间隔
    const nextItemDelay = items.length < currentLevel.itemCount ? 
                          // 使用关卡指定的生成速度
                          currentLevel.spawnSpeed : 
                          // 在达到上限时，等待更长时间再次尝试
                          currentLevel.spawnSpeed * 2;
    
    // 清除之前的定时器，设置新的定时器
    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
    }
    generationTimerRef.current = setTimeout(generateItems, nextItemDelay);
  };
  
  // 自动生成物品的效果
  useEffect(() => {
    console.log(`游戏状态变更: ${isPlaying ? '进行中' : '停止'}`);
    
    // 清理定时器
    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
      generationTimerRef.current = null;
    }
    
    if (isPlaying && !levelComplete) {
      console.log(`启动物品生成，关卡: ${currentLevel.name}`);
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
  }, [isPlaying, levelComplete, currentLevel.name]);
  
  // 监听关卡变化
  useEffect(() => {
    if (isPlaying) {
      console.log(`当前关卡: ${currentLevel.name}, 目标分数: ${currentLevel.target}`);
    }
  }, [currentLevel, isPlaying, currentLevel.name, currentLevel.target]);
  
  // 检查关卡完成
  useEffect(() => {
    if (isPlaying && score >= currentLevel.target && !levelComplete) {
      // 关卡完成
      setLevelComplete(true);
      setMessage(`甜心，你太棒了！完成了${currentLevel.name}！`);
      setConfetti(true);
      playSound('applause');
      
      // 暂停物品生成
      if (generationTimerRef.current) {
        clearTimeout(generationTimerRef.current);
        generationTimerRef.current = null;
      }
      
      // 如果不是最后一个关卡，3秒后进入下一关
      if (currentLevel.id < LEVELS.length) {
        setTimeout(() => {
          const nextLevel = LEVELS[currentLevel.id];
          setCurrentLevel(nextLevel);
          setLevelComplete(false);
          setConfetti(false);
          setItems([]);
          setScore(0);
          setMessage(`准备体验${nextLevel.name}了哦！继续加油，宝贝！`);
          // 短暂延迟后开始生成物品
          setTimeout(() => {
            generateItems();
          }, 1000);
        }, 3000);
      } else {
        // 最后一关完成，游戏胜利
        setTimeout(() => {
          endGame(true);
        }, 3000);
      }
    }
  }, [score, currentLevel, isPlaying, levelComplete]);
  
  // 开始游戏
  const startGame = () => {
    setIsPlaying(true);
    setItems([]);
    setScore(0);
    setCurrentLevel(LEVELS[0]); // 重置为第一关
    setLevelComplete(false);
    setMessage(`开始${LEVELS[0].name}！目标分数: ${LEVELS[0].target}`);
  };
  
  // 结束游戏
  const endGame = (victory: boolean = false) => {
    setIsPlaying(false);
    
    if (victory) {
      setMessage('我的小甜心！你征服了所有关卡，你是我的甜蜜冠军！💖');
    } else {
      setMessage('游戏结束啦~下次再一起玩耍吧，等你哦！');
    }
    
    // 清理物品生成定时器
    if (generationTimerRef.current) {
      clearTimeout(generationTimerRef.current);
      generationTimerRef.current = null;
    }
    
    // 5秒后自动重置游戏状态，准备下一轮
    setTimeout(() => {
      setConfetti(false);
      setItems([]);
      setScore(0);
    }, 5000);
  };
  
  // 事件处理函数
  const handleItemClick = (item: Item) => {
    // 播放声音
    playSound('balloon');
    
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    let pointsEarned = currentLevel.pointsPerClick;
    let isComboClick = false;
    
    // 检查是否触发连击（0.8秒内）
    if (timeDiff < 800 && combo >= 0) {
      setCombo(prev => prev + 1);
      if (combo >= 2) {
        pointsEarned = currentLevel.pointsPerClick * 2;
        setShowBonus(true);
        setBonusPosition({ x: item.x, y: item.y });
        setTimeout(() => setShowBonus(false), 800);
      }
      isComboClick = true;
    } else {
      setCombo(0);
    }
    
    // 更新最后点击时间
    setLastClickTime(now);
    
    // 更新分数
    setScore(prev => {
      const newScore = prev + pointsEarned;
      // 检查是否达成关卡目标
      if (!levelComplete && newScore >= currentLevel.target) {
        handleLevelComplete();
      }
      return newScore;
    });
    
    // 显示连击提示
    if (isComboClick && combo >= 2) {
      setShowCombo(true);
      setComboPosition({ x: item.x, y: item.y - 30 });
      setComboText(`${combo} 连击!`);
      
      clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = setTimeout(() => {
        setShowCombo(false);
        setCombo(0);
      }, 1000);
    }
    
    // 标记物品为已破坏
    setItems(prevItems => 
      prevItems.map(i => 
        i.id === item.id 
          ? { ...i, isBroken: true } 
          : i
      )
    );
    
    // 移除物品
    setTimeout(() => {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
    }, ITEM_DISAPPEAR_DELAY);
  };
  
  // 处理关卡完成
  const handleLevelComplete = () => {
    // 播放音效
    playSound('levelup');
    
    // 设置关卡完成状态
    setLevelComplete(true);
    
    // 提示信息
    setMessage(encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]);
    
    // 如果不是最后一关，则设置下一关
    if (currentLevel.id < LEVELS.length) {
      setTimeout(() => {
        // 进入下一关
        setCurrentLevel(LEVELS[currentLevel.id]);
        setLevelComplete(false);
        // 重置游戏物品
        setItems([]);
        // 重置分数为0
        setScore(0);
        // 设置新的提示消息
        setMessage(`亲爱的，${LEVELS[currentLevel.id].name}等着你来体验啦！一起继续甜蜜旅程吧~`);
      }, 3000);
    } else {
      // 最后一关通关
      playSound('applause');
      setMessage("哇！你太棒了！和你一起玩游戏的时光真是甜蜜又幸福~");
    }
  };
  
  // 重新开始游戏
  const restartGame = () => {
    setItems(prevItems => prevItems.map(item => ({ ...item, isBroken: true })));
    setTimeout(() => {
      setItems([]);
      startGame();
    }, 500);
  };
  
  // 获取物品样式
  const getItemStyle = (item: Item) => {
    // 只处理气球类型
    return {
      width: `${50 * item.scale}px`,
      height: `${70 * item.scale}px`,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      background: !item.isBroken ? 
        `radial-gradient(circle at 30% 30%, ${item.color}, ${adjustColor(item.color, -30)})` : 
        'transparent',
      position: 'absolute' as const,
      left: `${item.x}px`,
      top: `${item.y}px`,
      transform: `rotate(${item.rotation}deg)`,
      cursor: 'pointer',
      boxShadow: !item.isBroken ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
    };
  };
  
  // 辅助函数：调整颜色亮度
  const adjustColor = (color: string, amount: number): string => {
    // 简单的颜色调整函数，将会使颜色更暗或更亮
    try {
      if (color.startsWith('#')) {
        // 十六进制颜色
        const hex = color.substring(1);
        const num = parseInt(hex, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = Math.min(Math.max(0, r), 255);
        g = Math.min(Math.max(0, g), 255);
        b = Math.min(Math.max(0, b), 255);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
      }
      return color;
    } catch (e) {
      console.error('调整颜色时出错:', e);
      return color;
    }
  };

  // 渲染破裂效果
  const renderBrokenEffect = (item: Item) => {
    if (!item.isBroken || !isClient) return null;
    
    // 只渲染气球爆炸效果
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
              background: i % 2 === 0 ? item.color : adjustColor(item.color, -30),
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
            background: `rgba(${hexToRgb(item.color)}, 0.2)`,
            left: 0,
            top: 0
          }}
        />
      </div>
    );
  };
  
  // 辅助函数：十六进制颜色转RGB
  const hexToRgb = (hex: string): string => {
    try {
      // 移除#前缀如果存在
      hex = hex.replace('#', '');
      
      // 解析十六进制颜色
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `${r}, ${g}, ${b}`;
    } catch (e) {
      console.error('转换颜色时出错:', e);
      return '255, 159, 243'; // 返回默认粉色
    }
  };

  // 渲染关卡信息
  const renderLevelInfo = () => {
    return (
      <div className="mb-4 flex items-center justify-center gap-4">
        <div className="bg-gray-100 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="font-bold">关卡:</span>
          <span className="text-pink-600">{currentLevel.name}</span>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="font-bold">目标:</span>
          <span className="text-pink-600">{currentLevel.target}</span>
        </div>
      </div>
    );
  };

  // 奖励动画
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
        +{currentLevel.pointsPerClick * 2} 连击奖励!
      </motion.div>
    );
  };

  // 渲染连击提示
  const renderCombo = () => {
    if (!showCombo) return null;
    
    return (
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'absolute',
          left: `${comboPosition.x}px`,
          top: `${comboPosition.y}px`,
          color: '#ff4081',
          fontWeight: 'bold',
          zIndex: 100,
          textShadow: '0 0 3px rgba(255,255,255,0.8)'
        }}
      >
        {comboText}
      </motion.div>
    );
  };

  // 渲染礼花效果
  const renderConfetti = () => {
    if (!confetti || !isClient) return null;
    
    // 创建简单的礼花效果
    const confettiElements = [];
    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 10 + 5;
      confettiElements.push(
        <div
          key={`confetti-${i}`}
          style={{
            position: 'absolute',
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            transform: `scale(${Math.random() + 0.5})`,
            opacity: Math.random(),
            animation: `fall-${i} ${Math.random() * 2 + 1}s linear forwards`
          }}
        />
      );
    }
    
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {confettiElements}
      </div>
    );
  };

  // 渲染游戏物品
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 overflow-hidden">
      {/* 头部信息 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">甜蜜时刻 - 气球奇缘</h2>
        <p className="text-gray-600 min-h-[24px]">{message}</p>
      </div>
      
      {/* 游戏控制 */}
      <div className="mb-6 flex justify-center">
        {!isPlaying ? (
          <button
            onClick={startGame}
            className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-md flex items-center gap-2"
          >
            <FaSmile className="text-yellow-300" />
            <span>开始游戏</span>
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
      
      {/* 关卡信息 */}
      {isPlaying && renderLevelInfo()}
      
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
              initial={{ scale: 0, opacity: 0 }}
              animate={!item.isBroken ? {
                scale: 1,
                opacity: 1,
                y: [item.y, item.y - 8, item.y], // 轻微的上下浮动动画
                transition: {
                  y: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }
                }
              } : {
                scale: 0.9,
                opacity: 0.5
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                damping: 12,
                stiffness: 100 
              }}
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
        {isPlaying && items.length === 0 && !levelComplete && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-500 bg-white/80 px-4 py-2 rounded-full shadow-sm"
            >
              气球即将出现，准备好互动吧！
            </motion.p>
          </div>
        )}
        
        {/* 关卡完成提示 */}
        {isPlaying && levelComplete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
            >
              <h3 className="text-2xl font-bold text-pink-600 mb-2">甜蜜成功，亲爱的！</h3>
              <p className="text-gray-700 mb-4">亲爱的，你太厉害了，完成了 {currentLevel.name}</p>
              {currentLevel.id < LEVELS.length ? (
                <p className="text-gray-500">即将开启更甜蜜的旅程...</p>
              ) : (
                <p className="text-gray-500">亲爱的，你征服了所有关卡，真棒！💖</p>
              )}
            </motion.div>
          </div>
        )}
      </div>
      
      {/* 分数显示 */}
      {isPlaying && (
        <div className="mt-4 text-center">
          <div className="inline-block px-6 py-2 bg-pink-100 rounded-full">
            <p className="text-xl font-bold">
              <span className="text-gray-700">分数: </span>
              <span className="text-pink-600">{score}</span>
              <span className="text-gray-400"> / {currentLevel.target}</span>
            </p>
          </div>
        </div>
      )}
      
      {/* 礼花效果 */}
      {renderConfetti()}
    </div>
  );
};

export default StressReliefGame; 