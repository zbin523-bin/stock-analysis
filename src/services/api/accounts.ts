import { apiClient } from '../api/client'
import { Account, CashFlow } from '@/types/portfolio'
import { MarketType } from '@/types/common'

export interface CreateAccountData {
  name: string
  type: MarketType
  currency: string
  initialBalance?: number
}

export interface UpdateAccountData {
  name?: string
  currency?: string
  balance?: number
  isActive?: boolean
}

export interface TransferFundsData {
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: string
  description?: string
  exchangeRate?: number
}

export interface AccountSummary {
  totalBalance: number
  totalValue: number
  currencyDistribution: Array<{
    currency: string
    balance: number
    value: number
    percentage: number
  }>
  accountTypeDistribution: Array<{
    type: MarketType
    balance: number
    value: number
    percentage: number
  }>
  recentTransactions: CashFlow[]
  totalProfit: number
  profitRate: number
}

class AccountService {
  private baseUrl = '/accounts'

  // 获取所有账户
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get(this.baseUrl)
    return response.data
  }

  // 获取账户详情
  async getAccount(id: string): Promise<Account> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  // 创建账户
  async createAccount(data: CreateAccountData): Promise<Account> {
    const response = await apiClient.post(this.baseUrl, data)
    return response.data
  }

  // 更新账户
  async updateAccount(id: string, data: UpdateAccountData): Promise<Account> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  // 删除账户
  async deleteAccount(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // 激活/停用账户
  async toggleAccount(id: string, isActive: boolean): Promise<Account> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/status`, {
      isActive
    })
    return response.data
  }

  // 账户转账
  async transferFunds(data: TransferFundsData): Promise<{
    fromAccount: Account
    toAccount: Account
    transactionId: string
    exchangeRate?: number
  }> {
    const response = await apiClient.post(`${this.baseUrl}/transfer`, data)
    return response.data
  }

  // 账户余额调整
  async adjustBalance(
    id: string,
    data: {
      amount: number
      type: 'INCREASE' | 'DECREASE'
      reason: string
      currency?: string
    }
  ): Promise<Account> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/adjust`, data)
    return response.data
  }

  // 获取账户汇总
  async getAccountSummary(): Promise<AccountSummary> {
    const response = await apiClient.get(`${this.baseUrl}/summary`)
    return response.data
  }

  // 获取账户余额历史
  async getAccountBalanceHistory(
    id: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<Array<{
    date: string
    balance: number
    value: number
    change: number
    changeRate: number
  }>> {
    const params = period ? { period } : {}
    const response = await apiClient.get(`${this.baseUrl}/${id}/history`, { params })
    return response.data
  }

  // 获取账户资金流水
  async getAccountCashFlows(
    id: string,
    filters?: {
      type?: string
      startDate?: string
      endDate?: string
      page?: number
      limit?: number
    }
  ): Promise<{
    cashFlows: CashFlow[]
    total: number
    page: number
    limit: number
    hasMore: boolean
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/cashflows`, {
      params: filters
    })
    return response.data
  }

  // 获取账户持仓（仅证券账户）
  async getAccountPositions(id: string): Promise<Array<{
    stockId: string
    symbol: string
    name: string
    quantity: number
    averageCost: number
    currentPrice: number
    marketValue: number
    profit: number
    profitRate: number
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/positions`)
    return response.data
  }

  // 获取账户盈亏统计
  async getAccountProfitStats(
    id: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<{
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
    maxDrawdown: number
    sharpeRatio: number
  }> {
    const params = period ? { period } : {}
    const response = await apiClient.get(`${this.baseUrl}/${id}/profit`, { params })
    return response.data
  }

  // 账户风险分析
  async getAccountRiskAnalysis(id: string): Promise<{
    riskScore: number
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    concentrationRisk: number
    liquidityRisk: number
    marketRisk: number
    recommendations: Array<{
      type: 'REDUCE_RISK' | 'DIVERSIFY' | 'REBALANCE' | 'MONITOR'
      description: string
      priority: 'LOW' | 'MEDIUM' | 'HIGH'
    }>
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/risk`)
    return response.data
  }

  // 批量操作
  async bulkUpdateAccounts(
    updates: Array<{ id: string; data: UpdateAccountData }>
  ): Promise<Account[]> {
    const response = await apiClient.patch(`${this.baseUrl}/bulk`, { updates })
    return response.data
  }

  // 获取汇率转换
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<{
    rate: number
    fromCurrency: string
    toCurrency: string
    timestamp: string
  }> {
    const response = await apiClient.get(`${this.baseUrl}/exchange-rate`, {
      params: { fromCurrency, toCurrency }
    })
    return response.data
  }

  // 获取所有支持的汇率
  async getExchangeRates(): Promise<Array<{
    fromCurrency: string
    toCurrency: string
    rate: number
    timestamp: string
  }>> {
    const response = await apiClient.get(`${this.baseUrl}/exchange-rates`)
    return response.data
  }

  // 账户对比
  async compareAccounts(accountIds: string[]): Promise<{
    accounts: Account[]
    comparison: {
      totalBalance: Array<{ accountId: string; balance: number; rank: number }>
      totalValue: Array<{ accountId: string; value: number; rank: number }>
      profitRate: Array<{ accountId: string; rate: number; rank: number }>
      riskScore: Array<{ accountId: string; score: number; rank: number }>
    }
    recommendations: string[]
  }> {
    const response = await apiClient.post(`${this.baseUrl}/compare`, { accountIds })
    return response.data
  }

  // 导出账户数据
  async exportAccountData(
    accountId?: string,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    const url = accountId ? `${this.baseUrl}/${accountId}/export` : `${this.baseUrl}/export`
    const response = await apiClient.get(url, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // 获取账户设置
  async getAccountSettings(id: string): Promise<{
    autoRebalance: boolean
    riskTolerance: number
    alerts: {
      lowBalance: boolean
      largeTransaction: boolean
      priceAlert: boolean
    }
    preferences: {
      defaultCurrency: string
      timezone: string
      language: string
    }
  }> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/settings`)
    return response.data
  }

  // 更新账户设置
  async updateAccountSettings(
    id: string,
    settings: Partial<{
      autoRebalance: boolean
      riskTolerance: number
      alerts: {
        lowBalance?: boolean
        largeTransaction?: boolean
        priceAlert?: boolean
      }
      preferences: {
        defaultCurrency?: string
        timezone?: string
        language?: string
      }
    }>
  ): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/${id}/settings`, settings)
  }
}

export const accountService = new AccountService()