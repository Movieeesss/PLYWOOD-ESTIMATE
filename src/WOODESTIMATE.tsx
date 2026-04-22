import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, Ruler, LayoutGrid } from 'lucide-react';

// --- Animated Plywood Component ---
const PlywoodPiece = ({ position, args, name, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (meshRef.current) {
      if (isAssembled) {
        // Assemble: Smoothly move to table position
        gsap.to(meshRef.current.position, { 
          x: position[0], 
          y: position[1], 
          z: position[2], 
          duration: 1.2, 
          ease: "power3.inOut" 
        });
        gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.2 });
      } else {
        // Explode: Spread randomly on the ground
        gsap.to(meshRef.current.position, { 
          x: position[0] * 3.5, 
          y: -0.48, 
          z: position[2] * 3.5, 
          duration: 1, 
          ease: "expo.out" 
        });
      }
    }
  }, [isAssembled, position]);

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color="#b58d6d" roughness={0.7} metalness={0.1} />
      </mesh>
      {!isAssembled && (
        <Text 
          position={[0, args[1]/2 + 0.02, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          fontSize={0.07} 
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
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

  // --- Optimized useMemo to prevent Blinking ---
  const calculationData = useMemo(() => {
    const thicknessMeters = dim.t * 0.0254; // Inch to Meters
    const scale = 0.3; // Feet to 3D Units scale

    const list = [
      { name: "TOP", pos: [0, dim.h * scale, 0], args: [dim.w * scale, thicknessMeters, dim.d * scale] },
      { name: "LEG 1", pos: [(dim.w * scale / 2) - 0.1, (dim.h * scale / 2), (dim.d * scale / 2) - 0.1], args: [0.15, dim.h * scale, 0.15] },
      { name: "LEG 2", pos: [-(dim.w * scale / 2) + 0.1, (dim.h * scale / 2), (dim.d * scale / 2) - 0.1], args: [0.15, dim.h * scale, 0.15] },
      { name: "LEG 3", pos: [(dim.w * scale / 2) - 0.1, (dim.h * scale / 2), -(dim.d * scale / 2) + 0.1], args: [0.15, dim.h * scale, 0.15] },
      { name: "LEG 4", pos: [-(dim.w * scale / 2) + 0.1, (dim.h * scale / 2), -(dim.d * scale / 2) + 0.1], args: [0.15, dim.h * scale, 0.15] },
    ];

    const totalArea = (dim.w * dim.d) + (4 * 0.5 * dim.h);
    const sheetsNeeded = Math.ceil(totalArea / 32);
    const balance = (8 - dim.w).toFixed(2);

    return { list, sheetsNeeded, balance };
  }, [dim.w, dim.h, dim.d, dim.t]); // Only recalculate if these specific values change

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR */}
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-6 flex flex-col gap-8 shadow-2xl z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg shadow-lg">
            <LayoutGrid size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter">PLY-MAX <span className="text-amber-500">3D</span></h1>
        </div>

        <div className="space-y-6">
          <section className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
              <Ruler size={12} /> Input Dimensions (ft)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {['w', 'h', 'd'].map((k) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[10px] text-slate-400 mb-1 ml-1">{k==='w'?'Length':k==='h'?'Height':'Width'}</span>
                  <input 
                    type="number" 
                    step="0.1"
                    value={(dim as any)[k]} 
                    onChange={(e) => setDim({...dim, [k]: parseFloat(e.target.value) || 0})}
                    className="bg-[#020617] border border-white/10 p-2 rounded-lg text-sm font-bold focus:border-amber-500 outline-none transition-all" 
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-amber-500/5 p-5 rounded-xl border border-amber-500/20">
             <div className="flex justify-between items-center mb-3 text-amber-500">
                <h3 className="text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                   <Scissors size={14}/> Cutsomation
                </h3>
             </div>
             <div className="space-y-1">
                <p className="text-2xl font-black text-amber-500 tracking-tighter">{calculationData.balance}'</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Balance from 8' Sheet</p>
             </div>
          </section>

          <button 
            onClick={() => setAssembled(!assembled)}
            className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              assembled ? 'bg-slate-800 border border-white/10 hover:bg-slate-700' : 'bg-amber-600 shadow-xl shadow-amber-900/20 hover:bg-amber-500'
            }`}
          >
            {assembled ? "Explode & Nest View" : "Assemble 3D Table"}
          </button>
        </div>
      </div>

      {/* 3D VIEWPORT */}
      <div className="flex-1 relative">
        {/* Material Badge */}
        <div className="absolute top-8 right-8 z-10 bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex gap-6 items-center shadow-2xl">
           <div className="text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Sheets Req.</p>
              <p className="text-3xl font-black text-amber-500 leading-none">{calculationData.sheetsNeeded}</p>
           </div>
           <div className="h-8 w-px bg-white/10"></div>
           <button className="text-amber-500 hover:text-amber-400 transition-colors">
              <FileText size={26} />
           </button>
        </div>

        {/* 3D Canvas Area */}
        <div className="w-full h-full">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={35} />
            <ambientLight intensity={0.7} />
            <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
              <group position={[0, -0.5, 0]}>
                {calculationData.list.map((p, i) => (
                  <PlywoodPiece key={i} {...p} isAssembled={assembled} />
                ))}
              </group>
              <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={15} blur={2.5} far={4} />
            </Suspense>

            <OrbitControls enableDamping dampingFactor={0.1} maxPolarAngle={Math.PI / 1.8} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WoodEstimate;
