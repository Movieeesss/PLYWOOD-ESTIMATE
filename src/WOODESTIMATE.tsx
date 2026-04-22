import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { gsap } from 'gsap';
import { Box, Scissors, FileText, Layout } from 'lucide-react';

// Piece Component with GSAP Animation
const TablePiece = ({ position, args, color, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (meshRef.current) {
      if (isAssembled) {
        gsap.to(meshRef.current.position, {
          x: position[0],
          y: position[1],
          z: position[2],
          duration: 1.5,
          ease: "power4.out"
        });
      } else {
        gsap.to(meshRef.current.position, {
          x: position[0] * 2.5,
          y: -0.4,
          z: position[2] * 2.5,
          duration: 1.2,
          ease: "expo.out"
        });
      }
    }
  }, [isAssembled, position]);

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 });
  const [assembled, setAssembled] = useState(false);
  
  const thicknessMeters = dim.t * 0.0254;

  // Calculation Logic
  const getBalance = (cut: number) => {
    const bal = 8 - cut;
    return bal > 0 ? bal.toFixed(2) : "0.00";
  };

  // 3D Positions
  const topPos: [number, number, number] = [0, dim.h * 0.3, 0];
  const legH = (dim.h * 0.3) / 2;
  const legs = [
    { pos: [ (dim.w*0.3)/2 - 0.1, legH,  (dim.d*0.3)/2 - 0.1] },
    { pos: [-(dim.w*0.3)/2 + 0.1, legH,  (dim.d*0.3)/2 - 0.1] },
    { pos: [ (dim.w*0.3)/2 - 0.1, legH, -(dim.d*0.3)/2 + 0.1] },
    { pos: [-(dim.w*0.3)/2 + 0.1, legH, -(dim.d*0.3)/2 + 0.1] },
  ];

  return (
    <div className="flex flex-col md:flex-row w-screen h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 p-6 bg-[#1e293b] border-r border-slate-700 overflow-y-auto z-20 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Box className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white">PLY-MAX <span className="text-blue-500">3D</span></h1>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">Table Dimensions (Feet)</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries({ L: 'w', H: 'h', W: 'd' }).map(([label, key]) => (
                <div key={key} className="bg-[#0f172a] p-3 rounded-lg border border-slate-700">
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">{label}</label>
                  <input 
                    type="number" 
                    value={(dim as any)[key]} 
                    onChange={(e) => setDim({...dim, [key]: Number(e.target.value)})}
                    className="w-full bg-transparent text-white font-bold outline-none focus:text-blue-400"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-600/10 p-5 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-4 text-blue-400">
              <Scissors size={16} />
              <h2 className="text-xs font-bold uppercase tracking-wider">Plywood Optimization</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-400">Cut: {dim.w}'</span>
                <span className="text-xs text-slate-400 font-mono">Balance: <span className="text-green-400 font-bold text-sm">{getBalance(dim.w)}'</span></span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div style={{ width: `${(dim.w / 8) * 100}%` }} className="h-full bg-blue-500" />
                <div className="h-full flex-1 bg-green-500/30" />
              </div>
            </div>
          </section>

          <button 
            onClick={() => setAssembled(!assembled)}
            className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all transform active:scale-95 ${
              assembled ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500'
            }`}
          >
            {assembled ? 'Explode View' : 'Assemble Now'}
          </button>
        </div>
      </div>

      {/* 3D VIEWPORT */}
      <div className="flex-1 relative bg-[#0f172a]">
        {/* Overlay Info */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Est. Material</p>
            <p className="text-lg font-black text-white">{Math.ceil(((dim.w*dim.d) + (dim.w*dim.h*2) + (dim.d*dim.h*2)) / 32)} <span className="text-xs text-slate-500 font-normal">Sheets</span></p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <FileText className="text-blue-500" size={24} />
        </div>

        {/* The 3D Engine */}
        <div className="w-full h-full">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[5, 4, 5]} fov={35} />
            <ambientLight intensity={0.8} />
            <spotLight position={[10, 15, 10]} angle={0.25} penumbra={1} castShadow />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
              <group position={[0, -0.5, 0]}>
                <TablePiece 
                  position={topPos} 
                  args={[dim.w * 0.3, thicknessMeters, dim.d * 0.3]} 
                  color="#d9a066" 
                  isAssembled={assembled} 
                />
                {legs.map((leg, i) => (
                  <TablePiece 
                    key={i}
                    position={leg.pos} 
                    args={[0.12, dim.h * 0.3, 0.12]} 
                    color="#8b5a2b" 
                    isAssembled={assembled} 
                  />
                ))}
              </group>
              <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={15} blur={2.5} far={4} />
            </Suspense>

            <OrbitControls enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 1.8} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default WoodEstimate;
