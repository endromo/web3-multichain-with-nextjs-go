package config

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/ethclient"
)

type ChainConfig struct {
	ChainID               int64
	Name                  string
	RPCURL                string
	WSURL                 string
	BlockExplorer         string
	NativeToken           string
	SupportedProtocols    []string
	MaxGasPriceGwei       float64
	AverageBlockTime      time.Duration
	ConfirmationsRequired int
	ChainType             string // EVM, L2, L1
}

var Chains = map[int64]ChainConfig{
	1: { // Ethereum
		ChainID:               1,
		Name:                  "Ethereum",
		RPCURL:                "https://eth-mainnet.g.alchemy.com/v2/%s",
		WSURL:                 "wss://eth-mainnet.g.alchemy.com/v2/%s",
		NativeToken:           "ETH",
		SupportedProtocols:    []string{"Aave", "Compound", "Yearn", "Lido", "RocketPool"},
		MaxGasPriceGwei:       100,
		AverageBlockTime:      12 * time.Second,
		ConfirmationsRequired: 12,
		ChainType:             "L1",
	},
	137: { // Polygon
		ChainID:               137,
		Name:                  "Polygon",
		RPCURL:                "https://polygon-mainnet.g.alchemy.com/v2/%s",
		NativeToken:           "MATIC",
		SupportedProtocols:    []string{"Aave", "Curve", "Balancer", "QuickSwap"},
		MaxGasPriceGwei:       500,
		AverageBlockTime:      2 * time.Second,
		ConfirmationsRequired: 64,
		ChainType:             "L2",
	},
	42161: { // Arbitrum
		ChainID:               42161,
		Name:                  "Arbitrum",
		RPCURL:                "https://arb-mainnet.g.alchemy.com/v2/%s",
		NativeToken:           "ETH",
		SupportedProtocols:    []string{"GMX", "Radiant", "JonesDAO", "Socket"},
		MaxGasPriceGwei:       0.1,
		AverageBlockTime:      250 * time.Millisecond,
		ConfirmationsRequired: 20,
		ChainType:             "L2",
	},
	10: { // Optimism
		ChainID:               10,
		Name:                  "Optimism",
		RPCURL:                "https://opt-mainnet.g.alchemy.com/v2/%s",
		NativeToken:           "ETH",
		SupportedProtocols:    []string{"Aave", "Velodrome", "Beefy", "Stargate"},
		MaxGasPriceGwei:       0.001,
		AverageBlockTime:      2 * time.Second,
		ConfirmationsRequired: 20,
		ChainType:             "L2",
	},
}

type ChainManager struct {
	Clients      map[int64]*ethclient.Client
	WSClient     map[int64]*ethclient.Client
	ChainConfigs map[int64]ChainConfig
}

func NewChainManager() *ChainManager {
	cm := &ChainManager{
		Clients:      make(map[int64]*ethclient.Client),
		WSClient:     make(map[int64]*ethclient.Client),
		ChainConfigs: Chains,
	}

	// Initialize all chain connections
	for chainID, config := range Chains {
		rpcURL := config.RPCURL
		if config.RPCURL != "" {
			client, err := ethclient.Dial(rpcURL)
			if err == nil {
				cm.Clients[chainID] = client
			}
		}

		if config.WSURL != "" {
			wsClient, err := ethclient.Dial(config.WSURL)
			if err == nil {
				cm.WSClient[chainID] = wsClient
			}
		}
	}

	return cm
}

func (cm *ChainManager) GetClient(chainID int64) (*ethclient.Client, error) {
	if client, exists := cm.Clients[chainID]; exists {
		return client, nil
	}
	return nil, fmt.Errorf("no client for chain %d", chainID)
}

func (cm *ChainManager) GetGasPrice(chainID int64) (*big.Int, error) {
	client, err := cm.GetClient(chainID)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	return client.SuggestGasPrice(ctx)
}
