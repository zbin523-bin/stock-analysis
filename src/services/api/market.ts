import { apiClient } from '../api/client'

export interface MarketIndex {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  lastUpdate: string
}

export interface MarketStats {
  totalMarketCap: number
  totalVolume: number
  advancingStocks: number
  decliningStocks: number
  unchangedStocks: number
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  volatilityIndex: number
  lastUpdate: string
}

export interface SectorPerformance {
  sector: string
  change: number
  changePercent: number
  volume: number
  marketCap: number
  stockCount: number
  topGainers: Array<{ symbol: string; name: string; change: number }>
  topLosers: Array<{ symbol: string; name: string; change: number }>
}

export interface MarketNews {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: 'MARKET' | 'ECONOMY' | 'POLICY' | 'COMPANY' | 'INTERNATIONAL'
  importance: 'LOW' | 'MEDIUM' | 'HIGH'
  publishedAt: string
  relatedStocks?: string[]
}

export interface EconomicIndicator {
  name: string
  value: number
  change: number
  changePercent: number
  unit: string
  lastUpdate: string
  description?: string
}

export interface MarketCalendar {
  id: string
  date: string
  title: string
  description: string
  importance: 'LOW' | 'MEDIUM' | 'HIGH'
  impact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'
  country: string
  actual?: number
  forecast?: number
  previous?: number
}

class MarketService {
  private baseUrl = '/market'

  // 获取市场指数
  async getMarketIndices(): Promise<MarketIndex[]> {
    const response = await apiClient.get(`${this.baseUrl}/indices`)
    return response.data
  }

  // 获取特定市场指数
  async getMarketIndex(code: string): Promise<MarketIndex> {
    const response = await apiClient.get(`${this.baseUrl}/indices/${code}`)
    return response.data
  }

  // 获取市场统计
  async getMarketStats(): Promise<MarketStats> {
    const response = await apiClient.get(`${this.baseUrl}/stats`)
    return response.data
  }

  // 获取板块表现
  async getSectorPerformance(): Promise<SectorPerformance[]> {
    const response = await apiClient.get(`${this.baseUrl}/sectors`)
    return response.data
  }

  // 获取市场新闻
  async getMarketNews(
    limit: number = 20,
    category?: string,
    importance?: string
  ): Promise<MarketNews[]> {
    const params: any = { limit }
    if (category) params.category = category
    if (importance) params.importance = importance

    const response = await apiClient.get(`${this.baseUrl}/news`, { params })
    return response.data
  }

  // 获取经济指标
  async getEconomicIndicators(): Promise<EconomicIndicator[]> {
    const response = await apiClient.get(`${this.baseUrl}/economic`)
    return response.data
  }

  // 获取市场日历
  async getMarketCalendar(
    startDate?: string,
    endDate?: string,
    importance?: string
  ): Promise<MarketCalendar[]> {
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (importance) params.importance = importance

    const response = await apiClient.get(`${this.baseUrl}/calendar`, { params })
    return response.data
  }

  // 获取市场热力图数据
  async getMarketHeatmap(): Promise<Array<{
    sector: string
    industry: string
    change: number
    changePercent: number
    marketCap: number
    stockCount: number
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/heatmap`)
    return response.data
  }

  // 获取市场情绪指标
  async getMarketSentiment(): Promise<{
    fearGreedIndex: number
    sentiment: 'EXTREME_FEAR' | 'FEAR' | 'NEUTRAL' | 'GREED' | 'EXTREME_GREED'
    putCallRatio: number
    vix: number
    marketBreath: {
      advanceDeclineRatio: number
      newHighsNewLows: number
      upVolumeDownVolume: number
    }
  }> {
    const response = await apiClient.get(`${this.baseUrl}/sentiment`)
    return response.data
  }

  // 获取外资流向
  async getForeignFlow(
    market: 'A-share' | 'HK' | 'US',
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    netInflow: number
    buyVolume: number
    sellVolume: number
    topInflows: Array<{ symbol: string; amount: number; change: number }>
    topOutflows: Array<{ symbol: string; amount: number; change: number }>
    historical: Array<{ date: string; netFlow: number; amount: number }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/foreign-flow`, {
      params: { market, period }
    })
    return response.data
  }

  // 获取IPO信息
  async getIPOData(status: 'upcoming' | 'current' | 'completed' = 'upcoming'): Promise<Array<{
    id: string
    name: string
    symbol: string
    exchange: string
    priceRange: { min: number; max: number }
    expectedDate: string
    marketCap?: number
    description: string
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/ipo`, {
      params: { status }
    })
    return response.data
  }

  // 获取大宗交易数据
  async getBlockTrades(
    market?: string,
    limit: number = 20
  ): Promise<Array<{
    id: string
    symbol: string
    name: string
    price: number
    volume: number
    amount: number
    change: number
    buyer?: string
    seller?: string
    date: string
  }>> {
    const params: any = { limit }
    if (market) params.market = market

    const response = await apiClient.get(`${this.baseUrl}/block-trades`, { params })
    return response.data
  }

  // 获取龙虎榜数据
  async getTopList(limit: number = 20): Promise<Array<{
    symbol: string
    name: string
    buyAmount: number
    sellAmount: number
    netAmount: number
    change: number
    institutions: Array<{ name: string; type: 'BUY' | 'SELL'; amount: number }>
    date: string
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/top-list`, {
      params: { limit }
    })
    return response.data
  }

  // 获取融资融券数据
  async getMarginData(
    symbol?: string,
    period: 'day' | 'week' | 'month' = 'day'
  ): Promise<{
    summary: {
      totalMarginBalance: number
      totalShortBalance: number
      marginRatio: number
      shortRatio: number
    }
    details: Array<{
      date: string
      symbol: string
      name: string
      marginBalance: number
      marginBalanceChange: number
      shortBalance: number
      shortBalanceChange: number
    }>
  }> {
    const params: any = { period }
    if (symbol) params.symbol = symbol

    const response = await apiClient.get(`${this.baseUrl}/margin`, { params })
    return response.data
  }

  // 获取股东持股数据
  async getShareholderData(symbol: string): Promise<{
    majorShareholders: Array<{
      name: string
      type: 'INSTITUTION' | 'INDIVIDUAL' | 'STATE'
      sharePercentage: number
      shareCount: number
      change: number
    }>
    institutionalHolding: {
      totalPercentage: number
      institutions: Array<{
        name: string
        percentage: number
        change: number
      }>
    }
    insiderHolding: {
      totalPercentage: number
      insiders: Array<{
        name: string
        position: string
        percentage: number
        change: number
      }>
    }
  }> {
    const response = await apiClient.get(`${this.baseUrl}/shareholder/${symbol}`)
    return response.data
  }

  // 获取市场预测
  async getMarketPrediction(): Promise<{
    direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
    confidence: number
    timeHorizon: string
    keyFactors: string[]
    risks: string[]
    recommendations: Array<{
      action: string
      description: string
      priority: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/prediction`)
    return response.data
  }

  // 获取实时市场数据流 (WebSocket连接信息)
  async getMarketDataStream(): Promise<{
    websocketUrl: string
    token: string
    channels: string[]
  }> {
    const response = await apiClient.get(`${this.baseUrl}/stream`)
    return response.data
  }
}

export const marketService = new MarketService()