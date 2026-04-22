import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Table Component ---
const TableModel = ({ width, height, depth, thickness }: any) => {
  // Convert Feet to Meters for 3D scaling (1ft approx 0.3m)
  const w = width * 0.3;
  const h = height * 0.3;
  const d = depth * 0.3;
  const t = thickness * 0.0254; // inches to meters

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={[0, -h / 2, 0]}>
        {/* Table Top */}
        <mesh position={[0, h, 0]}>
          <boxGeometry args={[w, t, d]} />
          <meshStandardMaterial color="#b5835a" roughness={0.3} />
        </mesh>
        {/* Legs */}
        {[[w/2-t, d/2-t], [-w/2+t, d/2-t], [w/2-t, -d/2+t], [-w/2+t, -d/2+t]].map((pos, i) => (
          <mesh key={i} position={[pos[0], h/2, pos[1]]}>
            <boxGeometry args={[t*2, h, t*2]} />
            <meshStandardMaterial color="#8b5a2b" />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

const WoodEstimate = () => {
  const [dim, setDim] = useState({ w: 4, h: 4, d: 4, t: 0.75 }); // in feet/inches
  const sheetSize = { w: 8, h: 4 };

  // --- Logic: 4' la 6" cut panna balance 3.5' varanum ---
  const calculateBalance = (original: number, cut: number) => {
    return (original - cut).toFixed(2);
  };

  const topArea = dim.w * dim.d;
  const totalAreaReq = topArea + (dim.h * dim.w * 2) + (dim.h * dim.d * 2);
  const sheetsNeeded = Math.ceil(totalAreaReq / (sheetSize.w * sheetSize.h));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white font-sans">
      
      {/* Left Side: Controls & Logic */}
      <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-gray-700 bg-gray-800">
        <h1 className="text-2xl font-bold mb-6 text-yellow-500">Plywood 3D Estimator</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm">Table Width (ft)</label>
            <input type="number" value={dim.w} onChange={(e) => setDim({...dim, w: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700 mt-1" />
          </div>
          <div>
            <label className="block text-sm">Table Height (ft)</label>
            <input type="number" value={dim.h} onChange={(e) => setDim({...dim, h: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700 mt-1" />
          </div>
          <div>
            <label className="block text-sm">Table Depth (ft)</label>
            <input type="number" value={dim.d} onChange={(e) => setDim({...dim, d: Number(e.target.value)})} className="w-full p-2 rounded bg-gray-700 mt-1" />
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-yellow-600/30">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">Cutting Optimization</h2>
          <p className="text-sm text-gray-400 mb-4">Sheet Size: 8' x 4'</p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-gray-700 pb-1">
              <span>Main Cut (Width):</span>
              <span className="text-green-400">{dim.w}'</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-1 font-bold">
              <span>Balance in Sheet:</span>
              <span className="text-yellow-400">{calculateBalance(8, dim.w)}' Remaining</span>
            </div>
            <div className="mt-4 pt-2 text-center bg-yellow-600/20 p-2 rounded">
              <p className="text-xs uppercase tracking-widest text-gray-300">Total Sheets Required</p>
              <p className="text-3xl font-black">{sheetsNeeded}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: 3D Visualization */}
      <div className="w-full md:w-2/3 relative">
        <div className="absolute top-4 left-4 z-10 bg-black/50 p-2 rounded text-xs text-gray-300">
           Interact to Rotate (360°)
        </div>
        
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 35 }}>
          <color attach="background" args={['#111827']} />
          <Suspense fallback={null}>
            <Environment preset="forest" />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
            
            <TableModel width={dim.w} height={dim.h} depth={dim.d} thickness={dim.t} />
            
            <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default WoodEstimate;
