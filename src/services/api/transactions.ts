import { apiClient } from '../api/client'
import { Transaction, TransactionType, CashFlow } from '@/types/portfolio'

export interface CreateTransactionData {
  portfolioId: string
  stockId: string
  type: TransactionType
  quantity: number
  price: number
  commission?: number
  currency?: string
  transactionDate: string
  note?: string
}

export interface UpdateTransactionData {
  type?: TransactionType
  quantity?: number
  price?: number
  commission?: number
  currency?: string
  transactionDate?: string
  note?: string
  status?: string
}

export interface TransactionFilters {
  portfolioId?: string
  stockId?: string
  type?: TransactionType | TransactionType[]
  status?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  sortBy?: 'transactionDate' | 'amount' | 'stock' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface TransactionResult {
  transactions: Transaction[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CreateCashFlowData {
  accountId: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DIVIDEND' | 'INTEREST'
  amount: number
  currency: string
  description: string
  referenceId?: string
}

export interface CashFlowFilters {
  accountId?: string
  type?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  page?: number
  limit?: number
  sortBy?: 'date' | 'amount' | 'type'
  sortOrder?: 'asc' | 'desc'
}

export interface CashFlowResult {
  cashFlows: CashFlow[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

class TransactionService {
  private baseUrl = '/transactions'

  // 获取交易记录
  async getTransactions(filters?: TransactionFilters): Promise<TransactionResult> {
    const response = await apiClient.get(this.baseUrl, { params: filters })
    return response.data
  }

  // 获取交易详情
  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  // 创建交易记录
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post(this.baseUrl, data)
    return response.data
  }

  // 更新交易记录
  async updateTransaction(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  // 删除交易记录
  async deleteTransaction(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // 批量删除交易记录
  async bulkDeleteTransactions(ids: string[]): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/bulk`, { data: { ids } })
  }

  // 批量创建交易记录
  async bulkCreateTransactions(transactions: CreateTransactionData[]): Promise<Transaction[]> {
    const response = await apiClient.post(`${this.baseUrl}/bulk`, { transactions })
    return response.data
  }

  // 获取投资组合的交易记录
  async getPortfolioTransactions(
    portfolioId: string,
    filters?: Omit<TransactionFilters, 'portfolioId'>
  ): Promise<TransactionResult> {
    const response = await apiClient.get(`/portfolios/${portfolioId}/transactions`, {
      params: filters
    })
    return response.data
  }

  // 获取股票的交易记录
  async getStockTransactions(
    stockId: string,
    filters?: Omit<TransactionFilters, 'stockId'>
  ): Promise<TransactionResult> {
    const response = await apiClient.get(`/stocks/${stockId}/transactions`, {
      params: filters
    })
    return response.data
  }

  // 获取交易统计
  async getTransactionStats(
    portfolioId?: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<{
    totalTransactions: number
    totalAmount: number
    buyTransactions: number
    sellTransactions: number
    averageAmount: number
    mostTradedStock: string
    profitFromTrades: number
  }> {
    const params = period ? { period } : {}
    const url = portfolioId
      ? `/portfolios/${portfolioId}/transactions/stats`
      : `${this.baseUrl}/stats`
    const response = await apiClient.get(url, { params })
    return response.data
  }

  // 导出交易记录
  async exportTransactions(
    filters?: TransactionFilters,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/export`, {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  }

  // 资金流水管理
  async getCashFlows(filters?: CashFlowFilters): Promise<CashFlowResult> {
    const response = await apiClient.get('/cashflows', { params: filters })
    return response.data
  }

  async getCashFlow(id: string): Promise<CashFlow> {
    const response = await apiClient.get(`/cashflows/${id}`)
    return response.data
  }

  async createCashFlow(data: CreateCashFlowData): Promise<CashFlow> {
    const response = await apiClient.post('/cashflows', data)
    return response.data
  }

  async updateCashFlow(id: string, data: Partial<CreateCashFlowData>): Promise<CashFlow> {
    const response = await apiClient.patch(`/cashflows/${id}`, data)
    return response.data
  }

  async deleteCashFlow(id: string): Promise<void> {
    await apiClient.delete(`/cashflows/${id}`)
  }

  // 获取账户资金流水
  async getAccountCashFlows(
    accountId: string,
    filters?: Omit<CashFlowFilters, 'accountId'>
  ): Promise<CashFlowResult> {
    const response = await apiClient.get(`/accounts/${accountId}/cashflows`, {
      params: filters
    })
    return response.data
  }

  // 资金转账
  async transferFunds(data: {
    fromAccountId: string
    toAccountId: string
    amount: number
    currency: string
    description?: string
  }): Promise<{
    fromCashFlow: CashFlow
    toCashFlow: CashFlow
    transactionId: string
  }> {
    const response = await apiClient.post('/cashflows/transfer', data)
    return response.data
  }

  // 获取资金流水统计
  async getCashFlowStats(
    accountId?: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<{
    totalInflow: number
    totalOutflow: number
    netFlow: number
    depositCount: number
    withdrawCount: number
    transferCount: number
    dividendIncome: number
    interestIncome: number
  }> {
    const params = period ? { period } : {}
    const url = accountId
      ? `/accounts/${accountId}/cashflows/stats`
      : '/cashflows/stats'
    const response = await apiClient.get(url, { params })
    return response.data
  }

  // 导出资金流水
  async exportCashFlows(
    filters?: CashFlowFilters,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    const response = await apiClient.get('/cashflows/export', {
      params: { ...filters, format },
      responseType: 'blob'
    })
    return response.data
  }

  // 获取交易建议
  async getTransactionRecommendations(portfolioId: string): Promise<{
    recommendations: Array<{
      type: 'BUY' | 'SELL' | 'HOLD'
      stockId: string
      stockSymbol: string
      reason: string
      confidence: number
      targetPrice?: number
      quantity?: number
    }>
    portfolioAnalysis: {
      rebalancingNeeded: boolean
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
      diversificationScore: number
    }
  }> {
    const response = await apiClient.get(`/portfolios/${portfolioId}/recommendations`)
    return response.data
  }
}

export const transactionService = new TransactionService()