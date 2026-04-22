import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, Ruler, LayoutGrid } from 'lucide-react';

// Piece Component - Ref-based animation to prevent re-renders
const PlywoodPiece = ({ position, args, name, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    
    if (isAssembled) {
      gsap.to(meshRef.current.position, { 
        x: position[0], 
        y: position[1], 
        z: position[2], 
        duration: 1, 
        ease: "power3.out" 
      });
      gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1 });
    } else {
      // Cutsomation/Explode View
      gsap.to(meshRef.current.position, { 
        x: position[0] * 3, 
        y: -0.48, 
        z: position[2] * 3, 
        duration: 0.8, 
        ease: "expo.out" 
      });
    }
  }, [isAssembled, position]);

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#b58d6d" roughness={0.6} metalness={0.1} />
      </mesh>
      {!isAssembled && (
        <Text 
          position={[0, args[1]/2 + 0.05, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          fontSize={0.08} 
          color="#fbbf24"
          maxWidth={1}
          textAlign="center"
        >
          {name}
        </Text>
      )}
    </group>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 });
  const [assembled, setAssembled] = useState(true);

  // Memoize calculations to prevent the "Blink" effect during typing
  const calc = useMemo(() => {
    const tM = dim.t * 0.0254;
    const s = 0.3; // Scale factor: Feet to 3D units

    const piecesList = [
      { id: 'top', name: "TOP", pos: [0, dim.h * s, 0], args: [dim.w * s, tM, dim.d * s] },
      { id: 'l1', name: "LEG 1", pos: [(dim.w*s/2)-0.1, (dim.h*s/2), (dim.d*s/2)-0.1], args: [0.15, dim.h*s, 0.15] },
      { id: 'l2', name: "LEG 2", pos: [-(dim.w*s/2)+0.1, (dim.h*s/2), (dim.d*s/2)-0.1], args: [0.15, dim.h*s, 0.15] },
      { id: 'l3', name: "LEG 3", pos: [(dim.w*s/2)-0.1, (dim.h*s/2), -(dim.d*s/2)+0.1], args: [0.15, dim.h*s, 0.15] },
      { id: 'l4', name: "LEG 4", pos: [-(dim.w*s/2)+0.1, (dim.h*s/2), -(dim.d*s/2)+0.1], args: [0.15, dim.h*s, 0.15] },
    ];

    const sheets = Math.ceil(((dim.w * dim.d) + (dim.w * dim.h * 2)) / 32);
    return { piecesList, sheets, balance: (8 - dim.w).toFixed(2) };
  }, [dim.w, dim.h, dim.d, dim.t]);

  return (
    <div className="flex h-screen bg-[#020617] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-6 flex flex-col gap-6 z-20 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg shadow-lg">
            <LayoutGrid size={22} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Ply-Pro <span className="text-amber-500">3D</span></h1>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-2">
              <Ruler size={12} /> Dimensions (ft)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {['w', 'h', 'd'].map((k) => (
                <div key={k}>
                  <label className="text-[9px] text-slate-400 uppercase ml-1">{k==='w'?'Length':k==='h'?'Height':'Depth'}</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={(dim as any)[k]} 
                    onChange={(e) => setDim({...dim, [k]: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#020617] border border-white/10 p-2 rounded text-sm font-bold focus:border-amber-500 outline-none" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-600/5 p-4 rounded-xl border border-amber-600/20">
             <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-amber-500 flex items-center gap-2 uppercase tracking-tight"><Scissors size={14}/> Cut Logic</h3>
             </div>
             <p className="text-2xl font-black text-amber-500 tracking-tighter">{calc.balance}' <span className="text-[10px] text-slate-500 font-bold">Balance</span></p>
          </div>

          <button 
            onClick={() => setAssembled(!assembled)}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20"
          >
            {assembled ? "View Cutting Nest" : "Assemble 3D Table"}
          </button>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 relative bg-[#020617]">
        <div className="absolute top-8 right-8 z-10 bg-slate-900/90 p-5 rounded-2xl border border-white/5 flex gap-6 items-center shadow-2xl">
           <div className="text-center border-r border-white/10 pr-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Total Sheets</p>
              <p className="text-3xl font-black text-amber-500 leading-none">{calc.sheets}</p>
           </div>
           <FileText className="text-amber-500" size={24} />
        </div>

        {/* This wrapper ensures the canvas doesn't resize or blink */}
        <div className="w-full h-full relative">
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
            <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={35} />
            <ambientLight intensity={0.8} />
            <Environment preset="city" />
            <Suspense fallback={null}>
              <group position={[0, -0.5, 0]}>
                {calc.piecesList.map((p) => (
                  <PlywoodPiece 
                    key={p.id} // Fixed ID key prevents blink
                    {...p} 
                    isAssembled={assembled} 
                  />
                ))}
              </group>
              <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={15} blur={2.5} far={4} />
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.1} maxPolarAngle={Math.PI / 2} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WoodEstimate;
