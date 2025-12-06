package prices

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/ethereum/go-ethereum/common"
)

type PriceSource string

const (
	SourceCoingecko     PriceSource = "COINGECKO"
	SourceCoinMarketCap PriceSource = "COINMARKETCAP"
	SourceDefiLlama     PriceSource = "DEFILLAMA"
	SourceChainlink     PriceSource = "CHAINLINK"
)

type TokenPrice struct {
	TokenAddress common.Address
	Symbol       string
	PriceUSD     float64
	Source       PriceSource
	Timestamp    time.Time
	ChainID      int64
	Confidence   float64 // 0-1 confidence score
}

type PriceOracle struct {
	sources  []PriceSource
	cache    map[string]TokenPrice
	cacheTTL time.Duration
}

func NewPriceOracle() *PriceOracle {
	return &PriceOracle{
		sources: []PriceSource{
			SourceChainlink,
			SourceCoingecko,
			SourceDefiLlama,
		},
		cache:    make(map[string]TokenPrice),
		cacheTTL: 30 * time.Second,
	}
}

func (po *PriceOracle) GetTokenPrice(chainID int64, tokenAddress common.Address) (float64, error) {
	cacheKey := fmt.Sprintf("%d-%s", chainID, tokenAddress.Hex())

	// Check cache
	if price, exists := po.cache[cacheKey]; exists {
		if time.Since(price.Timestamp) < po.cacheTTL {
			return price.PriceUSD, nil
		}
	}

	// Try Chainlink first (most reliable for major tokens)
	price, err := po.getChainlinkPrice(chainID, tokenAddress)
	if err == nil {
		po.cache[cacheKey] = price
		return price.PriceUSD, nil
	}

	// Fallback to Coingecko
	price, err = po.getCoingeckoPrice(chainID, tokenAddress)
	if err == nil {
		po.cache[cacheKey] = price
		return price.PriceUSD, nil
	}

	// Fallback to DefiLlama
	price, err = po.getDefiLlamaPrice(chainID, tokenAddress)
	if err == nil {
		po.cache[cacheKey] = price
		return price.PriceUSD, nil
	}

	return 0, fmt.Errorf("unable to fetch price for token")
}

func (po *PriceOracle) getChainlinkPrice(chainID int64, tokenAddress common.Address) (TokenPrice, error) {
	// Implementation for Chainlink price feeds
	// This would interact with Chainlink aggregator contracts

	return TokenPrice{}, fmt.Errorf("not implemented")
}

func (po *PriceOracle) getCoingeckoPrice(chainID int64, tokenAddress common.Address) (TokenPrice, error) {
	// Map chain ID to Coingecko platform ID
	platforms := map[int64]string{
		1:     "ethereum",
		137:   "polygon-pos",
		42161: "arbitrum-one",
		10:    "optimistic-ethereum",
	}

	platform, exists := platforms[chainID]
	if !exists {
		return TokenPrice{}, fmt.Errorf("chain not supported by Coingecko")
	}

	url := fmt.Sprintf("https://api.coingecko.com/api/v3/coins/%s/contract/%s", platform, tokenAddress.Hex())

	resp, err := http.Get(url)
	if err != nil {
		return TokenPrice{}, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return TokenPrice{}, err
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return TokenPrice{}, err
	}

	if marketData, ok := data["market_data"].(map[string]interface{}); ok {
		if currentPrice, ok := marketData["current_price"].(map[string]interface{}); ok {
			if usdPrice, ok := currentPrice["usd"].(float64); ok {
				return TokenPrice{
					TokenAddress: tokenAddress,
					PriceUSD:     usdPrice,
					Source:       SourceCoingecko,
					Timestamp:    time.Now(),
					ChainID:      chainID,
					Confidence:   0.95,
				}, nil
			}
		}
	}

	return TokenPrice{}, fmt.Errorf("price not found in response")
}

func (po *PriceOracle) GetAPY(protocol string, poolAddress common.Address, chainID int64) (float64, error) {
	// Map chainID to chain name for DefiLlama
	chainNames := map[int64]string{
		1:     "Ethereum",
		137:   "Polygon",
		42161: "Arbitrum",
		10:    "Optimism",
	}

	chainName, exists := chainNames[chainID]
	if !exists {
		return 0, fmt.Errorf("unsupported chain ID: %d", chainID)
	}

	// Fetch APY from DefiLlama
	url := fmt.Sprintf("https://yields.llama.fi/pools")

	resp, err := http.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var response struct {
		Data []struct {
			Chain   string  `json:"chain"`
			Project string  `json:"project"`
			APY     float64 `json:"apy"`
			TVL     float64 `json:"tvlUsd"`
			Address string  `json:"address"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return 0, err
	}

	for _, pool := range response.Data {
		if pool.Chain == chainName && pool.Address == poolAddress.Hex() {
			return pool.APY, nil
		}
	}

	return 0, fmt.Errorf("APY not found")
}

func (po *PriceOracle) getDefiLlamaPrice(chainID int64, tokenAddress common.Address) (TokenPrice, error) {
	// Map chainID to DefiLlama chain identifier
	chainNames := map[int64]string{
		1:     "ethereum",
		137:   "polygon",
		42161: "arbitrum",
		10:    "optimism",
	}

	chainName, exists := chainNames[chainID]
	if !exists {
		return TokenPrice{}, fmt.Errorf("chain not supported by DefiLlama")
	}

	url := fmt.Sprintf("https://coins.llama.fi/prices/current/%s:%s", chainName, tokenAddress.Hex())

	resp, err := http.Get(url)
	if err != nil {
		return TokenPrice{}, err
	}
	defer resp.Body.Close()

	var response struct {
		Coins map[string]struct {
			Price     float64 `json:"price"`
			Symbol    string  `json:"symbol"`
			Timestamp int64   `json:"timestamp"`
		} `json:"coins"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return TokenPrice{}, err
	}

	key := fmt.Sprintf("%s:%s", chainName, tokenAddress.Hex())
	if coin, ok := response.Coins[key]; ok {
		return TokenPrice{
			TokenAddress: tokenAddress,
			Symbol:       coin.Symbol,
			PriceUSD:     coin.Price,
			Source:       SourceDefiLlama,
			Timestamp:    time.Now(),
			ChainID:      chainID,
			Confidence:   0.90,
		}, nil
	}

	return TokenPrice{}, fmt.Errorf("price not found")
}
