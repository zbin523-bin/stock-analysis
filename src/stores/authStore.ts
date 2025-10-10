import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { BaseUser } from '@/types/common'
import AuthService from '@/services/auth'

// 认证状态接口
interface AuthState {
  // 状态
  user: BaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // 操作
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  getCurrentUser: () => Promise<void>
  updateProfile: (userData: Partial<BaseUser>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  enableTwoFactor: (password: string) => Promise<{ secret: string; qrCodeUrl: string }>
  disableTwoFactor: (password: string) => Promise<void>
  verifyTwoFactor: (code: string) => Promise<void>

  // 辅助方法
  clearError: () => void
  setLoading: (loading: boolean) => void
  initializeAuth: () => Promise<void>
}

// 创建认证状态管理
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // 登录
        login: async (email: string, password: string, twoFactorCode?: string) => {
          try {
            set({ isLoading: true, error: null })

            const authData = await AuthService.login({
              email,
              password,
              twoFactorCode,
            })

            set({
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || '登录失败',
            })
            throw error
          }
        },

        // 注册
        register: async (email: string, password: string, name: string, phone?: string) => {
          try {
            set({ isLoading: true, error: null })

            const authData = await AuthService.register({
              email,
              password,
              name,
              phone,
            })

            set({
              user: authData.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || '注册失败',
            })
            throw error
          }
        },

        // 登出
        logout: async () => {
          try {
            set({ isLoading: true })
            await AuthService.logout()
            // AuthService.logout 会自动重定向到登录页
          } catch (error: any) {
            console.error('Logout error:', error)
            // 即使API调用失败，也要清除本地状态
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        },

        // 刷新令牌
        refreshToken: async () => {
          try {
            const authData = await AuthService.refreshToken()
            set({
              user: authData.user,
              isAuthenticated: true,
              error: null,
            })
          } catch (error: any) {
            console.error('Token refresh failed:', error)
            set({
              user: null,
              isAuthenticated: false,
              error: error.message || 'Token刷新失败',
            })
            throw error
          }
        },

        // 获取当前用户信息
        getCurrentUser: async () => {
          try {
            set({ isLoading: true, error: null })

            const user = await AuthService.getCurrentUser()
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || '获取用户信息失败',
            })
          }
        },

        // 更新用户信息
        updateProfile: async (userData: Partial<BaseUser>) => {
          try {
            set({ isLoading: true, error: null })

            const updatedUser = await AuthService.updateProfile(userData)
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '更新用户信息失败',
            })
            throw error
          }
        },

        // 修改密码
        changePassword: async (currentPassword: string, newPassword: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.changePassword({
              currentPassword,
              newPassword,
            })

            set({
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '修改密码失败',
            })
            throw error
          }
        },

        // 忘记密码
        forgotPassword: async (email: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.forgotPassword({ email })

            set({
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '发送重置邮件失败',
            })
            throw error
          }
        },

        // 重置密码
        resetPassword: async (token: string, newPassword: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.resetPassword({
              token,
              newPassword,
            })

            set({
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '重置密码失败',
            })
            throw error
          }
        },

        // 验证邮箱
        verifyEmail: async (token: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.verifyEmail(token)

            // 重新获取用户信息以更新邮箱验证状态
            await get().getCurrentUser()
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '邮箱验证失败',
            })
            throw error
          }
        },

        // 重新发送验证邮件
        resendVerificationEmail: async () => {
          try {
            set({ isLoading: true, error: null })

            const { user } = get()
            if (!user?.email) {
              throw new Error('用户邮箱不存在')
            }

            await AuthService.resendVerificationEmail(user.email)

            set({
              isLoading: false,
              error: null,
            })
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '发送验证邮件失败',
            })
            throw error
          }
        },

        // 启用两步验证
        enableTwoFactor: async (password: string) => {
          try {
            set({ isLoading: true, error: null })

            const setupData = await AuthService.enableTwoFactor({ password })

            set({
              isLoading: false,
              error: null,
            })

            return setupData
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '启用两步验证失败',
            })
            throw error
          }
        },

        // 禁用两步验证
        disableTwoFactor: async (password: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.disableTwoFactor({ password })

            // 重新获取用户信息以更新两步验证状态
            await get().getCurrentUser()
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '禁用两步验证失败',
            })
            throw error
          }
        },

        // 验证两步验证代码
        verifyTwoFactor: async (code: string) => {
          try {
            set({ isLoading: true, error: null })

            await AuthService.verifyTwoFactor({ code })

            // 重新获取用户信息以更新两步验证状态
            await get().getCurrentUser()
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || '两步验证失败',
            })
            throw error
          }
        },

        // 清除错误
        clearError: () => {
          set({ error: null })
        },

        // 设置加载状态
        setLoading: (loading: boolean) => {
          set({ isLoading: loading })
        },

        // 初始化认证状态
        initializeAuth: async () => {
          try {
            // 检查本地存储的认证信息
            if (AuthService.isAuthenticated()) {
              // 检查令牌是否需要刷新
              const shouldRefresh = AuthService.shouldRefreshToken()
              if (shouldRefresh) {
                await get().refreshToken()
              } else {
                // 获取最新的用户信息
                await get().getCurrentUser()
              }
            }
          } catch (error) {
            console.error('Auth initialization failed:', error)
            // 清除无效的认证信息
            AuthService.clearAuthData()
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            })
          }
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
)

// 选择器函数
export const useAuth = () => {
  const store = useAuthStore()

  return {
    // 状态
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // 计算属性
    isEmailVerified: store.user?.emailVerified ?? false,
    isTwoFactorEnabled: store.user?.twoFactorEnabled ?? false,
    userName: store.user?.name ?? '',
    userEmail: store.user?.email ?? '',

    // 操作
    login: store.login,
    register: store.register,
    logout: store.logout,
    refreshToken: store.refreshToken,
    getCurrentUser: store.getCurrentUser,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    verifyEmail: store.verifyEmail,
    resendVerificationEmail: store.resendVerificationEmail,
    enableTwoFactor: store.enableTwoFactor,
    disableTwoFactor: store.disableTwoFactor,
    verifyTwoFactor: store.verifyTwoFactor,

    // 辅助方法
    clearError: store.clearError,
    setLoading: store.setLoading,
    initializeAuth: store.initializeAuth,
  }
}

export default useAuthStore