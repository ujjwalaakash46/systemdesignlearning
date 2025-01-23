import { useState } from 'react'

import './App.css'
import CodeFlow from './components/codeflow/CodeFlow'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="bg-gray-800 h-screen w-screen">

        {/* <h1 className="text-3xl font-bold">
          Hello world! UA
        </h1> */}
      <div className="w-4/5 h-[600px] mx-auto">
        <CodeFlow></CodeFlow>
      </div>
    </div>
  )
}

export default App
