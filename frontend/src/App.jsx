import React from 'react'
import SchemaBuilder from '@/components/SchemaBuilder'
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <div className="App">
      <SchemaBuilder />
      <Toaster />
    </div>
  )
}

export default App