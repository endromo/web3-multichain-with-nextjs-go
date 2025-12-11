import { ethers } from 'ethers'
import Web3 from 'web3'
import { createPublicClient, createWalletClient, custom, http, formatEther, parseEther } from 'viem'
import { mainnet, polygon, arbitrum, optimism } from 'viem/chains'

// Chain configurations
export const SUPPORTED_CHAINS = {
  ethereum: { id: 1, name: 'Ethereum', rpc: 'https://eth-mainnet.g.alchemy.com/v2/' },
  polygon: { id: 137, name: 'Polygon', rpc: 'https://polygon-mainnet.g.alchemy.com/v2/' },
  arbitrum: { id: 42161, name: 'Arbitrum', rpc: 'https://arb-mainnet.g.alchemy.com/v2/' },
  optimism: { id: 10, name: 'Optimism', rpc: 'https://opt-mainnet.g.alchemy.com/v2/' }
}

// Ethers.js Provider Factory
export class EthersProvider {
  private provider: ethers.JsonRpcProvider
  private signer?: ethers.Signer

  constructor(chainId: number = 1, apiKey?: string) {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId)
    const rpcUrl = chain ? `${chain.rpc}${apiKey || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : ''
    this.provider = new ethers.JsonRpcProvider(rpcUrl)
  }

  async connectWallet(): Promise<ethers.Signer | null> {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await provider.getSigner()
      return this.signer
    }
    return null
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address)
    return formatEther(balance)
  }

  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected')
    
    const tx = await this.signer.sendTransaction({
      to,
      value: parseEther(value),
      data: data || '0x'
    })
    return tx.hash
  }

  async callContract(contractAddress: string, abi: any[], method: string, params: any[] = []): Promise<any> {
    const contract = new ethers.Contract(contractAddress, abi, this.provider)
    return await contract[method](...params)
  }

  async writeContract(contractAddress: string, abi: any[], method: string, params: any[] = []): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected')
    
    const contract = new ethers.Contract(contractAddress, abi, this.signer)
    const tx = await contract[method](...params)
    return tx.hash
  }
}

// Web3.js Provider Factory
export class Web3Provider {
  private web3: Web3
  private account?: string

  constructor(chainId: number = 1, apiKey?: string) {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId)
    const rpcUrl = chain ? `${chain.rpc}${apiKey || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : ''
    this.web3 = new Web3(rpcUrl)
  }

  async connectWallet(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3.setProvider(window.ethereum)
      const accounts = await this.web3.eth.requestAccounts()
      this.account = accounts[0]
      return this.account
    }
    return null
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.web3.eth.getBalance(address)
    return this.web3.utils.fromWei(balance, 'ether')
  }

  async sendTransaction(to: string, value: string, data?: string): Promise<string> {
    if (!this.account) throw new Error('Wallet not connected')
    
    const tx = await this.web3.eth.sendTransaction({
      from: this.account,
      to,
      value: this.web3.utils.toWei(value, 'ether'),
      data: data || '0x'
    })
    return tx.transactionHash
  }

  async callContract(contractAddress: string, abi: any[], method: string, params: any[] = []): Promise<any> {
    const contract = new this.web3.eth.Contract(abi, contractAddress)
    return await contract.methods[method](...params).call()
  }

  async writeContract(contractAddress: string, abi: any[], method: string, params: any[] = []): Promise<string> {
    if (!this.account) throw new Error('Wallet not connected')
    
    const contract = new this.web3.eth.Contract(abi, contractAddress)
    const tx = await contract.methods[method](...params).send({ from: this.account })
    return tx.transactionHash
  }
}

// Viem Client Factory (Modern TypeScript approach)
export class ViemProvider {
  private publicClient: any
  private walletClient: any

  constructor(chainId: number = 1) {
    const chain = chainId === 1 ? mainnet : chainId === 137 ? polygon : chainId === 42161 ? arbitrum : optimism
    
    this.publicClient = createPublicClient({
      chain,
      transport: http()
    })
  }

  async connectWallet() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.walletClient = createWalletClient({
        transport: custom(window.ethereum)
      })
      const [account] = await this.walletClient.getAddresses()
      return account
    }
    return null
  }

  async getBalance(address: `0x${string}`): Promise<string> {
    const balance = await this.publicClient.getBalance({ address })
    return formatEther(balance)
  }

  async sendTransaction(to: `0x${string}`, value: string): Promise<string> {
    if (!this.walletClient) throw new Error('Wallet not connected')
    
    const [account] = await this.walletClient.getAddresses()
    const hash = await this.walletClient.sendTransaction({
      account,
      to,
      value: parseEther(value)
    })
    return hash
  }
}

// Utility Functions
export const web3Utils = {
  // Format addresses
  formatAddress: (address: string, chars: number = 4): string => {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
  },

  // Validate Ethereum address
  isValidAddress: (address: string): boolean => {
    return ethers.isAddress(address)
  },

  // Convert Wei to Ether
  weiToEther: (wei: string): string => {
    return formatEther(BigInt(wei))
  },

  // Convert Ether to Wei
  etherToWei: (ether: string): string => {
    return parseEther(ether).toString()
  },

  // Get chain name by ID
  getChainName: (chainId: number): string => {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId)
    return chain?.name || 'Unknown'
  },

  // Generate random wallet (for testing)
  generateWallet: (): { address: string; privateKey: string } => {
    const wallet = ethers.Wallet.createRandom()
    return {
      address: wallet.address,
      privateKey: wallet.privateKey
    }
  },

  // Sign message
  signMessage: async (message: string, privateKey: string): Promise<string> => {
    const wallet = new ethers.Wallet(privateKey)
    return await wallet.signMessage(message)
  },

  // Verify signature
  verifySignature: (message: string, signature: string, address: string): boolean => {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature)
      return recoveredAddress.toLowerCase() === address.toLowerCase()
    } catch {
      return false
    }
  }
}

// ERC-20 Token Interface
export interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
}

// ERC-20 Token Helper
export class ERC20Token {
  private provider: EthersProvider
  private contractAddress: string
  private abi = [
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)'
  ]

  constructor(contractAddress: string, chainId: number = 1) {
    this.provider = new EthersProvider(chainId)
    this.contractAddress = contractAddress
  }

  async getTokenInfo(): Promise<TokenInfo> {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.provider.callContract(this.contractAddress, this.abi, 'name'),
      this.provider.callContract(this.contractAddress, this.abi, 'symbol'),
      this.provider.callContract(this.contractAddress, this.abi, 'decimals'),
      this.provider.callContract(this.contractAddress, this.abi, 'totalSupply')
    ])

    return { address: this.contractAddress, name, symbol, decimals, totalSupply: totalSupply.toString() }
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.callContract(this.contractAddress, this.abi, 'balanceOf', [address])
    return balance.toString()
  }

  async transfer(to: string, amount: string): Promise<string> {
    return await this.provider.writeContract(this.contractAddress, this.abi, 'transfer', [to, amount])
  }

  async approve(spender: string, amount: string): Promise<string> {
    return await this.provider.writeContract(this.contractAddress, this.abi, 'approve', [spender, amount])
  }
}

// Export provider instances
export const ethersProvider = new EthersProvider()
export const web3Provider = new Web3Provider()
export const viemProvider = new ViemProvider()