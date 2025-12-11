'use client'

import { useState } from 'react'
import { ethersClient } from '@/lib/ethers-simple'

export function EthersDemo() {
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)

  const connect = async () => {
    setLoading(true)
    try {
      const addr = await ethersClient.connect()
      setAddress(addr)
      const bal = await ethersClient.getBalance(addr)
      setBalance(bal)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const sendTest = async () => {
    if (!address) return
    setLoading(true)
    try {
      const hash = await ethersClient.sendETH(address, '0.001')
      console.log('TX Hash:', hash)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const sign = async () => {
    setLoading(true)
    try {
      const signature = await ethersClient.signMessage('Hello Ethers!')
      console.log('Signature:', signature)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Simple Ethers.js</h3>
      
      {!address ? (
        <button
          onClick={connect}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Connecting...' : 'Connect Ethers'}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">Address: {address.slice(0, 6)}...{address.slice(-4)}</p>
          <p className="text-sm">Balance: {parseFloat(balance).toFixed(4)} ETH</p>
          
          <div className="flex gap-2">
            <button
              onClick={sendTest}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Send Test
            </button>
            <button
              onClick={sign}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Sign Message
            </button>
          </div>
        </div>
      )}
    </div>
  )
}