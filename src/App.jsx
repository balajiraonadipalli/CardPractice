import React, { useState } from 'react'
import "./App.css"
const App = () => {
  const [num,setNum] = useState("");
  const [error,setError] = useState(false);
  return (
    <>
  <div className='flex'>
    <div className='border-2 border-white h-45 w-60 px-8 m-8 radius rounded-2xl'>
    <div>
    <p >
      
      <pre className='text-white top-17 relative'>
        {num.length <=16 ? num.padEnd(16, "X").replace(/(.{4})/g, "$1 ")
            : "XXXX XXXX XXXX XXXX"
        }
      </pre>
      
      
      <pre className='relative top-23 text-white flex justify-center'>
        Nadipalli Balaji rao
      </pre>
    </p>
    </div>
  </div>
  <div className='h-20 m-10 text-white'>
    <input placeholder='Enter the Card Number ' className='text-white px-3 ' onChange={(e)=>setNum(e.target.value)} type='number' maxLength={16} min={0} />
    {
      num.length>16?<p className='text-red-600'>
        You are exceeding the digits please verify them
      </p>:""
    }
  </div>
  </div>

    </>
  )
}

export default App
