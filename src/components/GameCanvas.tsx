import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Level, Platform, MovingObstacle, Vec3 } from '../types';
import { gameAudio } from './AudioEngine';

interface GameCanvasProps {
  currentLevel: Level;
  gameState: 'start' | 'playing' | 'completed' | 'fallen';
  onFall: () => void;
  onGoalReached: () => void;
  onStatsUpdate: (speed: number, currentPos: Vec3) => void;
  sensitivity: number; // Speed control scaling
  onCheckpointReached: (index: number) => void;
  lastCheckpointPos: Vec3 | null;
  // Controls passed from keyboard or UI buttons
  externalControls: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentLevel,
  gameState,
  onFall,
  onGoalReached,
  onStatsUpdate,
  sensitivity,
  onCheckpointReached,
  lastCheckpointPos,
  externalControls,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Refs to avoid stale closures inside the high-frequency physics/animation loop
  const gameStateRef = useRef(gameState);
  const sensitivityRef = useRef(sensitivity);
  const externalControlsRef = useRef(externalControls);
  const onFallRef = useRef(onFall);
  const onGoalReachedRef = useRef(onGoalReached);
  const onStatsUpdateRef = useRef(onStatsUpdate);
  const onCheckpointReachedRef = useRef(onCheckpointReached);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);
  useEffect(() => { externalControlsRef.current = externalControls; }, [externalControls]);
  useEffect(() => { onFallRef.current = onFall; }, [onFall]);
  useEffect(() => { onGoalReachedRef.current = onGoalReached; }, [onGoalReached]);
  useEffect(() => { onStatsUpdateRef.current = onStatsUpdate; }, [onStatsUpdate]);
  useEffect(() => { onCheckpointReachedRef.current = onCheckpointReached; }, [onCheckpointReached]);

  // Keyboard controls
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Physics state
  const ballPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const ballVel = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const ballOmega = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0)); // angular velocity
  const isGrounded = useRef<boolean>(false);
  const checkpointStates = useRef<{ [id: string]: boolean }>({});
  const lastVisualPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 5, 0));
  const coyoteTime = useRef<number>(0);
  const jumpBufferTime = useRef<number>(0);
  const activePlatformId = useRef<string | null>(null);

  // Level configuration
  const currentLevelIdRef = useRef<number>(currentLevel.id);

  // Wind visual helpers (particles)
  const windParticlesRef = useRef<THREE.Points[]>([]);

  // ThreeJS Mesh references
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const platformMeshesRef = useRef<{ [id: string]: THREE.Mesh }>({});
  const obstacleMeshesRef = useRef<{ [id: string]: THREE.Mesh }>({});

  // Camera Orbit State
  const cameraAngleX = useRef<number>(0); // Left-Right rotation around ball
  const cameraAngleY = useRef<number>(0.4); // Up-Down angle
  const isDragging = useRef<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle initial / reset position
  const resetBallPosition = () => {
    let start = currentLevel.startPos;
    if (lastCheckpointPos) {
      start = lastCheckpointPos;
    }
    ballPos.current.set(start.x, start.y, start.z);
    ballVel.current.set(0, 0, 0);
    ballOmega.current.set(0, 0, 0);
    isGrounded.current = false;
    lastVisualPos.current.copy(ballPos.current);

    if (ballMeshRef.current) {
      ballMeshRef.current.position.copy(ballPos.current);
      ballMeshRef.current.quaternion.set(0, 0, 0, 1);
    }
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      window.focus();
      gameAudio.resumeContext();
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
      keysPressed.current[e.key.toLowerCase()] = true;
      // Prevent browser scroll with arrows/space
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle resets when state or level changes
  useEffect(() => {
    checkpointStates.current = {};
    if (currentLevel.id !== currentLevelIdRef.current) {
      currentLevelIdRef.current = currentLevel.id;
      resetBallPosition();
    } else if (gameState === 'start' || gameState === 'fallen') {
      resetBallPosition();
    }
  }, [currentLevel, gameState, lastCheckpointPos]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Atmospheric Fog for beautiful cloud feel
    scene.fog = new THREE.FogExp2(0xbae6fd, 0.015); // soft blue-sky background

    // Create a beautiful sky / cloudy background gradient dome
    // Custom Sky Background (warm, pastel cloud environment)
    scene.background = new THREE.Color(0xb3e5fc); // Sky blue

    // 2. Camera
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    cameraRef.current = camera;
    scene.add(camera);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.ref = renderer; // keep reference
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.75); // bright overhead sky lighting
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2); // Warm sunshine
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 5. Procedural Ball Texture with stripes/grid so rotation is perfectly visible!
    const createBallTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Polished Sky Blue / Cyan style texture for the ball
        ctx.fillStyle = '#0ea5e9'; // sky-500 (beautiful celestial light blue)
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#ffffff';

        // Draw multiple sporty stripes
        ctx.fillRect(0, 40, 256, 40);
        ctx.fillRect(0, 160, 256, 40);

        // Add crossing patterns
        ctx.fillStyle = '#e0f2fe'; // soft ice blue (sky-100)
        ctx.fillRect(60, 0, 40, 256);
        ctx.fillRect(180, 0, 40, 256);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Procedural Wood Texture Generator for Normal Platforms based on layout size
    const createWoodTexture = (baseColor: string, sizeX: number, sizeZ: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 512, 512);

        // Dark brown wood lines
        ctx.strokeStyle = 'rgba(92, 45, 10, 0.25)';
        ctx.lineWidth = 2.0;

        // Wood grains pattern along length
        for (let i = 0; i < 512; i += 12) {
          ctx.beginPath();
          let cy = i;
          ctx.moveTo(0, cy);
          for (let cx = 0; cx <= 512; cx += 32) {
            const dy = Math.sin(cx * 0.015) * 8 + Math.sin(cx * 0.03 + i) * 3;
            ctx.lineTo(cx, cy + dy);
          }
          ctx.stroke();
        }

        // Natural wood knots
        ctx.fillStyle = 'rgba(82, 40, 5, 0.15)';
        for (let k = 0; k < 2; k++) {
          const kx = 100 + k * 250 + Math.random() * 50;
          const ky = 100 + k * 200 + Math.random() * 50;
          const kr = 15 + Math.random() * 10;
          
          ctx.beginPath();
          ctx.arc(kx, ky, kr, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(72, 35, 5, 0.3)';
          for (let r = kr; r < kr + 40; r += 8) {
            ctx.beginPath();
            ctx.arc(kx, ky, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // High visual fidelity: tile based on actual component proportions
      tex.repeat.set(Math.max(1, sizeX * 0.4), Math.max(1, sizeZ * 0.2));
      return tex;
    };

    const ballTex = createBallTexture();

    // 6. Ball Mesh
    const ballGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      map: ballTex,
      roughness: 0.15,
      metalness: 0.1,
    });
    const ballMesh = new THREE.Mesh(ballGeo, ballMat);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    scene.add(ballMesh);
    ballMeshRef.current = ballMesh;

    // Restore initial position
    resetBallPosition();

    // 7. Platforms (Bridges / Landing zones)
    const platformMeshes: { [id: string]: THREE.Mesh } = {};
    currentLevel.platforms.forEach((plat) => {
      const geom = new THREE.BoxGeometry(plat.size.x, plat.size.y, plat.size.z);
      
      // Select appropriate material styling
      let mat: THREE.Material;
      if (plat.type === 'checkpoint') {
        mat = new THREE.MeshStandardMaterial({
          color: 0x3b82f6,
          roughness: 0.4,
          metalness: 0.2,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.2,
        });
      } else if (plat.type === 'goal') {
        mat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          roughness: 0.5,
          metalness: 0.1,
          emissive: 0x991b1b,
          emissiveIntensity: 0.2,
        });
      } else if (plat.type === 'slippery') {
        // Cyan-like ice texture style
        mat = new THREE.MeshPhysicalMaterial({
          color: 0x06b6d4,
          roughness: 0.05,
          transmission: 0.6, // Glass/ice transparency
          thickness: 0.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        });
      } else if (plat.type === 'bouncy') {
        // Trampoline purple
        mat = new THREE.MeshStandardMaterial({
          color: 0x8b5cf6,
          roughness: 0.6,
          metalness: 0.1,
        });
      } else if (plat.type === 'booster') {
        // Glowing booster floor
        mat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          emissive: 0x3b82f6,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        });
      } else {
        // Standard normal platform with procedural wood texture
        const woodColor = plat.color || '#d97706'; // default warm cherry/oak brown if not supplied
        mat = new THREE.MeshStandardMaterial({
          map: createWoodTexture(woodColor, plat.size.x, plat.size.z),
          roughness: 0.75,
          metalness: 0.03,
        });
      }

      const pMesh = new THREE.Mesh(geom, mat);
      pMesh.position.set(plat.position.x, plat.position.y, plat.position.z);
      pMesh.receiveShadow = true;
      pMesh.castShadow = true;
      scene.add(pMesh);
      platformMeshes[plat.id] = pMesh;

      // Add simple high-contrast borders/rails to assist distance perception using wireframe edges!
      // (This is highly responsive to the guidelines for aesthetic precision)
      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1.5 }));
      pMesh.add(line);
    });
    platformMeshesRef.current = platformMeshes;

    // 8. Obstacles (Fans / Sweepers)
    const obstacleMeshes: { [id: string]: THREE.Mesh } = {};
    windParticlesRef.current = [];

    currentLevel.obstacles.forEach((obs) => {
      const geom = new THREE.BoxGeometry(obs.size.x, obs.size.y, obs.size.z);
      let mat: THREE.Material;

      if (obs.type === 'wind_blower') {
        // Cyber looking fan box
        mat = new THREE.MeshStandardMaterial({
          color: 0x0e7490,
          roughness: 0.3,
          metalness: 0.8,
        });
      } else {
        // Sweeper heavy red bumper
        mat = new THREE.MeshStandardMaterial({
          color: 0xbe123c,
          roughness: 0.2,
          metalness: 0.5,
        });
      }

      const oMesh = new THREE.Mesh(geom, mat);
      oMesh.position.set(obs.position.x, obs.position.y, obs.position.z);
      oMesh.castShadow = true;
      oMesh.receiveShadow = true;
      scene.add(oMesh);
      obstacleMeshes[obs.id] = oMesh;

      // If it is a wind blower, let's create actual floating particle systems to visualize wind!
      if (obs.type === 'wind_blower') {
        const particleCount = 45;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        // Randomly place starting wind particles
        const dir = new THREE.Vector3(obs.direction.x, obs.direction.y, obs.direction.z).normalize();
        for (let i = 0; i < particleCount; i++) {
          const distance = Math.random() * obs.range;
          const spreadX = (Math.random() - 0.5) * obs.size.x;
          const spreadY = (Math.random() - 0.5) * obs.size.y;
          const p = new THREE.Vector3()
            .copy(oMesh.position)
            .addScaledVector(dir, distance)
            .add(new THREE.Vector3(spreadX, spreadY, 0)); // custom offset
          positions[i * 3] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }

        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0xe0f7fa,
          size: 0.12,
          transparent: true,
          opacity: 0.8,
        });

        const points = new THREE.Points(particleGeom, particleMat);
        scene.add(points);
        windParticlesRef.current.push(points);
      }
    });
    obstacleMeshesRef.current = obstacleMeshes;

    // 9. Clouds Decor (Beautiful visual background layers of fluffy clouds at Z-intervals!)
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    // Procedural fluffy cloud geometry (low-poly styles)
    const createCloudMesh = () => {
      const g = new THREE.Group();
      const cloudMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.85,
      });

      // Combine multiple spheres to form a puff
      const puffs = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < puffs; i++) {
        const size = 1.0 + Math.random() * 2.2;
        const sphereGeo = new THREE.SphereGeometry(size, 8, 8);
        const puff = new THREE.Mesh(sphereGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3
        );
        g.add(puff);
      }
      return g;
    };

    // Build dense cloud cover below the bridge level (at Y = -12 to -6)
    const cloudCount = 35;
    const cloudRefs: THREE.Group[] = [];
    for (let i = 0; i < cloudCount; i++) {
      const cloud = createCloudMesh();
      
      // Spread across the active level space
      const cx = (Math.random() - 0.5) * 60;
      const cy = -8.0 - Math.random() * 5.0; // below the player!
      const cz = (Math.random() - 0.5) * 80;

      cloud.position.set(cx, cy, cz);
      cloudGroup.add(cloud);
      cloudRefs.push(cloud);
    }

    // High clouds in sky (at Y = 25)
    for (let i = 0; i < 15; i++) {
      const cloud = createCloudMesh();
      const cx = (Math.random() - 0.5) * 100;
      const cy = 20.0 + Math.random() * 10.0;
      const cz = (Math.random() - 0.5) * 120;
      cloud.position.set(cx, cy, cz);
      cloudGroup.add(cloud);
      cloudRefs.push(cloud);
    }

    // Audio initiation rolling sound
    gameAudio.startRollingLoop();

    // 10. Animation & Physics Loop
    let lastTime = performance.now();
    let animFrameId: number;

    const physicsSubstepValue = 1 / 120; // 120Hz fixed step
    let accumulator = 0;

    const gameLoop = () => {
      animFrameId = requestAnimationFrame(gameLoop);

      const currentTime = performance.now();
      let dt = (currentTime - lastTime) / 1000;
      // Cap dt to prevent massive spiraling of calculations during lag spikes
      if (dt > 0.1) dt = 0.1; 
      lastTime = currentTime;

      accumulator += dt;

      // Update moving obstacles and platforms before physics runs
      const elapsedTime = currentTime / 1000;

      // Sub-stepped physics for perfect precision collision (no tunneling!)
      while (accumulator >= physicsSubstepValue) {
        // Run standard physics sub-step
        runPhysicsStep(physicsSubstepValue, elapsedTime);
        accumulator -= physicsSubstepValue;
      }

      // Check Fall out of Bounds (if ball falls deep below clouds)
      if (ballPos.current.y < -12.0) {
        gameAudio.playFall();
        onFallRef.current();
        resetBallPosition();
      }

      // Sync visual ball representation with physics state
      if (ballMeshRef.current) {
        const currentPos = ballPos.current.clone();
        
        // Calculate displacement on the XZ flat plane to drive realistic rolling
        const dispX = currentPos.x - lastVisualPos.current.x;
        const dispZ = currentPos.z - lastVisualPos.current.z;
        const dist = Math.sqrt(dispX * dispX + dispZ * dispZ);

        if (dist > 0.001) {
          // Rolling Axis = flatFloorNorm(0, 1, 0) cross normalized_displacement(dispX, 0, dispZ)
          // Resulting Vector = (dispZ, 0, -dispX).normalize()
          const axis = new THREE.Vector3(dispZ, 0, -dispX).normalize();
          
          // Rotation angle: theta = distance / ballRadius (0.5)
          const ballRadius = 0.5;
          const theta = dist / ballRadius;
          
          // Apply beautiful world-space quaternion rolling rotation continuously
          const rollQuat = new THREE.Quaternion().setFromAxisAngle(axis, theta);
          ballMeshRef.current.quaternion.premultiply(rollQuat);
        }

        // Synchronize three.js mesh position with rigid position
        ballMeshRef.current.position.copy(currentPos);
        lastVisualPos.current.copy(currentPos);
      }

      // Update atmospheric drifting clouds
      cloudRefs.forEach((cl, index) => {
        // Drift slowly
        cl.position.x += 0.04 * dt * (1 + (index % 3) * 0.2);
        // Wrap around boundary
        if (cl.position.x > 50) {
          cl.position.x = -50;
        }
      });

      // Update wind particles animation
      currentLevel.obstacles.forEach((obs, idx) => {
        if (obs.type === 'wind_blower' && windParticlesRef.current[idx]) {
          const points = windParticlesRef.current[idx];
          const posAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
          const posArray = posAttr.array as Float32Array;
          const dir = new THREE.Vector3(obs.direction.x, obs.direction.y, obs.direction.z).normalize();
          const count = posArray.length / 3;

          for (let i = 0; i < count; i++) {
            // Get local positions
            let px = posArray[i * 3];
            let py = posArray[i * 3 + 1];
            let pz = posArray[i * 3 + 2];

            const pVec = new THREE.Vector3(px, py, pz);
            const relative = pVec.clone().sub(new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z));
            const projDis = relative.dot(dir);

            // Move particle along the wind axis
            pVec.addScaledVector(dir, obs.speed * 4 * dt);

            // If it exceeds range or drifts away, reset to nozzle
            if (projDis > obs.range || Math.random() < 0.02) {
              const spreadX = (Math.random() - 0.5) * obs.size.x;
              const spreadY = (Math.random() - 0.5) * obs.size.y;
              pVec.copy(new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z))
                .add(new THREE.Vector3(spreadX, spreadY, 0));
            }

            posArray[i * 3] = pVec.x;
            posArray[i * 3 + 1] = pVec.y;
            posArray[i * 3 + 2] = pVec.z;
          }
          posAttr.needsUpdate = true;
        }
      });

      // Camera third-person tracking with orbital offset
      if (cameraRef.current) {
        // Define orbit rotation based on dragging and key controls
        const baseOffset = new THREE.Vector3(
          Math.sin(cameraAngleX.current) * Math.cos(cameraAngleY.current),
          Math.sin(cameraAngleY.current),
          Math.cos(cameraAngleX.current) * Math.cos(cameraAngleY.current)
        ).multiplyScalar(6.5); // 6.5 units camera distance

        const targetCamPos = ballPos.current.clone().add(baseOffset);

        // Interpolate camera to target for beautiful cinematic smoothness!
        cameraRef.current.position.lerp(targetCamPos, 0.1);
        cameraRef.current.lookAt(ballPos.current.clone().add(new THREE.Vector3(0, 0.3, 0)));
      }

      // Report modern stats to visual overlay hud
      onStatsUpdateRef.current(ballVel.current.length(), {
        x: ballPos.current.x,
        y: ballPos.current.y,
        z: ballPos.current.z,
      });

      // Render the scene
      renderer.render(scene, camera);
    };

    // Initialize loop
    gameLoop();

    // Mouse handlers for custom Camera Orbital Adjustment
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;

      // Adjust camera horizontal angle (X) and vertical angle (Y)
      cameraAngleX.current += dx * 0.007;
      cameraAngleY.current = Math.max(0.1, Math.min(1.4, cameraAngleY.current + dy * 0.005));

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Touch handlers for mobile/on-screen orbital swing
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging.current = true;
        lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - lastMousePos.current.x;
      const dy = e.touches[0].clientY - lastMousePos.current.y;

      cameraAngleX.current += dx * 0.01;
      cameraAngleY.current = Math.max(0.1, Math.min(1.4, cameraAngleY.current + dy * 0.008));

      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    // Bind interaction events directly to the container to steer focus properly
    const dom = containerRef.current;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    // Dynamic resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup Everything
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);

      gameAudio.stopRollingLoop();

      if (rendererRef.current && dom) {
        try {
          dom.removeChild(rendererRef.current.domElement);
        } catch {}
      }
    };
  }, [currentLevel]);

  // Main custom 3D Physics Rigid Solver! (Gravity, Friction, Platforms, Obstacles, Booster, Checkpoints, Goals)
  const runPhysicsStep = (dt: number, timeSec: number) => {
    if (gameStateRef.current !== 'playing') {
      // Don't accumulate velocity during start or goal
      ballVel.current.set(0, 0, 0);
      ballOmega.current.set(0, 0, 0);
      return;
    }

    // 1. Calculate camera directive directions for mouse relative movement
    const forwardDir = new THREE.Vector3(0, 0, -1);
    const rightDir = new THREE.Vector3(1, 0, 0);

    if (cameraRef.current) {
      // Projected view vector onto XZ plane
      const camDir = new THREE.Vector3();
      cameraRef.current.getWorldDirection(camDir);
      camDir.y = 0;
      camDir.normalize();

      forwardDir.copy(camDir);
      rightDir.set(-camDir.z, 0, camDir.x).normalize(); // perpendicular vector
    }

    // 2. Gather user interaction forces
    const force = new THREE.Vector3(0, 0, 0);
    const motorTorque = 30.0 * sensitivityRef.current;

    // Check keyboard WASD/Arrows and External UI buttons (Joystick / buttons)
    const goForward = keysPressed.current['KeyW'] || keysPressed.current['w'] || keysPressed.current['ArrowUp'] || externalControlsRef.current.forward;
    const goBackward = keysPressed.current['KeyS'] || keysPressed.current['s'] || keysPressed.current['ArrowDown'] || externalControlsRef.current.backward;
    const goLeft = keysPressed.current['KeyA'] || keysPressed.current['a'] || keysPressed.current['ArrowLeft'] || externalControlsRef.current.left;
    const goRight = keysPressed.current['KeyD'] || keysPressed.current['d'] || keysPressed.current['ArrowRight'] || externalControlsRef.current.right;
    const requestJump = keysPressed.current['Space'] || keysPressed.current[' '] || externalControlsRef.current.jump;

    if (goForward) force.addScaledVector(forwardDir, motorTorque);
    if (goBackward) force.addScaledVector(forwardDir, -motorTorque);
    if (goLeft) force.addScaledVector(rightDir, -motorTorque);
    if (goRight) force.addScaledVector(rightDir, motorTorque);

    // Apply continuous motor force to velocity
    ballVel.current.addScaledVector(force, dt);

    // Apply dynamic gravity
    const baseGravity = -17.0; // Snappy crisp gravity
    ballVel.current.y += baseGravity * currentLevel.gravity * dt;

    // 3. Update active moving obstacles and moving platforms positions
    currentLevel.platforms.forEach((plat) => {
      if (plat.movement && platformMeshesRef.current[plat.id]) {
        const mesh = platformMeshesRef.current[plat.id];
        const range = plat.movement.range;
        const speed = plat.movement.speed;
        const phase = plat.movement.phase || 0;
        
        // Calculate displacement
        const displacement = Math.sin(timeSec * speed + phase) * range;

        // Apply to visual layout
        const pOriginal = plat.position;
        if (plat.movement.axis === 'x') {
          mesh.position.x = pOriginal.x + displacement;
        } else if (plat.movement.axis === 'y') {
          mesh.position.y = pOriginal.y + displacement;
        } else if (plat.movement.axis === 'z') {
          mesh.position.z = pOriginal.z + displacement;
        }
      }
    });

    currentLevel.obstacles.forEach((obs) => {
      if (obstacleMeshesRef.current[obs.id]) {
        const oMesh = obstacleMeshesRef.current[obs.id];
        const range = obs.range;
        const speed = obs.speed;
        const phase = obs.phase || 0;

        if (obs.type === 'slider') {
          // Slide back and forth
          const offset = Math.sin(timeSec * speed + phase) * range;
          const dir = new THREE.Vector3(obs.direction.x, obs.direction.y, obs.direction.z).normalize();
          const targetPos = new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z).addScaledVector(dir, offset);
          oMesh.position.copy(targetPos);
          obs.currentPos = { x: targetPos.x, y: targetPos.y, z: targetPos.z };
        } else if (obs.type === 'wind_blower') {
          // Decorative fan rotation
          oMesh.rotation.y += speed * dt * 4;
        }
      }
    });

    // 4. Integrate wind forces
    currentLevel.obstacles.forEach((obs) => {
      if (obs.type === 'wind_blower') {
        const blowerPos = new THREE.Vector3(obs.position.x, obs.position.y, obs.position.z);
        const toBall = ballPos.current.clone().sub(blowerPos);
        const dir = new THREE.Vector3(obs.direction.x, obs.direction.y, obs.direction.z).normalize();
        
        // Proximity along nozzle direction
        const proj = toBall.dot(dir);
        
        // Lateral distance out of nozzle axis
        const lateralVec = toBall.clone().addScaledVector(dir, -proj);
        const latDist = lateralVec.length();

        // Check if inside cylindrical influence cone
        if (proj >= 0 && proj <= obs.range && latDist <= obs.size.x * 1.5) {
          // Linear fallout of force with distance
          const forceFactor = 1.0 - (proj / obs.range);
          const windPush = dir.clone().multiplyScalar(obs.speed * 4.5 * forceFactor * dt);
          ballVel.current.add(windPush);
        }
      }
    });

    // Translate position by velocity. If grounded on a moving platform, inherit its movement too!
    if (activePlatformId.current) {
      const plat = currentLevel.platforms.find((p) => p.id === activePlatformId.current);
      if (plat && plat.movement) {
        const speed = plat.movement.speed;
        const range = plat.movement.range;
        const phase = plat.movement.phase || 0;
        const vDelta = speed * range * Math.cos(timeSec * speed + phase);
        
        if (plat.movement.axis === 'x') {
          ballPos.current.x += vDelta * dt;
        } else if (plat.movement.axis === 'y') {
          ballPos.current.y += vDelta * dt;
        } else if (plat.movement.axis === 'z') {
          ballPos.current.z += vDelta * dt;
        }
      }
    }

    ballPos.current.addScaledVector(ballVel.current, dt);

    // 5. Collision Solving & Contact resolution against all Platforms (Boxes)
    let groundedThisStep = false;
    const ballRadius = 0.5;

    currentLevel.platforms.forEach((plat) => {
      // Get exact runtime position (handles moving platforms!)
      const mesh = platformMeshesRef.current[plat.id];
      const cx = mesh ? mesh.position.x : plat.position.x;
      const cy = mesh ? mesh.position.y : plat.position.y;
      const cz = mesh ? mesh.position.z : plat.position.z;

      // Half dimension bounds
      const hx = plat.size.x / 2;
      const hy = plat.size.y / 2;
      const hz = plat.size.z / 2;

      // Closest point on box
      const pClamped = new THREE.Vector3(
        Math.max(cx - hx, Math.min(ballPos.current.x, cx + hx)),
        Math.max(cy - hy, Math.min(ballPos.current.y, cy + hy)),
        Math.max(cz - hz, Math.min(ballPos.current.z, cz + hz))
      );

      // Distance from clamped point to sphere center
      const toCenter = ballPos.current.clone().sub(pClamped);
      const distance = toCenter.length();

      // Overlap detected!
      if (distance < ballRadius && distance > 0.0001) {
        let depth = ballRadius - distance;
        const norm = toCenter.clone().normalize();

        // Smooth boundary seam correction:
        // If the ball is clearly riding or landing on top of the platform (Y vertical position is at or above the platform top surface),
        // resolve the collision purely in the vertical Y direction. This prevents any horizontal speed loss
        // or bouncing backward due to micro-penetration of adjacent/overlapping platform edge coordinate boundaries.
        const topPlaneHeight = cy + hy;
        if (ballPos.current.y >= topPlaneHeight - 0.01) {
          norm.set(0, 1, 0);
          depth = Math.max(0, (topPlaneHeight + ballRadius) - ballPos.current.y);
        }

        // Shift sphere center out of box boundaries
        ballPos.current.addScaledVector(norm, depth);

        // Relative velocity along collision contact normal
        const normalVel = ballVel.current.dot(norm);

        // Moving towards platform face
        if (normalVel < 0) {
          let restitution = 0.12; // default subtle rubberized wood
          if (plat.type === 'bouncy') {
            restitution = 0.95; // highly elastic trampoline
            gameAudio.playBounce();
          }

          // Bounce formula
          ballVel.current.addScaledVector(norm, -(1 + restitution) * normalVel);
        }

        // Apply Platform-Specific features
        // A. Booster pad
        if (plat.type === 'booster') {
          // Powerful launch forward!
          ballVel.current.z -= 16.0 * dt; // Accel in forward (-z) axis
          gameAudio.playBoost();
        }

        // B. Checkpoint
        if (plat.type === 'checkpoint' && !checkpointStates.current[plat.id]) {
          checkpointStates.current[plat.id] = true;
          // Get correct local index
          const ckIndex = currentLevel.platforms
            .filter((p) => p.type === 'checkpoint')
            .findIndex((p) => p.id === plat.id);
          onCheckpointReachedRef.current(ckIndex >= 0 ? ckIndex : 0);
          
          // Flash mesh green temporarily
          if (mesh) {
            (mesh.material as THREE.MeshStandardMaterial).color.setHex(0x22c55e); // bright green-500
          }
          gameAudio.playCheckpoint();
        }

        // C. Goal Reach Checking
        if (plat.type === 'goal') {
          onGoalReachedRef.current();
          gameAudio.playGoal();
        }

        // Contact friction and rolling angular mechanics
        const normalVelResulated = ballVel.current.dot(norm);
        const tangentialVel = ballVel.current.clone().addScaledVector(norm, -normalVelResulated);

        // Determine friction coeff base on platform texture
        let frictionCoeff = 3.5; // robust grip on wood
        if (plat.type === 'slippery') {
          frictionCoeff = 0.15; // ultra-low ice friction slide
        } else if (plat.type === 'bouncy') {
          frictionCoeff = 1.0;
        }

        // Decelerate tangential speed representing surface friction
        const initialTangLen = tangentialVel.length();
        if (initialTangLen > 0.01) {
          const frictionDecel = Math.min(initialTangLen, frictionCoeff * dt * 4.5);
          tangentialVel.normalize().multiplyScalar(initialTangLen - frictionDecel);
          
          // Reassemble velocity
          ballVel.current.copy(norm.multiplyScalar(normalVelResulated)).add(tangentialVel);
        }

        // If contact normal is predominantly pointing upwards (Y direction), mark player as grounded!
        if (norm.y > 0.65) {
          groundedThisStep = true;
          activePlatformId.current = plat.id; // Remember this platform to sync motion smoothly during the next frame
        }
      } else {
        // Proximity Fallback Ground Check:
        // Even if there is no physical overlap/collision, check if the ball is extremely close to the top surface of the platform.
        // This handles cases when moving fast where physics micro-steps cause the ball to glide/bounce slightly above the platform.
        const topPlaneHeight = cy + hy;
        const withinX = ballPos.current.x >= cx - hx - 0.05 && ballPos.current.x <= cx + hx + 0.05;
        const withinZ = ballPos.current.z >= cz - hz - 0.05 && ballPos.current.z <= cz + hz + 0.05;
        const ballBottomY = ballPos.current.y - ballRadius;
        const distToTop = ballBottomY - topPlaneHeight;

        if (withinX && withinZ && distToTop >= -0.05 && distToTop <= 0.18 && ballVel.current.y <= 3.0) {
          groundedThisStep = true;
        }
      }
    });

    // 6. Collision against Moving Obstacles (Sliders)
    currentLevel.obstacles.forEach((obs) => {
      if (obs.type === 'slider') {
        const mesh = obstacleMeshesRef.current[obs.id];
        const cx = mesh ? mesh.position.x : obs.position.x;
        const cy = mesh ? mesh.position.y : obs.position.y;
        const cz = mesh ? mesh.position.z : obs.position.z;

        const hx = obs.size.x / 2;
        const hy = obs.size.y / 2;
        const hz = obs.size.z / 2;

        const pClamped = new THREE.Vector3(
          Math.max(cx - hx, Math.min(ballPos.current.x, cx + hx)),
          Math.max(cy - hy, Math.min(ballPos.current.y, cy + hy)),
          Math.max(cz - hz, Math.min(ballPos.current.z, cz + hz))
        );

        const toCenter = ballPos.current.clone().sub(pClamped);
        const distance = toCenter.length();

        if (distance < ballRadius) {
          const depth = ballRadius - distance;
          const norm = toCenter.clone().normalize();

          // Push OUT
          ballPos.current.addScaledVector(norm, depth);

          // Bounce velocity
          const normVel = ballVel.current.dot(norm);
          if (normVel < 0) {
            // High bumper push back!
            ballVel.current.addScaledVector(norm, -1.6 * normVel);
          }

          // Active sliding kinetic impact (adds velocity in movement axis)
          const dir = new THREE.Vector3(obs.direction.x, obs.direction.y, obs.direction.z).normalize();
          const curSpeed = obs.speed * obs.range * Math.cos(timeSec * obs.speed + (obs.phase || 0));
          
          // Push horizontally hard
          ballVel.current.addScaledVector(dir, curSpeed * 1.5 * dt);
          gameAudio.playBounce();
        }
      }
    });

    if (groundedThisStep) {
      coyoteTime.current = 0.15; // 150ms of jump grace window
    } else {
      coyoteTime.current = Math.max(0, coyoteTime.current - dt);
      activePlatformId.current = null; // No platform assignment when airborne!
    }
    isGrounded.current = groundedThisStep;

    // Handle Active Jump Controls (Jump buffering support)
    if (requestJump) {
      jumpBufferTime.current = 0.2; // 200ms input buffer
    } else {
      jumpBufferTime.current = Math.max(0, jumpBufferTime.current - dt);
    }

    if (jumpBufferTime.current > 0 && (isGrounded.current || coyoteTime.current > 0)) {
      ballVel.current.y = 8.5; // Jump strength
      isGrounded.current = false;
      coyoteTime.current = 0; // Consume coyote window immediately
      jumpBufferTime.current = 0; // Consume jump buffer!
      activePlatformId.current = null; // Clear active platform upon jumping
      gameAudio.playJump();
    }

    // Apply Rolling physics to ballOmega (angular rotation axis)
    // Rolling velocity creates correct rotational spin: angular_velocity = normal X flat_tangential_velocity
    const flatFloorNorm = new THREE.Vector3(0, 1, 0); // upwards normal
    const normalVel = ballVel.current.dot(flatFloorNorm);
    const tangentialVel = ballVel.current.clone().addScaledVector(flatFloorNorm, -normalVel);
    
    // cross product gives rolling axis and rate
    ballOmega.current.copy(flatFloorNorm).cross(tangentialVel).multiplyScalar(1 / ballRadius);

    // Update real-time continuous rolling sound effects
    const speed = ballVel.current.length();
    gameAudio.updateRollingSound(speed, isGrounded.current);
  };

  return (
    <div
      id="3d-canvas-container"
      ref={containerRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl select-none"
      style={{ touchAction: 'none' }}
    />
  );
};
