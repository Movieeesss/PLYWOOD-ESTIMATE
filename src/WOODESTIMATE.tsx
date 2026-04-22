import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { gsap } from 'gsap';
import { LayoutGrid, Box, Scissors, FileText } from 'lucide-react';

const TablePiece = ({ position, args, color, isAssembled }: any) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (isAssembled) {
      // Assemble Animation: Pieces fly from floor to position
      gsap.to(meshRef.current.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1.5,
        ease: "power4.out"
      });
    } else {
      // Disassemble: Spread on floor
      gsap.to(meshRef.current.position, {
        x: position[0] * 2,
        y: -0.5,
        z: position[2] * 2,
        duration: 1,
        ease: "bounce.out"
      });
    }
  }, [isAssembled, position]);

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.4} 
        metalness={0.1}
      />
    </mesh>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 2.5, d: 2, t: 0.75 }); // Feet and Inches
  const [assembled, setAssembled] = useState(false);
  
  const sheet = { w: 8, h: 4 };
  const thicknessMeters = dim.t * 0.0254; // inch to meter

  // --- Manual Cutting Logic ---
  const getBalance = (cut: number) => {
    const bal = sheet.w - cut;
    return bal > 0 ? bal.toFixed(2) : "No space";
  };

  // 3D Positions (Calculated based on Feet)
  const topPos: [number, number, number] = [0, dim.h * 0.3, 0];
  const legH = (dim.h * 0.3) / 2;
  const legs = [
    { pos: [ (dim.w*0.3)/2 - 0.1, legH,  (dim.d*0.3)/2 - 0.1] },
    { pos: [-(dim.w*0.3)/2 + 0.1, legH,  (dim.d*0.3)/2 - 0.1] },
    { pos: [ (dim.w*0.3)/2 - 0.1, legH, -(dim.d*0.3)/2 + 0.1] },
    { pos: [-(dim.w*0.3)/2 + 0.1, legH, -(dim.d*0.3)/2 + 0.1] },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar Controls */}
      <div className="w-full md:w-80 p-6 bg-[#1e293b] border-r border-slate-700 overflow-y-auto shadow-xl z-20">
        <div className="flex items-center gap-2 mb-8">
          <Box className="text-blue-400" size={28} />
          <h1 className="text-xl font-bold tracking-tight">PLY-MAX 3D</h1>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xs font-semibold uppercase text-slate-500 mb-4 tracking-widest">Dimensions (Feet)</h2>
            <div className="grid grid-cols-2 gap-4">
              {['w', 'h', 'd'].map((key) => (
                <div key={key}>
                  <label className="text-[10px] uppercase ml-1">{key === 'w' ? 'Length' : key === 'h' ? 'Height' : 'Width'}</label>
                  <input 
                    type="number" 
                    value={(dim as any)[key]} 
                    onChange={(e) => setDim({...dim, [key]: Number(e.target.value)})}
                    className="w-full bg-[#0f172a] border border-slate-700 p-2 rounded-md focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0f172a] p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Scissors size={18} />
              <h2 className="font-semibold">Cut Optimizer</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sheet Size:</span>
                <span>8' x 4'</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Current Cut:</span>
                <span className="text-yellow-400">{dim.w}'</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                <span>Remaining:</span>
                <span className="text-green-400">{getBalance(dim.w)}'</span>
              </div>
            </div>
          </section>

          <button 
            onClick={() => setAssembled(!assembled)}
            className={`w-full py-3 rounded-lg font-bold transition-all ${assembled ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
          >
            {assembled ? 'EXPLODE VIEW' : 'ASSEMBLE TABLE'}
          </button>
        </div>
      </div>

      {/* 3D Visualizer Area */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing">
        <div className="absolute bottom-6 right-6 z-10 flex gap-3">
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 flex items-center gap-4">
                <div className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase">Est. Sheets</p>
                    <p className="text-xl font-bold text-white">
                        {Math.ceil(((dim.w*dim.d) + (dim.w*dim.h*2) + (dim.d*dim.h*2)) / 32)}
                    </p>
                </div>
                <button className="p-2 bg-white/10 rounded hover:bg-white/20 transition-colors">
                    <FileText size={20} />
                </button>
            </div>
        </div>

        <Canvas shadows className="bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
          <PerspectiveCamera makeDefault position={[6, 4, 6]} fov={40} />
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} castShadow />
          <Environment preset="apartment" />
          
          <Suspense fallback={null}>
            {/* Table Top */}
            <TablePiece 
              position={topPos} 
              args={[dim.w * 0.3, thicknessMeters, dim.d * 0.3]} 
              color="#d9a066" 
              isAssembled={assembled} 
            />
            
            {/* Legs */}
            {legs.map((leg, i) => (
              <TablePiece 
                key={i}
                position={leg.pos} 
                args={[0.15, dim.h * 0.3, 0.15]} 
                color="#8b5a2b" 
                isAssembled={assembled} 
              />
            ))}

            <ContactShadows 
              position={[0, -0.5, 0]} 
              opacity={0.5} 
              scale={20} 
              blur={2.5} 
              far={4} 
            />
          </Suspense>

          <OrbitControls 
            enableDamping 
            maxPolarAngle={Math.PI / 2} 
            minDistance={3} 
            maxDistance={15} 
          />
        </Canvas>
      </div>
    </div>
  );
};

export default WoodEstimate;
