package database

import (
	"fmt"
)

type Database struct {
	// TODO: Add actual database connection (PostgreSQL, etc.)
}

type UserStrategy struct {
	ID          string
	UserAddress string
	StrategyID  string
	Amount      string
	CreatedAt   int64
}

func NewDatabase() *Database {
	return &Database{}
}

func (db *Database) GetUserStrategies(address string) ([]UserStrategy, error) {
	// TODO: Implement actual database query
	// This is a placeholder implementation
	return []UserStrategy{}, nil
}

func (db *Database) Close() error {
	// TODO: Implement actual database connection close
	return nil
}

func (db *Database) SaveStrategy(strategy UserStrategy) error {
	// TODO: Implement actual database save
	return fmt.Errorf("not implemented")
}
