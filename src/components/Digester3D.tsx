import { useRef, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export type TankMaterial = 'metallic' | 'cement';

export type SimState = {
  feedstockType: string;
  feedstockMass: number;
  temperature: number;
  running: boolean;
  pressure: number;
  gasLevel: number;
  bubbleSpeed: number;
  day: number;
  tankMaterial: TankMaterial;
};

type PartKey = 'inlet' | 'chamber' | 'dome' | 'outlet' | 'effluent';

type Props = {
  sim: SimState;
  hovered: PartKey | null;
  setHovered: (k: PartKey | null) => void;
  selected: PartKey | null;
  setSelected: (k: PartKey | null) => void;
};

const GROUND_Y = 0; // ground level
const TANK_CENTER_Y = -3.2; // underground tank center
const TANK_RADIUS = 2.2;
const TANK_HEIGHT = 3.4;

function Label({ position, children, color = '#10B981' }: { position: [number, number, number]; children: ReactNode; color?: string }) {
  return (
    <Html position={position} center distanceFactor={9} occlude={false}>
      <div style={{ borderColor: color }} className="px-2 py-1 rounded-md bg-midnight-950/90 border text-[10px] font-medium whitespace-nowrap backdrop-blur-md text-white">
        {children}
      </div>
    </Html>
  );
}

// Animated gas bubbles rising through the slurry
function Bubbles({ speed, count = 22 }: { speed: number; count?: number }) {
  const group = useRef<THREE.Group>(null);
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * (TANK_RADIUS * 1.6),
        z: (Math.random() - 0.5) * (TANK_RADIUS * 1.6),
        startY: TANK_CENTER_Y - TANK_HEIGHT / 2 + 0.3 + Math.random() * 0.5,
        riseDist: TANK_HEIGHT - 0.8,
        speed: 0.3 + Math.random() * 0.7,
        size: 0.05 + Math.random() * 0.07,
        offset: Math.random() * 10,
      })),
    [count]
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const b = bubbles[i];
      const cycle = ((t * speed * b.speed + b.offset) % b.riseDist) / b.riseDist;
      child.position.y = b.startY + cycle * b.riseDist;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = cycle < 0.08 ? cycle * 12 : cycle > 0.9 ? (1 - cycle) * 10 : 0.65;
      child.scale.setScalar(b.size * (0.5 + cycle * 0.5));
    });
  });

  return (
    <group ref={group}>
      {bubbles.map((b, i) => (
        <mesh key={i} position={[b.x, b.startY, b.z]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial color="#86D5A0" transparent opacity={0.6} emissive="#10B981" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

// Organic brown slurry inside the underground tank — level driven by feedstock mass
function Slurry({ level }: { level: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.position.y = TANK_CENTER_Y - TANK_HEIGHT / 2 + level * (TANK_HEIGHT - 0.6) + Math.sin(t * 1.5) * 0.025;
  });
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[TANK_RADIUS - 0.12, TANK_RADIUS - 0.12, 0.12, 48]} />
      <meshStandardMaterial
        color="#5B3A1A"
        transparent
        opacity={0.88}
        emissive="#3D2810"
        emissiveIntensity={0.12}
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

// Above-ground external gas storage dome — expands and glows with pressure
function GasDome({ pressure, running }: { pressure: number; running: boolean }) {
  const dome = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const baseY = GROUND_Y + 1.4;
  const targetScale = 1 + (pressure - 1) * 0.3;

  useFrame((state) => {
    if (!dome.current || !glow.current) return;
    const t = state.clock.elapsedTime;
    const s = targetScale + (running ? Math.sin(t * 2) * 0.03 : 0);
    dome.current.scale.setScalar(s);
    const mat = dome.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.25 + (pressure - 0.8) * 0.5 + (running ? Math.sin(t * 3) * 0.12 : 0);
    const gmat = glow.current.material as THREE.MeshBasicMaterial;
    gmat.opacity = 0.06 + (pressure - 0.8) * 0.15;
  });

  return (
    <group position={[3.2, 0, 0]}>
      {/* Concrete pad */}
      <mesh position={[0, GROUND_Y + 0.05, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.1, 32]} />
        <meshStandardMaterial color="#6B7280" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Glow halo */}
      <mesh ref={glow} position={[0, baseY, 0]} scale={1.6}>
        <sphereGeometry args={[1, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      {/* Dome */}
      <mesh ref={dome} position={[0, baseY, 0]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#06B6D4"
          transparent
          opacity={0.4}
          emissive="#10B981"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Dome base ring */}
      <mesh position={[0, GROUND_Y + 0.15, 0]}>
        <cylinderGeometry args={[1, 1, 0.3, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

// Underground main tank — switchable material, semi-transparent cutaway
function UndergroundTank({
  material,
  hovered,
  selected,
  onClick,
  onOver,
  onOut,
  slurryLevel,
  bubbleSpeed,
}: {
  material: TankMaterial;
  hovered: boolean;
  selected: boolean;
  onClick: () => void;
  onOver: () => void;
  onOut: () => void;
  slurryLevel: number;
  bubbleSpeed: number;
}) {
  const isMetal = material === 'metallic';
  const tankColor = isMetal ? '#4A5568' : '#9CA3AF';
  const metalness = isMetal ? 0.8 : 0.15;
  const roughness = isMetal ? 0.3 : 0.85;
  const opacity = hovered || selected ? 0.35 : 0.22;

  return (
    <group onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {/* Tank wall (cylinder, semi-transparent for cutaway) */}
      <mesh position={[0, TANK_CENTER_Y, 0]}>
        <cylinderGeometry args={[TANK_RADIUS, TANK_RADIUS, TANK_HEIGHT, 48, 1, true]} />
        <meshStandardMaterial
          color={tankColor}
          metalness={metalness}
          roughness={roughness}
          side={THREE.DoubleSide}
          transparent
          opacity={opacity}
          emissive={hovered || selected ? '#10B981' : '#000'}
          emissiveIntensity={hovered || selected ? 0.15 : 0}
        />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, TANK_CENTER_Y + TANK_HEIGHT / 2, 0]}>
        <torusGeometry args={[TANK_RADIUS, 0.08, 12, 48]} />
        <meshStandardMaterial color={isMetal ? '#334155' : '#6B7280'} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Bottom cap */}
      <mesh position={[0, TANK_CENTER_Y - TANK_HEIGHT / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[TANK_RADIUS, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={tankColor} metalness={metalness} roughness={roughness} transparent opacity={0.5} />
      </mesh>

      {/* Internal slurry */}
      <Slurry level={slurryLevel} />

      {/* Bubbles */}
      <Bubbles speed={bubbleSpeed} />
    </group>
  );
}

// Ground surface — grass above, soil below
function Ground() {
  return (
    <group>
      {/* Grass surface (thin green layer) */}
      <mesh position={[0, GROUND_Y + 0.02, 0]}>
        <boxGeometry args={[16, 0.06, 8]} />
        <meshStandardMaterial color="#3B7A3B" roughness={0.95} metalness={0} />
      </mesh>
      {/* Grass texture bumps */}
      <mesh position={[0, GROUND_Y + 0.05, 0]}>
        <boxGeometry args={[16, 0.02, 8]} />
        <meshStandardMaterial color="#4A8A4A" roughness={1} />
      </mesh>

      {/* Soil substrate (below ground) */}
      <mesh position={[0, GROUND_Y - 3.5, 0]}>
        <boxGeometry args={[16, 7, 8]} />
        <meshStandardMaterial color="#5C4033" roughness={1} metalness={0} />
      </mesh>
      {/* Soil layer variation */}
      <mesh position={[0, GROUND_Y - 1.5, 0]}>
        <boxGeometry args={[16, 1, 8]} />
        <meshStandardMaterial color="#6B4A35" roughness={1} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, GROUND_Y - 5, 0]}>
        <boxGeometry args={[16, 1.5, 8]} />
        <meshStandardMaterial color="#4A3326" roughness={1} transparent opacity={0.5} />
      </mesh>

      {/* Ground line divider */}
      <mesh position={[0, GROUND_Y + 0.06, 0]}>
        <boxGeometry args={[16, 0.015, 8.02]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Vertical inlet funnel pipe standing above ground, going down into the tank
function InletPipe({
  hovered,
  selected,
  onClick,
  onOver,
  onOut,
}: {
  hovered: boolean;
  selected: boolean;
  onClick: () => void;
  onOver: () => void;
  onOut: () => void;
}) {
  const color = hovered || selected ? '#10B981' : '#475569';
  return (
    <group onClick={onClick} onPointerOver={onOver} onPointerOut={onOut} position={[-3.5, 0, 0]}>
      {/* Above-ground vertical pipe */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 2.4, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive={hovered || selected ? '#10B981' : '#000'} emissiveIntensity={0.2} />
      </mesh>
      {/* Funnel top (cone) */}
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[0.5, 0.6, 24, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} side={THREE.DoubleSide} emissive={hovered || selected ? '#10B981' : '#000'} emissiveIntensity={0.15} />
      </mesh>
      {/* Below-ground pipe section connecting to tank */}
      <mesh position={[1.3, TANK_CENTER_Y + 0.8, 0]} rotation={[0, 0, -Math.PI / 2.2]}>
        <cylinderGeometry args={[0.22, 0.22, 2.8, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Gas outlet pipe from tank top up to the external dome
function GasOutletPipe({
  hovered,
  selected,
  onClick,
  onOver,
  onOut,
}: {
  hovered: boolean;
  selected: boolean;
  onClick: () => void;
  onOver: () => void;
  onOut: () => void;
}) {
  const color = hovered || selected ? '#06B6D4' : '#475569';
  return (
    <group onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {/* Vertical pipe from tank top to above ground */}
      <mesh position={[0.8, TANK_CENTER_Y + TANK_HEIGHT / 2 + 1.2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 4.8, 24]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} emissive={hovered || selected ? '#06B6D4' : '#000'} emissiveIntensity={0.2} />
      </mesh>
      {/* Horizontal pipe to dome */}
      <mesh position={[2, GROUND_Y + 0.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 2.4, 24]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* IoT sensor box on pipe */}
      <mesh position={[1.5, GROUND_Y + 0.7, 0.2]}>
        <boxGeometry args={[0.25, 0.2, 0.25]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.4} />
      </mesh>
      {/* Valve */}
      <mesh position={[0.8, GROUND_Y + 0.3, 0]}>
        <torusGeometry args={[0.18, 0.06, 12, 24]} />
        <meshStandardMaterial color="#06B6D4" metalness={0.8} roughness={0.2} emissive="#06B6D4" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Effluent outlet at the lower base of the underground tank
function EffluentOutlet({
  hovered,
  selected,
  onClick,
  onOver,
  onOut,
}: {
  hovered: boolean;
  selected: boolean;
  onClick: () => void;
  onOver: () => void;
  onOut: () => void;
}) {
  const color = hovered || selected ? '#10B981' : '#475569';
  return (
    <group onClick={onClick} onPointerOver={onOver} onPointerOut={onOut}>
      {/* Pipe from lower base of tank going right and up to surface */}
      <mesh position={[TANK_RADIUS + 1, TANK_CENTER_Y - TANK_HEIGHT / 2 + 0.4, 0]} rotation={[0, 0, Math.PI / 2.3]}>
        <cylinderGeometry args={[0.22, 0.22, 2.8, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} transparent opacity={0.75} emissive={hovered || selected ? '#10B981' : '#000'} emissiveIntensity={0.15} />
      </mesh>
      {/* Valve at base */}
      <mesh position={[TANK_RADIUS + 0.3, TANK_CENTER_Y - TANK_HEIGHT / 2 + 0.4, 0]}>
        <torusGeometry args={[0.2, 0.07, 12, 24]} />
        <meshStandardMaterial color="#10B981" metalness={0.7} roughness={0.2} emissive="#10B981" emissiveIntensity={0.25} />
      </mesh>
      {/* Discharge outlet at surface */}
      <mesh position={[TANK_RADIUS + 2.2, GROUND_Y - 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function DigesterScene({ sim, hovered, setHovered, selected, setSelected }: Props) {
  const isHot = sim.temperature > 38;
  const bubbleSpeed = sim.running ? (0.4 + (sim.temperature - 25) / 22) * (isHot ? 1.6 : 1) : 0.12;
  const slurryLevel = Math.min(0.82, sim.feedstockMass / 500 * 0.6 + 0.25);

  return (
    <group>
      {/* Ground and soil */}
      <Ground />

      {/* Underground tank */}
      <UndergroundTank
        material={sim.tankMaterial}
        hovered={hovered === 'chamber' || selected === 'chamber'}
        selected={selected === 'chamber'}
        onClick={() => setSelected('chamber')}
        onOver={() => setHovered('chamber')}
        onOut={() => setHovered(null)}
        slurryLevel={slurryLevel}
        bubbleSpeed={bubbleSpeed}
      />

      {/* Inlet pipe (above + below ground) */}
      <InletPipe
        hovered={hovered === 'inlet'}
        selected={selected === 'inlet'}
        onClick={() => setSelected('inlet')}
        onOver={() => setHovered('inlet')}
        onOut={() => setHovered(null)}
      />

      {/* Gas outlet pipe + IoT sensor */}
      <GasOutletPipe
        hovered={hovered === 'outlet'}
        selected={selected === 'outlet'}
        onClick={() => setSelected('outlet')}
        onOver={() => setHovered('outlet')}
        onOut={() => setHovered(null)}
      />

      {/* External gas storage dome (above ground) */}
      <group
        onClick={() => setSelected('dome')}
        onPointerOver={() => setHovered('dome')}
        onPointerOut={() => setHovered(null)}
      >
        <GasDome pressure={sim.pressure} running={sim.running} />
      </group>

      {/* Effluent outlet (underground base) */}
      <EffluentOutlet
        hovered={hovered === 'effluent'}
        selected={selected === 'effluent'}
        onClick={() => setSelected('effluent')}
        onOver={() => setHovered('effluent')}
        onOut={() => setHovered(null)}
      />

      {/* Labels */}
      <Label position={[-3.5, 3.4, 0]} color="#10B981">Inlet / Feeding Funnel</Label>
      <Label position={[0, TANK_CENTER_Y, 3.2]} color="#10B981">Anaerobic Digestion Chamber (Underground)</Label>
      <Label position={[3.2, 3.2, 0]} color="#10B981">Gas Storage Dome</Label>
      <Label position={[1.5, GROUND_Y + 1.5, 0.5]} color="#06B6D4">Biogas Outlet Valve + IoT Sensor</Label>
      <Label position={[TANK_RADIUS + 2.5, GROUND_Y - 0.5, 0]} color="#10B981">Effluent / Slurry Outlet</Label>

      {/* Above/Below ground zone labels */}
      <Html position={[-6, GROUND_Y + 0.5, 0]} center distanceFactor={12} occlude={false}>
        <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-eco-400/60 bg-eco-500/5 border border-eco-500/10">
          Above Ground
        </div>
      </Html>
      <Html position={[-6, GROUND_Y - 1.5, 0]} center distanceFactor={12} occlude={false}>
        <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-amber-600/60 bg-amber-500/5 border border-amber-500/10">
          Subsurface Cross-Section
        </div>
      </Html>
    </group>
  );
}

const PART_INFO: Record<PartKey, { title: string; body: string; color: string }> = {
  inlet: {
    title: 'Inlet / Feeding Funnel',
    color: '#10B981',
    body: 'Organic waste (food scraps, manure, agricultural residue) enters through this above-ground funnel pipe, traveling down into the sealed underground digestion chamber. Feedstock loading rate directly affects biogas yield.',
  },
  chamber: {
    title: 'Anaerobic Digestion Chamber (Underground)',
    color: '#10B981',
    body: 'The core sealed vessel embedded in the subterranean soil substrate. Anaerobic bacteria break down organic matter in oxygen-free conditions at 35–40°C. The brown slurry level and rising bubbles indicate active methanogenesis. Tank material can be switched between Industrial Metallic and Reinforced Cement.',
  },
  dome: {
    title: 'External Gas Storage Dome',
    color: '#10B981',
    body: 'Methane-rich biogas collects in this above-ground dome, mounted on a concrete pad. As gas pressure increases, the dome expands and glows brighter. The gas travels from the underground tank through a pipe system to this external storage unit.',
  },
  outlet: {
    title: 'Biogas Outlet Valve + IoT Sensor',
    color: '#06B6D4',
    body: 'Biogas is drawn from the underground tank through this pipe system to the external dome. The IoT gas sensor monitors CH₄ concentration and flow rate in real time, transmitting data to the remote monitoring dashboard.',
  },
  effluent: {
    title: 'Effluent / Slurry Outlet',
    color: '#10B981',
    body: 'Digestate — the nutrient-rich processed bio-fertilizer — is extracted through a subterranean pipe system at the lower base of the underground tank. The heavy slurry is safely discharged at the surface for use as organic fertilizer.',
  },
};

export default function Digester3D({ sim, hovered, setHovered, selected, setSelected }: Props) {
  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 1, 12], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 8, 5]} intensity={1.2} color="#10B981" />
        <pointLight position={[-5, 3, -5]} intensity={0.8} color="#06B6D4" />
        <pointLight position={[0, 5, 0]} intensity={0.6} color="#ffffff" />
        <pointLight position={[0, -3, 5]} intensity={0.4} color="#F59E0B" />
        <DigesterScene
          sim={sim}
          hovered={hovered}
          setHovered={setHovered}
          selected={selected}
          setSelected={setSelected}
        />
        <OrbitControls
          enablePan={false}
          minDistance={7}
          maxDistance={18}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 1.6}
          autoRotate={!hovered && !selected}
          autoRotateSpeed={0.4}
        />
      </Canvas>

      {/* Tooltip overlay */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm glass-strong p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div
              className="w-1 h-12 rounded-full flex-shrink-0"
              style={{ background: PART_INFO[selected].color }}
            />
            <div>
              <h4 className="font-display font-semibold text-white text-sm mb-1">{PART_INFO[selected].title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{PART_INFO[selected].body}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="absolute top-4 right-4 glass px-3 py-1.5 text-[10px] text-slate-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-eco-500 animate-pulse" />
        Click parts to inspect · drag to rotate
      </div>
    </div>
  );
}
