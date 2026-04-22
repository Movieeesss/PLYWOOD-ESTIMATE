import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, Ruler, LayoutGrid } from 'lucide-react';

// Piece Component - GSAP-a safe-ah handle panna useEffect-la null check add panniruken
const PlywoodPiece = ({ position, args, name, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    
    if (isAssembled) {
      gsap.to(meshRef.current.position, { x: position[0], y: position[1], z: position[2], duration: 1, ease: "power2.out" });
    } else {
      gsap.to(meshRef.current.position, { x: position[0] * 3, y: -0.45, z: position[2] * 3, duration: 0.8, ease: "power2.out" });
    }
  }, [isAssembled, position]);

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#b58d6d" roughness={0.7} />
      </mesh>
      {!isAssembled && (
        <Text position={[0, args[1]/2 + 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.08} color="#fbbf24">
          {name}
        </Text>
      )}
    </group>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 });
  const [assembled, setAssembled] = useState(true);

  // Blinking-a thadukka logic and pieces-a useMemo moolama isolate pannidalaam
  const { list, sheets, balance } = useMemo(() => {
    const tM = dim.t * 0.0254;
    const s = 0.3; // Scale factor
    
    const piecesList = [
      { name: "TOP", pos: [0, dim.h * s, 0], args: [dim.w * s, tM, dim.d * s] },
      { name: "LEG 1", pos: [(dim.w * s / 2) - 0.1, (dim.h * s / 2), (dim.d * s / 2) - 0.1], args: [0.15, dim.h * s, 0.15] },
      { name: "LEG 2", pos: [-(dim.w * s / 2) + 0.1, (dim.h * s / 2), (dim.d * s / 2) - 0.1], args: [0.15, dim.h * s, 0.15] },
      { name: "LEG 3", pos: [(dim.w * s / 2) - 0.1, (dim.h * s / 2), -(dim.d * s / 2) + 0.1], args: [0.15, dim.h * s, 0.15] },
      { name: "LEG 4", pos: [-(dim.w * s / 2) + 0.1, (dim.h * s / 2), -(dim.d * s / 2) + 0.1], args: [0.15, dim.h * s, 0.15] },
    ];
    
    const sheetsNeeded = Math.ceil(((dim.w * dim.d) + (dim.w * dim.h * 2)) / 32);
    return { list: piecesList, sheets: sheetsNeeded, balance: (8 - dim.w).toFixed(2) };
  }, [dim.w, dim.h, dim.d, dim.t]);

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-6 flex flex-col gap-6 z-20 overflow-y-auto shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg"><LayoutGrid size={22} /></div>
          <h1 className="text-xl font-black">PLY-MAX <span className="text-amber-500">3D</span></h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {['w', 'h', 'd'].map(k => (
              <div key={k}>
                <label className="text-[10px] text-slate-500 uppercase">{k==='w'?'L':k==='h'?'H':'W'} (ft)</label>
                <input type="number" step="0.1" value={(dim as any)[k]} 
                  onChange={(e) => setDim({...dim, [k]: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[#020617] border border-white/10 p-2 rounded mt-1 text-sm outline-none focus:border-amber-500" />
              </div>
            ))}
          </div>

          <div className="bg-amber-600/5 p-4 rounded-xl border border-amber-600/20">
             <div className="flex justify-between text-xs text-slate-400 mb-2"><span>Optimization:</span> <span className="text-green-400">{balance}' bal</span></div>
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{width: `${(dim.w / 8) * 100}%`}}></div>
             </div>
          </div>

          <button onClick={() => setAssembled(!assembled)} 
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg">
            {assembled ? "Explode View" : "Assemble Table"}
          </button>
        </div>
      </div>

      {/* 3D VIEWPORT */}
      <div className="flex-1 relative">
        <div className="absolute top-8 right-8 z-10 bg-slate-900/90 p-4 rounded-2xl border border-white/5 flex gap-4 items-center">
           <div className="text-right"><p className="text-[10px] text-slate-500 uppercase font-bold">Sheets</p><p className="text-2xl font-black text-amber-500 leading-none">{sheets}</p></div>
           <FileText className="text-amber-600" size={24} />
        </div>

        {/* Canvas wrapper height-a fix pannitta blinking ninnudum */}
        <div className="w-full h-full">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={35} />
            <ambientLight intensity={0.8} />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <group position={[0, -0.5, 0]}>
                {list.map((p, i) => (
                  <PlywoodPiece key={`${i}-${assembled}`} {...p} isAssembled={assembled} />
                ))}
              </group>
              <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.1} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WoodEstimate;
