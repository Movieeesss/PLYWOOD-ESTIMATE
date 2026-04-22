import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import WoodEstimate from './WOODESTIMATE' // Check this path carefully!
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="h-screen bg-slate-900 text-white flex items-center justify-center">Loading 3D Engine...</div>}>
      <WoodEstimate />
    </Suspense>
  </React.StrictMode>,
)
