'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import axios from 'axios'

export function TenderlySimulation() {
  const { address } = useAccount()
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runSimulation = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      const response = await axios.post('/api/tenderly/simulate', {
        network_id: '1',
        from: address,
        to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT contract
        input: '0x70a08231000000000000000000000000' + address.slice(2), // balanceOf
        value: '0',
        save: true
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': process.env.NEXT_PUBLIC_TENDERLY_ACCESS_KEY
        }
      })
      
      setSimulationResult(response.data)
    } catch (error) {
      console.error('Simulation error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tenderly Simulation</h2>
      <p className="text-gray-400">
        Simulate transactions before executing them on-chain
      </p>
      
      <button
        onClick={runSimulation}
        disabled={loading || !address}
        className="bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold transition-all w-full"
      >
        {loading ? 'Simulating...' : 'Simulate Balance Check'}
      </button>

      {simulationResult && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-bold mb-2">Simulation Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(simulationResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}