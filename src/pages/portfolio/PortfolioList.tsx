import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, BriefcaseIcon } from '@heroicons/react/24/outline'

import { portfolioService } from '@/services/api'
import { Portfolio } from '@/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const PortfolioList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const queryClient = useQueryClient()

  // 获取投资组合列表
  const {
    data: portfolios = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['portfolios'],
    queryFn: () => portfolioService.getPortfolios(),
    refetchInterval: 30000
  })

  // 创建投资组合
  const createPortfolioMutation = useMutation({
    mutationFn: portfolioService.createPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '' })
    }
  })

  // 删除投资组合
  const deletePortfolioMutation = useMutation({
    mutationFn: portfolioService.deletePortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      setIsDeleteModalOpen(false)
      setSelectedPortfolio(null)
    }
  })

  // 获取投资组合汇总数据
  const { data: summary } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: () => portfolioService.getPortfolioSummary(),
    refetchInterval: 30000
  })

  const handleCreatePortfolio = () => {
    if (!formData.name.trim()) return
    createPortfolioMutation.mutate(formData)
  }

  const handleDeletePortfolio = () => {
    if (selectedPortfolio) {
      deletePortfolioMutation.mutate(selectedPortfolio.id)
    }
  }

  const openDeleteModal = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setIsDeleteModalOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  }

  const getProfitColor = (value: number) => {
    if (value > 0) return 'text-success-600'
    if (value < 0) return 'text-danger-600'
    return 'text-gray-600'
  }

  const getProfitBgColor = (value: number) => {
    if (value > 0) return 'bg-success-50 border-success-200'
    if (value < 0) return 'bg-danger-50 border-danger-200'
    return 'bg-gray-50 border-gray-200'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载投资组合..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600">无法加载投资组合数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">投资组合</h1>
          <p className="text-gray-500">管理和监控您的投资组合表现</p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          icon={PlusIcon}
        >
          创建投资组合
        </Button>
      </div>

      {/* 总览统计 */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总资产</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalAssets)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">累计盈亏</p>
                  <p className={`text-2xl font-bold ${getProfitColor(summary.totalProfit)}`}>
                    {formatCurrency(summary.totalProfit)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getProfitBgColor(summary.totalProfit)}`}>
                  {summary.totalProfit > 0 ? (
                    <ArrowTrendingUpIcon className="h-6 w-6 text-success-600" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-6 w-6 text-danger-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总市值</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">现金余额</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.totalCash)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="h-6 w-6 bg-yellow-600 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 投资组合列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                  {portfolio.description && (
                    <p className="text-sm text-gray-500 mt-1">{portfolio.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    portfolio.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {portfolio.isActive ? '活跃' : '非活跃'}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* 总价值 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总价值</span>
                  <span className="font-semibold">{formatCurrency(portfolio.totalValue)}</span>
                </div>

                {/* 持仓数量 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">持仓数量</span>
                  <span className="font-medium">{portfolio.positions.length}</span>
                </div>

                {/* 创建时间 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">创建时间</span>
                  <span className="text-sm text-gray-500">
                    {new Date(portfolio.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    href={`/portfolio/${portfolio.id}`}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    查看
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    href={`/portfolio/${portfolio.id}/edit`}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    编辑
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteModal(portfolio)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* 空状态 */}
        {portfolios.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <BriefcaseIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无投资组合</h3>
              <p className="text-gray-500 mb-4">创建您的第一个投资组合开始管理投资</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                创建投资组合
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 创建投资组合弹窗 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="创建投资组合"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              投资组合名称 *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入投资组合名称"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入投资组合描述（可选）"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreatePortfolio}
              disabled={!formData.name.trim() || createPortfolioMutation.isPending}
            >
              {createPortfolioMutation.isPending ? '创建中...' : '创建'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="删除投资组合"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              确定要删除投资组合 <strong>{selectedPortfolio?.name}</strong> 吗？
            </p>
            <p className="text-sm text-red-600 mt-2">
              此操作无法撤销，所有相关数据将被永久删除。
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleDeletePortfolio}
              disabled={deletePortfolioMutation.isPending}
            >
              {deletePortfolioMutation.isPending ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PortfolioList