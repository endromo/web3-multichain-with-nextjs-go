# Web3 Multichain Wallet Connect

A comprehensive Web3 application for connecting to multiple blockchain wallets across different chains with DeFi yield optimization features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/go-1.21-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14.0-black.svg)

## 🌟 Features

### 🔐 Multi-Wallet Support

- **MetaMask** - Most popular Ethereum wallet
- **WalletConnect** - Connect any mobile wallet
- **Coinbase Wallet** - Secure and user-friendly
- **Rainbow Wallet** - Beautiful and intuitive
- **Trust Wallet** - Mobile-first experience
- **Ledger** - Hardware wallet support

### ⛓️ Multi-Chain Support

- **Ethereum** (Mainnet) - L1 blockchain
- **Polygon** - Low-cost L2 solution
- **Arbitrum** - Optimistic rollup L2
- **Optimism** - Fast and cheap transactions
- **Base** - Coinbase L2 (coming soon)
- **BSC** - Binance Smart Chain (coming soon)

### 📊 DeFi Features

- **Yield Optimization** - Automated yield farming strategies
- **Protocol Integration** - Aave, Compound, Yearn, Curve
- **Real-time APY** - Live yield rates from DefiLlama
- **Portfolio Tracking** - Monitor your DeFi positions
- **Risk Analysis** - Assess strategy risk levels
- **Auto-Compounding** - Maximize returns automatically

### 🔍 Advanced Tools

- **Transaction Simulation** - Test before executing (Tenderly)
- **Gas Optimization** - Smart gas price monitoring
- **Price Oracles** - Multiple price feed sources
- **Multi-call** - Batch multiple transactions

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ RainbowKit   │  │  Wagmi/Viem  │  │   TanStack   │  │
│  │   Wallet UI  │  │   Web3 Hooks │  │    Query     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    REST API / WebSocket
                            │
┌─────────────────────────────────────────────────────────┐
│                    Backend (Go/Gin)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Chain      │  │  Protocol    │  │  Strategy    │  │
│  │   Manager    │  │   Manager    │  │  Optimizer   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Price      │  │   Database   │  │   Tenderly   │  │
│  │   Oracle     │  │   Layer      │  │  Simulator   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    Blockchain RPCs
                            │
┌─────────────────────────────────────────────────────────┐
│              Blockchain Networks & Protocols             │
│  Ethereum │ Polygon │ Arbitrum │ Optimism │ DeFi Pools  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Go** 1.21+
- **Docker** & Docker Compose (optional)

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/web3-wallet-connect.git
cd web3-wallet-connect
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in your API keys in `.env`:

```env
# Frontend
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key

# Backend
TENDERLY_ACCESS_KEY=your_tenderly_access_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

### Running with Docker (Recommended)

```bash
docker-compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Running Locally

#### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📖 Usage Guide

### 1. Connect Your Wallet

Click the **"Connect Wallet"** button and choose your preferred wallet:

```typescript
// Automatic wallet detection
import { ConnectButton } from "@rainbow-me/rainbowkit";

<ConnectButton />;
```

### 2. Select Network

Switch between supported networks:

- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism

### 3. View Portfolio

See your balances and positions across all chains:

```typescript
const { address } = useAccount();
const { data: balance } = useBalance({ address });
```

### 4. Create Yield Strategy

Choose a DeFi protocol and create an automated yield strategy:

```bash
POST /api/v1/strategy/create
{
  "name": "USDC Aave Strategy",
  "type": "AUTO_COMPOUND",
  "chainId": 1,
  "protocol": "Aave",
  "poolAddress": "0x...",
  "riskTolerance": 3,
  "minDeposit": "1000000000",
  "maxDeposit": "10000000000"
}
```

### 5. Simulate Transactions

Test transactions before executing:

```bash
POST /api/v1/simulate/transaction
{
  "from": "0x...",
  "to": "0x...",
  "data": "0x...",
  "value": "0",
  "chainId": 1
}
```

## 🔌 API Reference

### Chains & Networks

