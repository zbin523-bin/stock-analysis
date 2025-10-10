import { apiClient } from '../api/client'
import {
  Portfolio,
  PortfolioSummary,
  Position,
  PositionAnalysis,
  AssetDistribution,
  ProfitStats,
  RiskAnalysis,
  PerformanceMetrics
} from '@/types/portfolio'

export interface CreatePortfolioData {
  name: string
  description?: string
}

export interface UpdatePortfolioData {
  name?: string
  description?: string
  isActive?: boolean
}

export interface PortfolioFilters {
  isActive?: boolean
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'totalValue'
  sortOrder?: 'asc' | 'desc'
}

class PortfolioService {
  private baseUrl = '/portfolios'

  // 获取所有投资组合
  async getPortfolios(filters?: PortfolioFilters): Promise<Portfolio[]> {
    const response = await apiClient.get(this.baseUrl, { params: filters })
    return response.data
  }

  // 获取投资组合详情
  async getPortfolio(id: string): Promise<Portfolio> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  // 创建投资组合
  async createPortfolio(data: CreatePortfolioData): Promise<Portfolio> {
    const response = await apiClient.post(this.baseUrl, data)
    return response.data
  }

  // 更新投资组合
  async updatePortfolio(id: string, data: UpdatePortfolioData): Promise<Portfolio> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  // 删除投资组合
  async deletePortfolio(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  // 获取投资组合汇总数据
  async getPortfolioSummary(portfolioId?: string): Promise<PortfolioSummary> {
    const url = portfolioId
      ? `${this.baseUrl}/${portfolioId}/summary`
      : `${this.baseUrl}/summary`
    const response = await apiClient.get(url)
    return response.data
  }

  // 获取投资组合持仓
  async getPositions(portfolioId: string): Promise<Position[]> {
    const response = await apiClient.get(`${this.baseUrl}/${portfolioId}/positions`)
    return response.data
  }

  // 获取持仓分析
  async getPositionAnalysis(positionId: string): Promise<PositionAnalysis> {
    const response = await apiClient.get(`/positions/${positionId}/analysis`)
    return response.data
  }

  // 获取资产分布
  async getAssetDistribution(portfolioId?: string): Promise<AssetDistribution[]> {
    const url = portfolioId
      ? `${this.baseUrl}/${portfolioId}/distribution`
      : `${this.baseUrl}/distribution`
    const response = await apiClient.get(url)
    return response.data
  }

  // 获取盈亏统计
  async getProfitStats(
    portfolioId?: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<ProfitStats> {
    const params = period ? { period } : {}
    const url = portfolioId
      ? `${this.baseUrl}/${portfolioId}/profit`
      : `${this.baseUrl}/profit`
    const response = await apiClient.get(url, { params })
    return response.data
  }

  // 获取风险分析
  async getRiskAnalysis(portfolioId: string): Promise<RiskAnalysis> {
    const response = await apiClient.get(`${this.baseUrl}/${portfolioId}/risk`)
    return response.data
  }

  // 获取性能指标
  async getPerformanceMetrics(
    portfolioId: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<PerformanceMetrics> {
    const params = period ? { period } : {}
    const response = await apiClient.get(`${this.baseUrl}/${portfolioId}/performance`, { params })
    return response.data
  }

  // 重新计算投资组合价值
  async recalculatePortfolioValue(portfolioId: string): Promise<Portfolio> {
    const response = await apiClient.post(`${this.baseUrl}/${portfolioId}/recalculate`)
    return response.data
  }

  // 获取投资组合历史价值
  async getPortfolioHistory(
    portfolioId: string,
    period?: 'day' | 'week' | 'month' | 'year' | 'all'
  ): Promise<Array<{ date: string; value: number; profit: number; profitRate: number }>> {
    const params = period ? { period } : {}
    const response = await apiClient.get(`${this.baseUrl}/${portfolioId}/history`, { params })
    return response.data
  }

  // 导出投资组合数据
  async exportPortfolioData(
    portfolioId: string,
    format: 'json' | 'csv' | 'excel' = 'json'
  ): Promise<Blob> {
    const response = await apiClient.get(`${this.baseUrl}/${portfolioId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  // 批量操作
  async bulkUpdatePortfolios(
    updates: Array<{ id: string; data: UpdatePortfolioData }>
  ): Promise<Portfolio[]> {
    const response = await apiClient.patch(`${this.baseUrl}/bulk`, { updates })
    return response.data
  }

  // 获取投资组合对比数据
  async comparePortfolios(portfolioIds: string[]): Promise<{
    portfolios: Portfolio[]
    comparison: {
      totalValue: Array<{ portfolioId: string; value: number; rank: number }>
      profitRate: Array<{ portfolioId: string; rate: number; rank: number }>
      riskScore: Array<{ portfolioId: string; score: number; rank: number }>
    }
  }> {
    const response = await apiClient.post(`${this.baseUrl}/compare`, { portfolioIds })
    return response.data
  }
}

export const portfolioService = new PortfolioService()