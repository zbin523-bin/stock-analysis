import { BaseEntity, MarketType, TransactionType } from './common'

// 投资组合相关类型
export interface Portfolio extends BaseEntity {
  name: string
  description?: string
  isActive: boolean
  totalValue: number
  createdAt: string
  updatedAt: string

  // 关联
  userId: string
  positions: Position[]
  transactions: Transaction[]
}

// 持仓相关类型
export interface Position extends BaseEntity {
  quantity: number
  costPrice: number
  currentPrice: number
  marketValue: number
  profitAmount: number
  profitRate: number
  percentage: number
  lastUpdated: string

  // 关联
  portfolioId: string
  stockId: string
  transactions: Transaction[]
  stock: Stock
}

// 股票相关类型
export interface Stock extends BaseEntity {
  symbol: string
  name: string
  market: MarketType
  sector?: string
  industry?: string
  description?: string
  website?: string
  employees?: number
  founded?: string
  isActive: boolean
  currentPrice?: number
  priceChange?: number
  priceChangePercent?: number
  volume?: number
  marketCap?: number
  pe?: number
  pb?: number
  dividend?: number
  high52Week?: number
  low52Week?: number

  // 关联
  positions: Position[]
  transactions: Transaction[]
  watchlists: Watchlist[]
  priceHistory: PriceHistory[]
}

// 交易记录类型
export interface Transaction extends BaseEntity {
  type: TransactionType
  quantity: number
  price: number
  amount: number
  commission: number
  currency: string
  transactionDate: string
  note?: string
  status: string

  // 关联
  portfolioId: string
  stockId: string
  positionId?: string
  userId: string
  stock: Stock
  position?: Position
}

// 自选股类型
export interface Watchlist extends BaseEntity {
  // 关联
  userId: string
  stockId: string
  stock: Stock
}

// 价格历史类型
export interface PriceHistory extends BaseEntity {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume: number

  // 关联
  stockId: string
}

// 账户类型
export interface Account {
  id: string
  name: string
  type: MarketType
  currency: string
  balance: number
  totalValue: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 资金流水记录类型
export interface CashFlow extends BaseEntity {
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DIVIDEND' | 'INTEREST'
  amount: number
  currency: string
  description: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  referenceId?: string

  // 关联
  accountId: string
  userId: string
}

// 盈亏统计类型
export interface ProfitStats {
  totalProfit: number
  totalProfitRate: number
  todayProfit: number
  todayProfitRate: number
  weeklyProfit: number
  weeklyProfitRate: number
  monthlyProfit: number
  monthlyProfitRate: number
  yearlyProfit: number
  yearlyProfitRate: number
}

// 资产分布类型
export interface AssetDistribution {
  market: MarketType
  value: number
  percentage: number
  stockCount: number
  sectors: Array<{
    name: string
    value: number
    percentage: number
  }>
}

// 投资组合汇总类型
export interface PortfolioSummary {
  totalAssets: number
  totalCash: number
  totalInvested: number
  totalValue: number
  totalProfit: number
  profitStats: ProfitStats
  assetDistribution: AssetDistribution[]
  accountBalances: Array<{
    market: MarketType
    account: Account
    balance: number
    value: number
  }>
  recentTransactions: Transaction[]
}

// 持仓分析类型
export interface PositionAnalysis {
  positionId: string
  stock: Stock
  currentAnalysis: {
    profitLoss: number
    profitLossRate: number
    holdingDays: number
    averageCost: number
    unrealizedPL: number
    realizedPL: number
  }
  recommendations: Array<{
    type: 'HOLD' | 'SELL' | 'BUY_MORE'
    reason: string
    confidence: number
  }>
}

// 风险分析类型
export interface RiskAnalysis {
  portfolioId: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  concentration: Array<{
    market: MarketType
    concentration: number
    risk: string
  }>
  recommendations: Array<{
    action: string
    description: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
  }>
}

// 交易分析类型
export interface TradingAnalysis {
  totalTrades: number
  successRate: number
  averageHoldTime: number
  mostTradedStocks: Array<{
    symbol: string
    trades: number
    profitRate: number
  }>
  tradingFrequency: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendations: Array<{
    action: string
    description: string
  }>
}

// 性能指标类型
export interface PerformanceMetrics {
  sharpeRatio: number
  maxDrawdown: number
  volatility: number
  beta: number
  alpha: number
  annualReturn: number
  winRate: number
}

// 投资目标类型
export interface InvestmentGoal {
  targetValue: number
  targetDate: string
  riskTolerance: number
  expectedReturn: number
  strategy: string
}

// 譛选设置类型
export class ScreeningCriteria {
  constructor() {
    this.market = []
    this.sector = []
    this.minPrice = 0
    this.maxPrice = Infinity
    this.minMarketCap = 0
    this.maxMarketCap = Infinity
    this.minPE = 0
    this.maxPE = Infinity
    this.minPB = 0
    this.maxPB = Infinity
    this.minYield = 0
    this.maxYield = Infinity
  }

  setMarket(markets: MarketType[]) {
    this.market = markets
  }

  setPriceRange(min: number, max: number) {
    this.minPrice = min
    this.maxPrice = max
  }

  setMarketCapRange(min: number, max: number) {
    this.minMarketCap = min
    this.maxMarketCap = max
  }

  setPERange(min: number, max: number) {
    this.minPE = min
    this.maxPE = max
  }

  setPBRange(min: number, max: number) {
    this.minPB = min
    this.maxPB = max
  }

  setYieldRange(min: number, max: number) {
    this.minYield = min
    this.maxYield = max
  }

  matches(stock: Stock): boolean {
    if (this.market.length > 0 && !this.market.includes(stock.market)) {
      return false
    }

    if (stock.currentPrice && stock.currentPrice < this.minPrice) {
      return false
    }

    if (stock.currentPrice && stock.currentPrice > this.maxPrice) {
      return false
    }

    if (stock.marketCap && stock.marketCap < this.minMarketCap) {
      return false
    }

    if (stock.marketCap && stock.marketCap > this.maxMarketCap) {
      return false
    }

    if (stock.pe && (stock.pe < this.minPE || stock.pe > this.maxPE)) {
      return false
    }

    if (stock.pb && (stock.pb < this.minPB || stock.pb > this.maxPB)) {
      return false
    }

    if (stock.dividend && (stock.dividend < this.minYield || stock.dividend > this.maxYield)) {
      return false
    }

    return true
  }
}

export default Portfolio