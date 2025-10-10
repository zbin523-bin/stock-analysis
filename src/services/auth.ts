import { apiRequest, ApiResponse } from './api'
import { BaseUser } from '@/types/common'

// 认证相关类型定义
export interface LoginRequest {
  email: string
  password: string
  twoFactorCode?: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}

export interface AuthResponse {
  user: BaseUser
  accessToken: string
  refreshToken: string
  requiresTwoFactor?: boolean
}

export interface ResetPasswordRequest {
  email: string
}

export interface ConfirmResetPasswordRequest {
  token: string
  newPassword: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface EnableTwoFactorRequest {
  password: string
}

export interface VerifyTwoFactorRequest {
  code: string
}

export interface TwoFactorSetupResponse {
  secret: string
  qrCodeUrl: string
}

// 认证服务类
export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken'
  private static readonly REFRESH_TOKEN_KEY = 'refreshToken'
  private static readonly USER_KEY = 'user'

  // 登录
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest.post<ApiResponse<AuthResponse>>('/auth/login', credentials)

    if (response.success && response.data) {
      this.setAuthData(response.data)
      return response.data
    }

    throw new Error(response.error || '登录失败')
  }

  // 注册
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest.post<ApiResponse<AuthResponse>>('/auth/register', userData)

    if (response.success && response.data) {
      this.setAuthData(response.data)
      return response.data
    }

    throw new Error(response.error || '注册失败')
  }

  // 登出
  static async logout(): Promise<void> {
    try {
      await apiRequest.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.clearAuthData()
      window.location.href = '/login'
    }
  }

  // 刷新令牌
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await apiRequest.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    })

    if (response.success && response.data) {
      this.setAuthData(response.data)
      return response.data
    }

    throw new Error(response.error || 'Token refresh failed')
  }

  // 获取当前用户信息
  static async getCurrentUser(): Promise<BaseUser> {
    const response = await apiRequest.get<ApiResponse<BaseUser>>('/auth/me')

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || '获取用户信息失败')
  }

  // 更新用户信息
  static async updateProfile(userData: Partial<RegisterRequest>): Promise<BaseUser> {
    const response = await apiRequest.put<ApiResponse<BaseUser>>('/auth/me', userData)

    if (response.success && response.data) {
      // 更新本地存储的用户信息
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.data))
      return response.data
    }

    throw new Error(response.error || '更新用户信息失败')
  }

  // 修改密码
  static async changePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    const response = await apiRequest.put<ApiResponse>('/auth/password', passwordData)

    if (!response.success) {
      throw new Error(response.error || '修改密码失败')
    }
  }

  // 忘记密码
  static async forgotPassword(emailData: ResetPasswordRequest): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/forgot-password', emailData)

    if (!response.success) {
      throw new Error(response.error || '发送重置邮件失败')
    }
  }

  // 重置密码
  static async resetPassword(resetData: ConfirmResetPasswordRequest): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/reset-password', resetData)

    if (!response.success) {
      throw new Error(response.error || '重置密码失败')
    }
  }

  // 验证邮箱
  static async verifyEmail(token: string): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/verify-email', { token })

    if (!response.success) {
      throw new Error(response.error || '邮箱验证失败')
    }
  }

  // 重新发送验证邮件
  static async resendVerificationEmail(email: string): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/resend-verification', { email })

    if (!response.success) {
      throw new Error(response.error || '发送验证邮件失败')
    }
  }

  // 启用两步验证
  static async enableTwoFactor(passwordData: EnableTwoFactorRequest): Promise<TwoFactorSetupResponse> {
    const response = await apiRequest.post<ApiResponse<TwoFactorSetupResponse>>('/auth/2fa/enable', passwordData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.error || '启用两步验证失败')
  }

  // 禁用两步验证
  static async disableTwoFactor(passwordData: EnableTwoFactorRequest): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/2fa/disable', passwordData)

    if (!response.success) {
      throw new Error(response.error || '禁用两步验证失败')
    }
  }

  // 验证两步验证代码
  static async verifyTwoFactor(codeData: VerifyTwoFactorRequest): Promise<void> {
    const response = await apiRequest.post<ApiResponse>('/auth/2fa/verify', codeData)

    if (!response.success) {
      throw new Error(response.error || '两步验证失败')
    }
  }

  // 本地存储管理
  static setAuthData(authData: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, authData.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken)
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user))
  }

  static clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  // 获取认证状态
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  static getUser(): BaseUser | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser()
  }

  static isEmailVerified(): boolean {
    const user = this.getUser()
    return user?.emailVerified ?? false
  }

  static isTwoFactorEnabled(): boolean {
    const user = this.getUser()
    return user?.twoFactorEnabled ?? false
  }

  // 检查令牌是否过期
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // 检查是否需要刷新令牌
  static shouldRefreshToken(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = payload.exp - currentTime

      // 如果令牌在5分钟内过期，则刷新
      return timeUntilExpiry < 300
    } catch {
      return false
    }
  }

  // 自动刷新令牌
  static async autoRefreshToken(): Promise<boolean> {
    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken()
        return true
      } catch (error) {
        console.error('Auto refresh token failed:', error)
        this.clearAuthData()
        return false
      }
    }
    return true
  }
}

// 导出服务实例
export default AuthService