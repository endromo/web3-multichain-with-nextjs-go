package protocols

import (
	"math/big"
	"sort"
	"web3-wallet-backend/internal/config"

	"github.com/ethereum/go-ethereum/common"
)

type ProtocolType string

const (
	ProtocolTypeLending       ProtocolType = "LENDING"
	ProtocolTypeDEX           ProtocolType = "DEX"
	ProtocolTypeYield         ProtocolType = "YIELD"
	ProtocolTypeLiquidStaking ProtocolType = "LIQUID_STAKING"
	ProtocolTypeDerivative    ProtocolType = "DERIVATIVE"
)

type Token struct {
	Address  common.Address
	Symbol   string
	Decimals int64
	PriceUSD float64
	ChainID  int64
}

type Pool struct {
	ID              string
	Protocol        string
	ProtocolType    ProtocolType
	ChainID         int64
	Address         common.Address
	Token0          Token
	Token1          Token
	APY             float64
	TVL             float64
	RiskScore       int
	DepositedAmount *big.Int
	RewardTokens    []Token
}

type ProtocolManager struct {
	chains map[int64][]Pool
}

func NewProtocolManager() *ProtocolManager {
	return &ProtocolManager{
		chains: make(map[int64][]Pool),
	}
}

// Scan protocols on all chains
func (pm *ProtocolManager) ScanAllChains() error {
	for chainID := range config.Chains {
		pools, err := pm.scanChain(chainID)
		if err != nil {
			continue // Log error but continue with other chains
		}
		pm.chains[chainID] = pools
	}
	return nil
}

func (pm *ProtocolManager) scanChain(chainID int64) ([]Pool, error) {
	var pools []Pool

	// Scan Aave
	aavePools, err := pm.scanAave(chainID)
	if err == nil {
		pools = append(pools, aavePools...)
	}

	// TODO: Implement other protocol scanners
	// - Compound
	// - Yearn
	// - Curve

	return pools, nil
}

func (pm *ProtocolManager) GetOptimalYield(chainID int64, amount *big.Int, riskTolerance int) ([]Pool, error) {
	pools := pm.chains[chainID]

	var suitablePools []Pool
	for _, pool := range pools {
		if pool.RiskScore <= riskTolerance && pool.APY > 0 {
			// Calculate expected yield
			suitablePools = append(suitablePools, pool)
		}
	}

	// Sort by APY adjusted for risk
	sort.Slice(suitablePools, func(i, j int) bool {
		return (suitablePools[i].APY / float64(suitablePools[i].RiskScore)) >
			(suitablePools[j].APY / float64(suitablePools[j].RiskScore))
	})

	return suitablePools, nil
}

// Aave implementation example
func (pm *ProtocolManager) scanAave(chainID int64) ([]Pool, error) {
	var pools []Pool

	// Aave V3 addresses by chain
	aaveAddresses := map[int64]string{
		1:     "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Ethereum
		137:   "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Polygon
		42161: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Arbitrum
	}

	_, exists := aaveAddresses[chainID]
	if !exists {
		return pools, nil
	}

	// TODO: Connect to Aave protocol and fetch pools
	// This would use Aave's contract ABIs to fetch data

	return pools, nil
}
