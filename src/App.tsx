import { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameUI } from './components/GameUI';
import { LEVELS } from './levels';
import { Level, GameStats, Vec3 } from './types';
import { gameAudio } from './components/AudioEngine';
import { Cloud, HelpCircle, LayoutGrid, RotateCcw, Volume2, Shield } from 'lucide-react';

export default function App() {
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS[0]);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'completed' | 'fallen'>('start');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    falls: 0,
    timeSpent: 0,
    starsGained: 0,
    levelCompleted: false,
    isGameOver: false,
  });
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentPos, setCurrentPos] = useState<Vec3>({ x: 0, y: 0, z: 0 });
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastCheckpointPos, setLastCheckpointPos] = useState<Vec3 | null>(null);

  // External controller inputs passed from UI D-pads
  const [externalControls, setExternalControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  // Track the high-precision play timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        timeSpent: prev.timeSpent + 0.1,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  // Handle player falling off
  const handleFall = () => {
    handleMuteStateUpdate();
    setStats((prev) => ({
      ...prev,
      falls: prev.falls + 1,
    }));
    setGameState('fallen');
  };

  // Handle reaching a mid-stage checkpoint
  const handleCheckpointReached = (checkpointIndex: number) => {
    // Collect all elements designated as checkpoints
    const checkpointPlats = currentLevel.platforms.filter((p) => p.type === 'checkpoint');
    if (checkpointPlats[checkpointIndex]) {
      const targetPlat = checkpointPlats[checkpointIndex];
      // Set respawn coordinates slightly elevated above top face of platform (Y + 0.5 + 0.2)
      setLastCheckpointPos({
        x: targetPlat.position.x,
        y: targetPlat.position.y + 1.2,
        z: targetPlat.position.z,
      });
    }
  };

  // Handle clearing the level goal
  const handleGoalReached = () => {
    setGameState('completed');
  };

  // Start/resume play action
  const handleStartGame = () => {
    handleMuteStateUpdate();
    setGameState('playing');
  };

  // Restart complete level from starting block
  const handleRestartLevel = () => {
    setLastCheckpointPos(null);
    setStats({
      score: 0,
      falls: 0,
      timeSpent: 0,
      starsGained: 0,
      levelCompleted: false,
      isGameOver: false,
    });
    setGameState('playing');
  };

  // Level selector trigger
  const handleSelectLevel = (lvl: Level) => {
    setCurrentLevel(lvl);
    setLastCheckpointPos(null);
    setStats({
      score: 0,
      falls: 0,
      timeSpent: 0,
      starsGained: 0,
      levelCompleted: false,
      isGameOver: false,
    });
    setGameState('start');
  };

  // Speedometer and positions updater
  const handleStatsUpdate = (speed: number, pos: Vec3) => {
    setCurrentSpeed(speed);
    setCurrentPos(pos);
  };

  // Sound muter options
  const handleMuteStateUpdate = () => {
    if (isMuted) {
      // If it should unmute, sync active audio context
      gameAudio.resumeContext();
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      gameAudio.stopRollingLoop();
    } else {
      gameAudio.resumeContext();
      if (gameState === 'playing') {
        gameAudio.startRollingLoop();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#bae6fd] to-[#f8fafc] flex flex-col justify-between items-center px-4 py-4 select-none text-slate-800 overflow-hidden">
      
      {/* HEADER RAIL - Elegant, clean, professional minimalist logo */}
      <header className="w-full max-w-7xl flex items-center justify-between border-b border-slate-200/55 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/90 border border-white flex items-center justify-center text-blue-650 shadow-sm">
            <Cloud size={18} className="text-blue-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block leading-none">PHYSICS 3D</span>
            <span className="text-sm font-serif italic font-extrabold text-slate-800 tracking-tight">雲の上の玉転がし</span>
          </div>
        </div>

        {/* Level shortcuts for navigation */}
        <div className="hidden sm:flex gap-1.5">
          {LEVELS.map((lvl) => {
            const isLvlSelected = lvl.id === currentLevel.id;
            return (
              <button
                key={lvl.id}
                onClick={() => handleSelectLevel(lvl)}
                className={`px-3.5 py-1 text-xs rounded-xl font-bold cursor-pointer transition-all ${
                  isLvlSelected
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
                    : 'bg-white/80 border border-slate-100 hover:bg-white text-slate-600 hover:text-slate-800'
                }`}
              >
                St.{lvl.id} {lvl.difficulty === 'Expert' ? '★' : ''}
              </button>
            );
          })}
        </div>
      </header>

      {/* CORE 3D INTERFACE PLAY STAGE (Generates real viewport 3D) */}
      <main className="w-full max-w-7xl flex-grow h-[80vh] min-h-[500px] relative rounded-3xl bg-slate-100 border border-white/60 shadow-2xl shadow-sky-100/20 overflow-hidden mb-2">
        
        {/* Core Canvas Element for Three.JS */}
        <GameCanvas
          currentLevel={currentLevel}
          gameState={gameState}
          onFall={handleFall}
          onGoalReached={handleGoalReached}
          onStatsUpdate={handleStatsUpdate}
          onCheckpointReached={handleCheckpointReached}
          lastCheckpointPos={lastCheckpointPos}
          sensitivity={sensitivity}
          externalControls={externalControls}
        />

        {/* Hud UI Layer */}
        <GameUI
          currentLevel={currentLevel}
          levels={LEVELS}
          gameState={gameState}
          stats={stats}
          currentSpeed={currentSpeed}
          currentPos={currentPos}
          sensitivity={sensitivity}
          onSetSensitivity={setSensitivity}
          onSelectLevel={handleSelectLevel}
          onStartGame={handleStartGame}
          onRestartLevel={handleRestartLevel}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          externalControls={externalControls}
          setExternalControls={setExternalControls}
        />

      </main>

      {/* FOOTER BAR */}
      <footer className="w-full max-w-7xl flex justify-between items-center text-[10px] text-slate-500 font-bold">
        <span>© 2026 雲の上の玉転がし3D | Web Audio API / Three.js 物理演算シミュレータ</span>
        <span className="flex items-center gap-1"><Shield size={10} className="text-emerald-600" /> 安全なサンドボックス環境</span>
      </footer>

    </div>
  );
}
