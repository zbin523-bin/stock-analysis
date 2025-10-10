import { apiClient } from '../api/client'
import { Stock, PriceHistory, ScreeningCriteria, Watchlist } from '@/types/portfolio'
import { BaseEntity } from '@/types/common'

export interface StockSearchParams {
  query?: string
  market?: string
  sector?: string
  industry?: string
  page?: number
  limit?: number
  sortBy?: 'name' | 'symbol' | 'marketCap' | 'price' | 'change'
  sortOrder?: 'asc' | 'desc'
}

export interface StockSearchResult {
  stocks: Stock[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PriceHistoryParams {
  period?: 'day' | 'week' | 'month' | 'year' | 'all'
  interval?: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w' | '1M'
  startDate?: string
  endDate?: string
}

export interface StockPriceUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

class StockService {
  private baseUrl = '/stocks'

  // 搜索股票
  async searchStocks(params: StockSearchParams): Promise<StockSearchResult> {
    const response = await apiClient.get(`${this.baseUrl}/search`, { params })
    return response.data
  }

  // 获取股票详情
  async getStock(symbol: string): Promise<Stock> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}`)
    return response.data
  }

  // 批量获取股票信息
  async getStocks(symbols: string[]): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/batch`, {
      params: { symbols: symbols.join(',') }
    })
    return response.data
  }

  // 获取股票价格历史
  async getPriceHistory(
    symbol: string,
    params?: PriceHistoryParams
  ): Promise<PriceHistory[]> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/history`, { params })
    return response.data
  }

  // 获取实时价格
  async getRealtimePrice(symbol: string): Promise<{
    price: number
    change: number
    changePercent: number
    volume: number
    timestamp: string
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/price`)
    return response.data
  }

  // 批量获取实时价格
  async getBatchRealtimePrices(symbols: string[]): Promise<StockPriceUpdate[]> {
    const response = await apiClient.get(`${this.baseUrl}/prices/batch`, {
      params: { symbols: symbols.join(',') }
    })
    return response.data
  }

  // 股票筛选
  async screenStocks(criteria: Partial<ScreeningCriteria>): Promise<Stock[]> {
    const response = await apiClient.post(`${this.baseUrl}/screen`, criteria)
    return response.data
  }

  // 获取热门股票
  async getPopularStocks(limit: number = 10): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/popular`, {
      params: { limit }
    })
    return response.data
  }

  // 获取涨幅榜
  async getTopGainers(limit: number = 10): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/gainers`, {
      params: { limit }
    })
    return response.data
  }

  // 获取跌幅榜
  async getTopLosers(limit: number = 10): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/losers`, {
      params: { limit }
    })
    return response.data
  }

  // 获取成交量榜
  async getMostActive(limit: number = 10): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/active`, {
      params: { limit }
    })
    return response.data
  }

  // 获取行业分类
  async getIndustries(): Promise<Array<{
    name: string
    sector: string
    stockCount: number
    avgMarketCap: number
    avgPE: number
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/industries`)
    return response.data
  }

  // 获取行业股票
  async getIndustryStocks(industry: string): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/industry/${industry}`)
    return response.data
  }

  // 获取板块股票
  async getSectorStocks(sector: string): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/sector/${sector}`)
    return response.data
  }

  // 添加自选股
  async addToWatchlist(symbol: string): Promise<Watchlist> {
    const response = await apiClient.post(`/watchlist`, { symbol })
    return response.data
  }

  // 移除自选股
  async removeFromWatchlist(symbol: string): Promise<void> {
    await apiClient.delete(`/watchlist/${symbol}`)
  }

  // 获取自选股列表
  async getWatchlist(): Promise<Watchlist[]> {
    const response = await apiClient.get('/watchlist')
    return response.data
  }

  // 检查是否在自选股中
  async isInWatchlist(symbol: string): Promise<boolean> {
    const response = await apiClient.get(`/watchlist/${symbol}/check`)
    return response.data.isInWatchlist
  }

  // 获取股票新闻
  async getStockNews(symbol: string, limit: number = 10): Promise<Array<{
    id: string
    title: string
    summary: string
    url: string
    source: string
    publishedAt: string
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/news`, {
      params: { limit }
    })
    return response.data
  }

  // 获取财务数据
  async getFinancialData(symbol: string): Promise<{
    revenue: Array<{ period: string; value: number }>
    netIncome: Array<{ period: string; value: number }>
    assets: Array<{ period: string; value: number }>
    liabilities: Array<{ period: string; value: number }>
    cashFlow: Array<{ period: string; value: number }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/financial`)
    return response.data
  }

  // 获取技术指标
  async getTechnicalIndicators(
    symbol: string,
    indicators: string[] = ['MA', 'RSI', 'MACD']
  ): Promise<{
    symbol: string
    indicators: {
      [key: string]: Array<{ date: string; value: number }>
    }
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/technical`, {
      params: { indicators: indicators.join(',') }
    })
    return response.data
  }

  // 获取股票预测
  async getStockPrediction(symbol: string): Promise<{
    symbol: string
    prediction: {
      direction: 'BUY' | 'SELL' | 'HOLD'
      confidence: number
      targetPrice: number
      timeHorizon: string
    }
    reasoning: string[]
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/prediction`)
    return response.data
  }

  // 搜索相似股票
  async findSimilarStocks(symbol: string, limit: number = 5): Promise<Stock[]> {
    const response = await apiClient.get(`${this.baseUrl}/${symbol}/similar`, {
      params: { limit }
    })
    return response.data
  }

  // 导出股票数据
  async exportStockData(
    symbols: string[],
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params: { symbols: symbols.join(','), format },
      responseType: 'blob'
    })
    return response.data
  }
}

export const stockService = new StockService()