import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { toast } from 'react-hot-toast'

// API响应接口
export interface ApiError {
  success: false
  error: string
  message?: string
  details?: any
}

export interface ApiResponse<T = any> {
  success: true
  data: T
  message?: string
}

// 创建axios实例
const createApiClient = (): AxiosInstance => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
  client.interceptors.request.use(
    (config) => {
      // 添加认证token
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = generateRequestId()

      // 开发环境下打印请求信息
      if (import.meta.env.DEV) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        })
      }

      return config
    },
    (error) => {
      console.error('Request interceptor error:', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // 开发环境下打印响应信息
      if (import.meta.env.DEV) {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        })
      }

      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

      // 开发环境下打印错误信息
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }

      // 处理401未授权错误
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // 尝试刷新token
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            // 重新发送原始请求
            return client(originalRequest)
          }
        } catch (refreshError) {
          // 刷新失败，跳转到登录页
          handleAuthError()
          return Promise.reject(refreshError)
        }
      }

      // 处理其他错误
      const apiError = error.response?.data as ApiError
      const errorMessage = apiError?.error || apiError?.message || '请求失败，请稍后重试'

      // 显示错误提示
      if (error.response?.status !== 401) { // 401错误已在上面处理
        toast.error(errorMessage)
      }

      return Promise.reject(error)
    }
  )

  return client
}

// 生成请求ID
const generateRequestId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// 刷新访问令牌
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      return false
    }

    const response = await axios.post('/auth/refresh', {
      refreshToken,
    })

    const { accessToken, refreshToken: newRefreshToken } = response.data.data

    localStorage.setItem('accessToken', accessToken)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    }

    return true
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    return false
  }
}

// 处理认证错误
const handleAuthError = (): void => {
  // 清除本地存储的认证信息
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // 显示提示信息
  toast.error('登录已过期，请重新登录')

  // 跳转到登录页
  window.location.href = '/login'
}

// 创建API客户端实例
export const apiClient = createApiClient()

// 通用请求方法
export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get(url, config).then(response => response.data)
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post(url, data, config).then(response => response.data)
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put(url, data, config).then(response => response.data)
  },

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch(url, data, config).then(response => response.data)
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete(url, config).then(response => response.data)
  },
}

// 文件上传方法
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; name: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const config: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  }

  const response = await apiClient.post('/upload', formData, config)
  return response.data.data
}

// 下载文件方法
export const downloadFile = async (
  url: string,
  filename?: string
): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    })

    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Download failed:', error)
    toast.error('文件下载失败')
  }
}

// 取消请求的方法
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

export const isCancel = (error: any): boolean => {
  return axios.isCancel(error)
}

// 重试机制
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError
}

// 导出默认实例
export default apiClient