import React, { useState } from 'react';
import { Play, RotateCcw, Award, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Compass, HelpCircle, Volume2, VolumeX, ShieldAlert, CheckCircle2, Flame, RefreshCw, Zap } from 'lucide-react';
import { Level, GameStats, Vec3 } from '../types';
import { gameAudio } from './AudioEngine';

interface GameUIProps {
  currentLevel: Level;
  levels: Level[];
  gameState: 'start' | 'playing' | 'completed' | 'fallen';
  stats: GameStats;
  currentSpeed: number;
  currentPos: Vec3;
  sensitivity: number;
  onSetSensitivity: (val: number) => void;
  onSelectLevel: (lvl: Level) => void;
  onStartGame: () => void;
  onRestartLevel: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  // External inputs from D-pad
  externalControls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
  };
  setExternalControls: React.Dispatch<React.SetStateAction<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
  }>>;
}

export const GameUI: React.FC<GameUIProps> = ({
  currentLevel,
  levels,
  gameState,
  stats,
  currentSpeed,
  currentPos,
  sensitivity,
  onSetSensitivity,
  onSelectLevel,
  onStartGame,
  onRestartLevel,
  isMuted,
  onToggleMute,
  externalControls,
  setExternalControls,
}) => {
  const [showLevelList, setShowLevelList] = useState(false);
  const [showControlsGuide, setShowControlsGuide] = useState(true);

  // Helper for Difficulty badge styling
  const getDifficultyBadge = (difficulty: Level['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-605 border border-emerald-250 uppercase tracking-wider">ベーシック</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-250 uppercase tracking-wider">中級</span>;
      case 'Hard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-650 border border-amber-250 uppercase tracking-wider">上級</span>;
      case 'Expert':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-250 uppercase tracking-wider">極限</span>;
    }
  };

  // Star ranking based on completion speed
  const getStarsCount = (time: number, recommended: number) => {
    if (time <= recommended) return 3;
    if (time <= recommended * 1.5) return 2;
    return 1;
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-8 z-10 font-sans text-slate-800">
      
      {/* 1. TOP BAR HUD (Dashboard info in Geometric Balance) */}
      <div className="w-full flex justify-between items-start pointer-events-none gap-4 flex-wrap sm:flex-nowrap">
        {/* Left Side: Current Level Info */}
        {gameState === 'playing' && (
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-white shadow-xl shadow-sky-100/40 flex flex-col gap-2 max-w-sm pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-extrabold bg-blue-50/80 px-2 py-0.5 rounded-md border-slate-200">Stage {currentLevel.id}</span>
              {getDifficultyBadge(currentLevel.difficulty)}
            </div>
            <h1 className="text-xl font-serif italic font-extrabold tracking-tight text-slate-800">{currentLevel.name}</h1>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{currentLevel.description}</p>
          </div>
        )}

        {/* Center: Realtime Stats Indicators (Geometric Balance metric widgets) */}
        {gameState === 'playing' && (
          <div className="flex gap-6 bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-white shadow-xl shadow-sky-100/40 text-left items-center pointer-events-auto">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-extrabold mb-0.5">Speed</span>
              <span id="speedometer" className="text-2xl font-mono font-bold text-slate-800">
                {(currentSpeed * 8.5).toFixed(1)}<span className="text-xs font-semibold text-slate-400 ml-1">km/h</span>
              </span>
            </div>
            <div className="w-[1px] h-10 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-extrabold mb-0.5">Time</span>
              <span className="text-2xl font-mono font-bold text-slate-800">
                {stats.timeSpent.toFixed(1)}<span className="text-xs font-semibold text-slate-400 ml-1">s</span>
              </span>
            </div>
            <div className="w-[1px] h-10 bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-blue-600 font-extrabold mb-0.5">Falls</span>
              <span className="text-2xl font-mono font-bold text-slate-800">
                {stats.falls}
              </span>
            </div>
          </div>
        )}

        {/* Right Side: Options and Level Picker */}
        <div className="flex gap-2 items-center ml-auto pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="pointer-events-auto p-2.5 bg-white/90 hover:bg-slate-50 backdrop-blur-md rounded-xl border border-white text-slate-600 hover:text-slate-900 transition-all shadow-md shadow-sky-105/20 touch-manipulation"
            title={isMuted ? 'ミュート解除' : 'ミュート'}
            id="button-mute"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={() => setShowLevelList(!showLevelList)}
            className="pointer-events-auto py-2.5 px-4 bg-white/90 hover:bg-slate-50 backdrop-blur-md rounded-xl border border-white text-xs font-extrabold uppercase tracking-wider text-slate-700 hover:text-slate-905 flex items-center gap-1.5 transition-all shadow-md shadow-sky-105/20 touch-manipulation"
            id="button-select-level"
          >
            <Compass size={16} className="text-blue-600 animate-spin-slow" />
            ステージ選択
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC CENTER SYSTEM ALERTS (Start, Completed, Fallen overlays) */}
      <div className="flex-grow flex items-center justify-center pointer-events-none my-4">
        
        {/* START LEVEL CARD */}
        {gameState === 'start' && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white max-w-md w-full mx-4 shadow-2xl text-center flex flex-col items-center gap-4 sm:gap-5 scale-95 animate-fade-in animate-scale-up max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 border border-blue-150 rounded-2xl flex items-center justify-center text-blue-600 animate-pulse shrink-0">
              <Play size={24} className="fill-blue-600" />
            </div>
            <div>
              <span className="text-[10px] text-blue-650 font-black uppercase tracking-widest block mb-1">3D Roller - Stage {currentLevel.id}</span>
              <h2 className="text-xl sm:text-2xl font-serif italic font-extrabold tracking-tight text-slate-800 mt-1">{currentLevel.name}</h2>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3 leading-relaxed">
                雲の上に浮かぶ、超スリリングな一本橋！<br />
                落ちないようにボールを転がして、奥にある赤いゴールゾーンを目指しましょう。
              </p>
            </div>
 
            {/* Level Spec Stats */}
            <div className="w-full bg-slate-50/80 rounded-2xl p-3 sm:p-4 border border-slate-100 flex justify-around text-center mt-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5">推奨クリア時間</span>
                <span className="text-sm font-mono font-bold text-amber-650">{currentLevel.recommendedTime}秒</span>
              </div>
              <div className="w-[1px] bg-slate-200" />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold mb-0.5">難易度</span>
                <span className="text-sm font-bold text-blue-650">{currentLevel.difficulty}</span>
              </div>
            </div>
 
            <button
              onClick={onStartGame}
              className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:to-sky-400 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-blue-500/10 touch-manipulation"
              id="button-start-stage"
            >
              スタート！
            </button>
          </div>
        )}
 
        {/* FALLEN OVERLAY CARD */}
        {gameState === 'fallen' && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-red-150 max-w-sm w-full mx-4 shadow-2xl text-center flex flex-col items-center gap-4 sm:gap-5 max-h-[80vh] overflow-y-auto animate-fade-in">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center border border-red-150 animate-bounce shrink-0">
              <ShieldAlert size={26} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-serif italic font-extrabold text-rose-600 tracking-tight">落下してしまった！</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                雲の下にくずれ落ちました！チェックポイント、またはスタート地点から復活します。
              </p>
            </div>
            <button
              onClick={onStartGame}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
              id="button-respawn"
            >
              <RefreshCw size={14} className="animate-spin-slow" />
              チェックポイントから復帰
            </button>
          </div>
        )}
 
        {/* COMPLETED LEVEL CARD */}
        {gameState === 'completed' && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-emerald-150 max-w-md w-full mx-4 shadow-2xl text-center flex flex-col items-center gap-4 sm:gap-5 max-h-[80vh] overflow-y-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-110 shrink-0">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <span className="text-emerald-650 text-[10px] font-black uppercase tracking-widest block font-bold">STAGE COMPLETED</span>
              <h2 className="text-xl sm:text-2xl font-serif italic font-extrabold tracking-tight text-slate-800 mt-1">ステージクリア！</h2>
              <p className="text-xs text-slate-400 mt-1">{currentLevel.name}</p>
            </div>
 
            {/* Achievement Details */}
            <div className="w-full bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold">クリアタイム:</span>
                <span className="font-mono text-base sm:text-lg font-bold text-amber-600">{stats.timeSpent.toFixed(1)}秒</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-150 pt-2">
                <span className="text-slate-500 font-bold">落下回数:</span>
                <span className="font-mono font-bold text-slate-700">{stats.falls}回</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-150 pt-2">
                <span className="text-slate-500 font-bold">星ランク:</span>
                <span className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const stars = getStarsCount(stats.timeSpent, currentLevel.recommendedTime);
                    return (
                      <Award
                        key={idx}
                        size={18}
                        className={idx < stars ? 'text-yellow-500 fill-yellow-405' : 'text-slate-200'}
                      />
                    );
                  })}
                </span>
              </div>
            </div>
 
            {/* Stage completion text */}
            <div className="text-xs text-slate-500">
              {stats.timeSpent <= currentLevel.recommendedTime ? (
                <span className="text-emerald-600 font-bold flex items-center gap-1 justify-center"><Flame size={14} className="fill-emerald-100" />ゴールドスター獲得！凄まじいスピードです！</span>
              ) : (
                <span>推奨タイムは {currentLevel.recommendedTime}秒です。目指せゴールド！</span>
              )}
            </div>
 
            <div className="w-full flex gap-3">
              <button
                onClick={onRestartLevel}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] font-bold text-xs rounded-xl text-slate-600 hover:text-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                id="button-retry-completed"
              >
                <RotateCcw size={14} />
                再チャレンジ
              </button>
              {currentLevel.id < levels.length ? (
                <button
                  onClick={() => {
                    const nextL = levels.find((l) => l.id === currentLevel.id + 1);
                    if (nextL) onSelectLevel(nextL);
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-sky-500 hover:brightness-110 active:scale-[0.98] font-bold text-xs rounded-xl text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                  id="button-next-stage"
                >
                  次のステージ
                </button>
              ) : (
                <div className="flex-1 text-slate-400 text-xs font-semibold self-center">全ステージ攻略達成！</div>
              )}
            </div>
          </div>
        )}
      </div>

        {/* DRAGGABLE LEVEL SELECTOR OVERLAY */}
        {showLevelList && (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 max-w-xl w-full mx-4 shadow-2xl flex flex-col gap-5 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-serif italic font-extrabold text-slate-800">ステージリスト選択</h3>
              <button
                onClick={() => setShowLevelList(false)}
                className="text-slate-500 hover:text-slate-800 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer touch-manipulation"
              >
                閉じる
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {levels.map((lvl) => {
                const isSelected = lvl.id === currentLevel.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      onSelectLevel(lvl);
                      setShowLevelList(false);
                    }}
                    className={`p-4 rounded-2xl flex flex-col items-start text-left gap-2.5 transition-all border cursor-pointer touch-manipulation ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 text-slate-850 shadow-sm shadow-blue-100/50'
                        : 'bg-slate-50/80 hover:bg-slate-100 border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Stage {lvl.id}</span>
                      {getDifficultyBadge(lvl.difficulty)}
                    </div>
                    <h4 className="text-sm font-serif italic font-bold text-slate-800">{lvl.name}</h4>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">目標: {lvl.recommendedTime}秒以内</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      {/* 3. LOWER REGION: PERSISTENT CONTROLS & COMPACT MANUAL */}
      {gameState === 'playing' && (
        <div className="w-full flex justify-between items-end pointer-events-none gap-4">
          
          {/* Left corner: Live Coordinates overlay and Sensitivity options */}
          <div className="pointer-events-auto flex flex-col gap-2">
            {/* Coordinates HUD */}
            <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white font-mono text-[10px] text-slate-500 flex flex-col gap-1 shadow-md shadow-sky-100/10">
              <div>POS X: <span className="text-slate-800 font-bold ml-1">{currentPos.x.toFixed(2)}</span></div>
              <div>POS Y: <span className="text-slate-800 font-bold ml-1">{currentPos.y.toFixed(2)}</span></div>
              <div>POS Z: <span className="text-slate-800 font-bold ml-1">{currentPos.z.toFixed(2)}</span></div>
            </div>

            {/* sensitivity Slider / Guide Toggle */}
            <div className="flex gap-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white items-center shadow-md shadow-sky-100/10">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">操作感度:</span>
              <div className="flex gap-1">
                {[1.0, 1.4, 1.8].map((sVal, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSetSensitivity(sVal)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold cursor-pointer transition-all touch-manipulation ${
                      Math.abs(sensitivity - sVal) < 0.1
                        ? 'bg-blue-600 text-white font-extrabold shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sVal === 1.0 ? '普通' : sVal === 1.4 ? '軽快' : '速い'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Controls guide (Keyboard commands details) */}
          {showControlsGuide && (
            <div className="pointer-events-auto hidden md:flex flex-col bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white max-w-xs text-[11px] gap-2.5 shadow-xl shadow-sky-100/20">
              <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span className="font-serif italic font-extrabold flex items-center gap-1 text-slate-800"><HelpCircle size={14} className="text-blue-600" /> 操作ヘルプ</span>
                <button onClick={() => setShowControlsGuide(false)} className="text-slate-400 hover:text-slate-600 text-[10px]">閉じる</button>
              </div>
              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between items-center"><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-800 font-bold">W A S D</kbd> <span className="text-xs">方向転換 (カメラ基準)</span></div>
                <div className="flex justify-between items-center"><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-800 font-bold">矢印キー</kbd> <span className="text-xs">方向転換と同じ</span></div>
                <div className="flex justify-between items-center"><kbd className="px-6 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-800 font-bold">Space</kbd> <span className="text-xs">ジャンプ</span></div>
                <div className="flex justify-between items-center"><kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono text-slate-800 font-bold">ドラッグ</kbd> <span className="text-xs">カメラ角度変更</span></div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