```bash
# Get supported chains
GET /api/v1/chains

# Get protocols for a chain
GET /api/v1/protocols/:chainId

# Get yield pools
GET /api/v1/pools/:chainId
```

### Strategies

```bash
# Create strategy
POST /api/v1/strategy/create

# Execute strategy
POST /api/v1/strategy/execute

# Get performance
GET /api/v1/strategy/:id/performance

# Harvest rewards
POST /api/v1/strategy/:id/harvest
```

### Portfolio

```bash
# Get portfolio overview
GET /api/v1/portfolio/:address

# Get yield summary
GET /api/v1/portfolio/:address/yield

# Get risk analysis
GET /api/v1/portfolio/:address/risk
```

### Prices & APY

```bash
# Get token price
GET /api/v1/price/:chainId/:tokenAddress

# Get pool APY
GET /api/v1/apy/:protocol/:poolAddress
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Web3 Libraries**:
  - wagmi - React Hooks for Ethereum
  - viem - TypeScript Ethereum library
  - RainbowKit - Wallet connection UI
- **State Management**: TanStack Query
- **HTTP Client**: Axios

### Backend

- **Language**: Go 1.21
- **Framework**: Gin (HTTP framework)
- **Blockchain**: go-ethereum (Geth)
- **Database**: PostgreSQL (optional)
- **APIs**:
  - Tenderly (simulation)
  - DefiLlama (APY data)
  - Coingecko (price feeds)
  - Alchemy/Infura (RPC nodes)

## 📁 Project Structure

```
web3-wallet-connect/
├── frontend/                 # Next.js frontend
│   ├── app/                 # App router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── api/             # API routes
│   ├── components/          # React components
│   │   ├── TenderlySimulation.tsx
│   │   └── YieldDashboard.tsx
│   ├── lib/                 # Utilities
│   │   └── providers.tsx    # Web3 providers
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                 # Go backend
│   ├── cmd/
│   │   └── server/
│   │       └── main.go      # Entry point
│   ├── internal/            # Internal packages
│   │   ├── config/          # Chain configs
│   │   │   └── chains.go
│   │   ├── database/        # Database layer
│   │   │   └── database.go
│   │   ├── prices/          # Price oracle
│   │   │   └── oracle.go
│   │   ├── protocols/       # DeFi protocols
│   │   │   └── manager.go
│   │   └── strategies/      # Yield strategies
│   │       └── engine.go
│   ├── pkg/                 # Public packages
│   ├── go.mod
│   └── Dockerfile
│
├── docker-compose.yml       # Docker orchestration
├── .env.example            # Environment template
└── README.md               # This file
```

## 🔒 Security

- **Private Keys**: Never stored on backend
- **Wallet Signing**: All transactions signed client-side
- **Simulation First**: Test transactions before execution
- **Rate Limiting**: API rate limits implemented
- **CORS**: Configured for security
- **Environment Variables**: Sensitive data in .env

## 🧪 Testing

### Backend Tests

```bash
cd backend
go test ./...
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
docker-compose -f docker-compose.test.yml up
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Docker)

```bash
cd backend
docker build -t web3-backend .
docker run -p 8080:8080 web3-backend
```

### Full Stack (Docker Compose)

```bash
docker-compose up -d
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [RainbowKit](https://www.rainbowkit.com/) - Wallet connection UI
- [wagmi](https://wagmi.sh/) - React Hooks for Ethereum
- [Tenderly](https://tenderly.co/) - Transaction simulation
- [DefiLlama](https://defillama.com/) - DeFi data
- [Alchemy](https://www.alchemy.com/) - Blockchain infrastructure

## 📧 Contact

- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)
- **Discord**: [Join our server](https://discord.gg/yourserver)

## 🗺️ Roadmap

- [x] Multi-chain wallet connection
- [x] Basic DeFi protocol integration
- [x] Transaction simulation
- [ ] Advanced yield strategies
- [ ] Mobile app (React Native)
- [ ] NFT portfolio tracking
- [ ] Cross-chain swaps
- [ ] DAO governance integration
- [ ] Social features (wallet following)

---

**Built with ❤️ for the Web3 community**
