import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, PerspectiveCamera, Text } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, LayoutPanelLeft, Ruler } from 'lucide-react';

const PlywoodPiece = ({ position, args, name, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (meshRef.current) {
      if (isAssembled) {
        gsap.to(meshRef.current.position, { x: position[0], y: position[1], z: position[2], duration: 1.2, ease: "back.out(1.2)" });
        gsap.to(meshRef.current.rotation, { x: 0, y: 0, z: 0, duration: 1.2 });
      } else {
        // Smoothly scatter on the floor
        gsap.to(meshRef.current.position, { 
          x: position[0] * 3 + (Math.random() - 0.5) * 2, 
          y: -0.48, 
          z: position[2] * 3 + (Math.random() - 0.5) * 2, 
          duration: 1, 
          ease: "power2.out" 
        });
        gsap.to(meshRef.current.rotation, { x: 0, y: Math.random() * 0.5, z: 0, duration: 1 });
      }
    }
  }, [isAssembled, position]);

  return (
    <group ref={meshRef}>
      <mesh castShadow>
        <boxGeometry args={args} />
        {[...Array(6)].map((_, i) => (
          <meshStandardMaterial 
            key={i} 
            attach={`material-${i}`} 
            color={i === 2 || i === 3 ? "#e3c1a4" : "#966f4d"} 
            roughness={0.6}
          />
        ))}
      </mesh>
      {!isAssembled && (
        <Text position={[0, args[1]/2 + 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.08} color="#fbbf24" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
          {name}
        </Text>
      )}
    </group>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 });
  const [assembled, setAssembled] = useState(true);
  
  // --- Optimized useMemo for Calculations ---
  const calculationData = useMemo(() => {
    const tMeters = dim.t * 0.0254; // thickness
    const kerf = 0.01; // 1/8 inch blade loss in feet approx
    
    // Pieces list for 3D and Logic
    const list = [
      { name: `TOP (${dim.w}'x${dim.d}')`, pos: [0, dim.h * 0.3, 0], args: [dim.w * 0.3, tMeters, dim.d * 0.3] },
      { name: "LEG A", pos: [(dim.w*0.15)-0.08, (dim.h*0.15), (dim.d*0.15)-0.08], args: [0.12, dim.h * 0.3, 0.12] },
      { name: "LEG B", pos: [-(dim.w*0.15)+0.08, (dim.h*0.15), (dim.d*0.15)-0.08], args: [0.12, dim.h * 0.3, 0.12] },
      { name: "LEG C", pos: [(dim.w*0.15)-0.08, (dim.h*0.15), -(dim.d*0.15)+0.1], args: [0.12, dim.h * 0.3, 0.12] },
      { name: "LEG D", pos: [-(dim.w*0.15)+0.08, (dim.h*0.15), -(dim.d*0.15)+0.1], args: [0.12, dim.h * 0.3, 0.12] },
    ];

    const topArea = (dim.w + kerf) * (dim.d + kerf);
    const legsArea = 4 * (0.5 * dim.h); // 6" legs area
    const totalArea = topArea + legsArea;
    const sheets = Math.ceil(totalArea / 32);
    const balance = (8 - dim.w).toFixed(2);

    return { list, sheets, balance, progress: (dim.w / 8) * 100 };
  }, [dim]);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden">
      <div className="w-80 bg-[#0f172a] border-r border-white/5 p-6 flex flex-col gap-6 shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 rounded-lg shadow-lg">
            <Box size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter">PLY-MAX <span className="text-amber-500 underline uppercase text-[10px] ml-1">Optimized</span></h1>
        </div>

        <div className="space-y-5">
          <section className="bg-white/5 p-4 rounded-xl border border-white/5">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2">
              <Ruler size={12} /> Dimensions (ft)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {['w', 'h', 'd'].map((k) => (
                <div key={k} className="flex flex-col">
                  <span className="text-[9px] text-slate-400 mb-1">{k==='w'?'Length':k==='h'?'Height':'Depth'}</span>
                  <input type="number" step="0.1" value={(dim as any)[k]} 
                    onChange={(e)=>setDim({...dim, [k]: parseFloat(e.target.value) || 0})}
                    className="bg-[#020617] border border-white/10 p-2 rounded-lg text-sm font-bold focus:border-amber-500 outline-none" />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
             <h3 className="text-xs font-bold text-amber-500 uppercase flex items-center gap-2 mb-3"><Scissors size={14}/> Cut Logic</h3>
             <div className="space-y-3 text-[11px]">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>8' Sheet Cut:</span> 
                  <span className="text-white">{dim.w}'</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Balance:</span> 
                  <span className="text-green-400 font-mono">{calculationData.balance}' left</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-amber-500 transition-all duration-700 ease-in-out" style={{width: `${calculationData.progress}%`}}></div>
                </div>
             </div>
          </section>

          <button onClick={() => setAssembled(!assembled)} 
            className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg ${assembled ? 'bg-slate-800 border border-white/10' : 'bg-amber-600 shadow-amber-900/40'}`}>
            {assembled ? "View Cutting Nest" : "Assemble Table"}
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute top-8 right-8 bg-[#0f172a]/90 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex gap-6 items-center shadow-2xl z-10">
           <div className="text-center border-r border-white/10 pr-6">
              <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Sheets Needed</p>
              <p className="text-3xl font-black text-amber-500 leading-none tracking-tighter">{calculationData.sheets}</p>
           </div>
           <button className="bg-amber-600/10 hover:bg-amber-600/20 p-3 rounded-xl transition-all">
              <FileText className="text-amber-500" size={24} />
           </button>
        </div>

        <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[6, 5, 6]} fov={30} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 15, 10]} angle={0.2} penumbra={1} castShadow />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <group position={[0, -0.6, 0]}>
              {calculationData.list.map((p, i) => (
                <PlywoodPiece key={i} {...p} isAssembled={assembled} />
              ))}
            </group>
            <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={15} blur={3} far={4.5} />
          </Suspense>

          <OrbitControls enableDamping dampingFactor={0.1} />
        </Canvas>
      </div>
    </div>
  );
};

export default WoodEstimate;
