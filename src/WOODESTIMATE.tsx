import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, Ruler, LayoutGrid } from 'lucide-react';

const PlywoodPiece = React.memo(({ position, args, name, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    if (isAssembled) {
      gsap.to(meshRef.current.position, { x: position[0], y: position[1], z: position[2], duration: 1 });
      gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1 });
    } else {
      gsap.to(meshRef.current.position, { x: position[0] * 3, y: -0.48, z: position[2] * 3, duration: 0.8 });
    }
  }, [isAssembled, position]);

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#b58d6d" roughness={0.7} />
      </mesh>
      {!isAssembled && (
        <Text position={[0, args[1]/2 + 0.05, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.08} color="#fbbf24">{name}</Text>
      )}
    </group>
  );
});

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 });
  const [assembled, setAssembled] = useState(true);

  // useMemo logic outside the render cycle
  const calcData = useMemo(() => {
    const s = 0.3;
    const t = dim.t * 0.0254;
    return {
      pieces: [
        { id: 1, name: "TOP", pos: [0, dim.h * s, 0], args: [dim.w * s, t, dim.d * s] },
        { id: 2, name: "L1", pos: [(dim.w*s/2)-0.1, (dim.h*s/2), (dim.d*s/2)-0.1], args: [0.15, dim.h*s, 0.15] },
        { id: 3, name: "L2", pos: [-(dim.w*s/2)+0.1, (dim.h*s/2), (dim.d*s/2)-0.1], args: [0.15, dim.h*s, 0.15] },
        { id: 4, name: "L3", pos: [(dim.w*s/2)-0.1, (dim.h*s/2), -(dim.d*s/2)+0.1], args: [0.15, dim.h*s, 0.15] },
        { id: 5, name: "L4", pos: [-(dim.w*s/2)+0.1, (dim.h*s/2), -(dim.d*s/2)+0.1], args: [0.15, dim.h*s, 0.15] },
      ],
      sheets: Math.ceil(((dim.w * dim.d) + (dim.w * dim.h * 2)) / 32),
      balance: (8 - dim.w).toFixed(2)
    };
  }, [dim.w, dim.h, dim.d, dim.t]);

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-6 flex flex-col gap-6 z-20">
        <h1 className="text-xl font-black text-amber-500 uppercase">Ply-Pro 3D</h1>
        <div className="grid grid-cols-2 gap-3">
          {['w', 'h', 'd'].map(k => (
            <div key={k}>
              <label className="text-[10px] text-slate-500 uppercase">{k}</label>
              <input type="number" step="0.1" value={(dim as any)[k]} 
                onChange={(e) => setDim({...dim, [k]: parseFloat(e.target.value) || 0})}
                className="w-full bg-slate-900 border border-white/10 p-2 rounded text-sm font-bold focus:border-amber-500 outline-none" />
            </div>
          ))}
        </div>
        <button onClick={() => setAssembled(!assembled)} className="w-full py-4 bg-amber-600 rounded-xl font-bold uppercase text-[10px] tracking-widest">
          {assembled ? "Explode View" : "Assemble Table"}
        </button>
      </div>

      <div className="flex-1 relative">
        <Canvas shadows dpr={[1, 1.5]} camera={{ position: [5, 4, 5], fov: 35 }}>
          <ambientLight intensity={0.7} />
          <Environment preset="city" />
          <Suspense fallback={null}>
            <group position={[0, -0.5, 0]}>
              {calcData.pieces.map(p => (
                <PlywoodPiece key={p.id} {...p} isAssembled={assembled} />
              ))}
            </group>
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
};

export default WoodEstimate;
