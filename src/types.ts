export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type PlatformType =
  | 'normal'     // Standard solid path
  | 'slippery'   // Ice-like, extremely low friction
  | 'bouncy'     // Elastic floor (boosts Y velocity on landing)
  | 'booster'    // Speed pad (boosts forward velocity)
  | 'checkpoint' // Mid-stage checkpoints
  | 'goal';      // Stage Goal area

export interface Platform {
  id: string;
  type: PlatformType;
  position: Vec3; // Center position
  size: Vec3;     // Width (X), Height (Y), Length (Z)
  color?: string; // Custom color overrides
  label?: string; // Label display or instruction hint
  movement?: {
    axis: 'x' | 'y' | 'z';
    range: number;
    speed: number;
    phase?: number;
  };
}

export interface MovingObstacle {
  id: string;
  type: 'slider' | 'swing' | 'wind_blower';
  position: Vec3;     // Reference/Initial position
  size: Vec3;         // Dimensions
  color?: string;
  // Movement details
  direction: Vec3;    // Axis of oscillation/movement
  range: number;      // How far it moves
  speed: number;      // Speed multiplier
  phase: number;      // Custom starting offset (for staggering)
  // Current local computed stats
  currentPos?: Vec3;
  windForce?: Vec3;   // For wind blowers
}

export interface Checkpoint {
  id: string;
  position: Vec3;
  reached: boolean;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  startPos: Vec3;
  platforms: Platform[];
  obstacles: MovingObstacle[];
  gravity: number; // custom gravity multiplier
  recommendedTime: number; // Seconds for star/gold rank
}

export interface GameStats {
  score: number;
  falls: number;
  timeSpent: number;
  starsGained: number;
  levelCompleted: boolean;
  isGameOver: boolean;
}
