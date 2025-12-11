import { ethers } from 'ethers'

// Simple Ethers.js implementation
export class SimpleEthers {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  async connect(): Promise<string> {
    if (!window.ethereum) throw new Error('MetaMask not found')
    
    this.provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await this.provider.getSigner()
    return await this.signer.getAddress()
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Not connected')
    const balance = await this.provider.getBalance(address)
    return ethers.formatEther(balance)
  }

  async sendETH(to: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Not connected')
    const tx = await this.signer.sendTransaction({
      to,
      value: ethers.parseEther(amount)
    })
    return tx.hash
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) throw new Error('Not connected')
    return await this.signer.signMessage(message)
  }
}

export const ethersClient = new SimpleEthers()