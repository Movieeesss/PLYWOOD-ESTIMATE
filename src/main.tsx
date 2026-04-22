import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import WoodEstimate from './WOODESTIMATE' // Exact Case Match (Capital Letters)
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={
      <div className="h-screen w-full bg-[#0f172a] flex flex-col items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-400 animate-pulse">Initializing 3D Engine...</p>
      </div>
    }>
      <WoodEstimate />
    </Suspense>
  </React.StrictMode>,
)
