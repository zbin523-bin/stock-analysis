import { useEffect } from 'react'
import { useAuth } from '@/stores/authStore'
import AuthService from '@/services/auth'

// 认证相关的自定义Hook
export const useAuthHook = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    isEmailVerified,
    isTwoFactorEnabled,
    userName,
    userEmail,
    login,
    register,
    logout,
    refreshToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    clearError,
    setLoading,
    initializeAuth,
  } = useAuth()

  // 初始化认证状态
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // 自动刷新令牌
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      try {
        await AuthService.autoRefreshToken()
      } catch (error) {
        console.error('Auto refresh failed:', error)
      }
    }, 60000) // 每分钟检查一次

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // 登录处理
  const handleLogin = async (email: string, password: string, twoFactorCode?: string) => {
    try {
      await login(email, password, twoFactorCode)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        requiresTwoFactor: error.response?.data?.requiresTwoFactor,
      }
    }
  }

  // 注册处理
  const handleRegister = async (email: string, password: string, name: string, phone?: string) => {
    try {
      await register(email, password, name, phone)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 登出处理
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
      // 即使出错也要清除本地状态
      AuthService.clearAuthData()
      window.location.href = '/login'
    }
  }

  // 更新个人信息
  const handleUpdateProfile = async (userData: { name?: string; phone?: string }) => {
    try {
      await updateProfile(userData)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 修改密码
  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await changePassword(currentPassword, newPassword)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 忘记密码
  const handleForgotPassword = async (email: string) => {
    try {
      await forgotPassword(email)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 重置密码
  const handleResetPassword = async (token: string, newPassword: string) => {
    try {
      await resetPassword(token, newPassword)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 验证邮箱
  const handleVerifyEmail = async (token: string) => {
    try {
      await verifyEmail(token)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 重新发送验证邮件
  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 启用两步验证
  const handleEnableTwoFactor = async (password: string) => {
    try {
      const setupData = await enableTwoFactor(password)
      return { success: true, data: setupData }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 禁用两步验证
  const handleDisableTwoFactor = async (password: string) => {
    try {
      await disableTwoFactor(password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 验证两步验证代码
  const handleVerifyTwoFactor = async (code: string) => {
    try {
      await verifyTwoFactor(code)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  // 检查用户权限
  const hasPermission = (permission: string): boolean => {
    // 这里可以根据用户的角色或权限进行判断
    // 目前简化处理，所有已认证用户都有基本权限
    return isAuthenticated
  }

  // 检查是否需要邮箱验证
  const needsEmailVerification = (): boolean => {
    return isAuthenticated && !isEmailVerified
  }

  // 检查是否需要设置两步验证
  const needsTwoFactorSetup = (): boolean => {
    return isAuthenticated && !isTwoFactorEnabled
  }

  // 获取用户显示名称
  const getDisplayName = (): string => {
    return userName || userEmail || '用户'
  }

  // 获取用户头像URL
  const getAvatarUrl = (): string => {
    // 这里可以集成头像服务，如Gravatar
    if (!userEmail) return ''

    // 简单的默认头像生成（使用用户邮箱的首字母）
    const initial = userName?.charAt(0).toUpperCase() || userEmail.charAt(0).toUpperCase()
    return `https://ui-avatars.com/api/?name=${initial}&background=3b82f6&color=fff&size=128`
  }

  return {
    // 状态
    user,
    isAuthenticated,
    isLoading,
    error,
    isEmailVerified,
    isTwoFactorEnabled,
    userName,
    userEmail,

    // 计算属性
    displayName: getDisplayName(),
    avatarUrl: getAvatarUrl(),
    needsEmailVerification: needsEmailVerification(),
    needsTwoFactorSetup: needsTwoFactorSetup(),

    // 操作方法
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    verifyEmail: handleVerifyEmail,
    resendVerificationEmail: handleResendVerification,
    enableTwoFactor: handleEnableTwoFactor,
    disableTwoFactor: handleDisableTwoFactor,
    verifyTwoFactor: handleVerifyTwoFactor,

    // 权限检查
    hasPermission,

    // 辅助方法
    clearError,
    setLoading,
  }
}

export default useAuthHook