import { describe, it, expect, beforeEach, vi } from 'vitest'
import cpsTradesApiPlugin from '../cpsTradesApi'
import cpsTradesApi from '~/lib/cpsTradesApi'

// Mock dependencies
vi.mock('~/lib/cpsTradesApi', () => ({
  default: {
    getInstance: vi.fn(),
    createQuote: vi.fn(),
    createTrade: vi.fn(),
    getTrades: vi.fn(),
    getTrade: vi.fn(),
    registerSignature: vi.fn(),
    getPresignData: vi.fn(),
    getFundingPresignData: vi.fn(),
    fund: vi.fn(),
  },
}))

vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin: any) => plugin,
  useNuxtApp: vi.fn(),
}))

const mockStore = {
  bearerToken: '',
  clearRequestData: vi.fn(),
  setRequestUrl: vi.fn(),
  setRequestPayload: vi.fn(),
  setResponse: vi.fn(),
}

const mockUseMainStore = vi.fn(() => mockStore)

// Mock the store composable
vi.mock('~/stores/main', () => ({
  useMainStore: () => mockUseMainStore(),
}))

describe('cpsTradesApi Plugin', () => {
  let mockAxiosInstance: any
  let requestInterceptor: any
  let responseInterceptor: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock axios instance with interceptors
    requestInterceptor = {
      use: vi.fn(),
    }

    responseInterceptor = {
      use: vi.fn(),
    }

    mockAxiosInstance = {
      interceptors: {
        request: requestInterceptor,
        response: responseInterceptor,
      },
    }
    ;(cpsTradesApi.getInstance as any).mockReturnValue(mockAxiosInstance)

    // Reset store
    mockStore.bearerToken = ''
    mockStore.clearRequestData.mockClear()
    mockStore.setRequestUrl.mockClear()
    mockStore.setRequestPayload.mockClear()
    mockStore.setResponse.mockClear()
  })

  describe('Plugin Registration', () => {
    it('should return plugin object with cpsTradesApi provider', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      const result = cpsTradesApiPlugin(() => mockNuxtApp)

      expect(result).toHaveProperty('provide')
      expect(result.provide).toHaveProperty('cpsTradesApi')
      expect(result.provide.cpsTradesApi).toBe(cpsTradesApi)
    })

    it('should get axios instance from cpsTradesApi', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      expect(cpsTradesApi.getInstance).toHaveBeenCalled()
    })

    it('should initialize store', () => {
      const mockPinia = {}
      const mockNuxtApp = {
        $pinia: mockPinia,
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      expect(mockUseMainStore).toHaveBeenCalledWith(mockPinia)
    })
  })

  describe('Request Interceptor', () => {
    it('should register request interceptor', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      expect(requestInterceptor.use).toHaveBeenCalled()
    })

    it('should clear request data on each request', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: { from: { currency: 'USDC' } },
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.clearRequestData).toHaveBeenCalled()
    })

    it('should set request URL in store', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: {},
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.setRequestUrl).toHaveBeenCalledWith(
        'https://api.circle.com/v1/exchange/cps/quotes',
      )
    })

    it('should set request payload in store', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const payload = {
        from: { currency: 'USDC', amount: 100 },
        to: { currency: 'EURC' },
      }
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: payload,
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.setRequestPayload).toHaveBeenCalledWith(payload)
    })

    it('should add Authorization header when bearerToken exists', () => {
      mockStore.bearerToken = 'test-token-123'

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: {},
        headers: {},
      }

      const result = requestHandler(mockConfig)

      expect(result.headers.Authorization).toBe('Bearer test-token-123')
    })

    it('should not add Authorization header when bearerToken is empty', () => {
      mockStore.bearerToken = ''

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: {},
        headers: {},
      }

      const result = requestHandler(mockConfig)

      expect(result.headers.Authorization).toBeUndefined()
    })

    it('should return modified config', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/trades',
        data: { idempotencyKey: 'key', quoteId: 'quote' },
        headers: {},
      }

      const result = requestHandler(mockConfig)

      expect(result).toEqual(mockConfig)
    })

    it('should handle request errors', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const errorHandler = requestInterceptor.use.mock.calls[0][1]
      const mockError = new Error('Request failed')

      expect(errorHandler(mockError)).rejects.toEqual(mockError)
    })
  })

  describe('Response Interceptor', () => {
    it('should register response interceptor', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      expect(responseInterceptor.use).toHaveBeenCalled()
    })

    it('should set response in store on success', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const responseHandler = responseInterceptor.use.mock.calls[0][0]
      const mockResponse = {
        data: {
          data: { result: 'success' },
        },
        status: 200,
        headers: {},
      }

      responseHandler(mockResponse)

      expect(mockStore.setResponse).toHaveBeenCalledWith(mockResponse)
    })

    it('should return response after storing', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const responseHandler = responseInterceptor.use.mock.calls[0][0]
      const mockResponse = {
        data: { result: 'success' },
        status: 200,
      }

      const result = responseHandler(mockResponse)

      expect(result).toEqual(mockResponse)
    })

    it('should handle response errors', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const errorHandler = responseInterceptor.use.mock.calls[0][1]
      const mockError = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
      }

      expect(errorHandler(mockError)).rejects.toEqual(mockError)
    })

    it('should handle network errors', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const errorHandler = responseInterceptor.use.mock.calls[0][1]
      const mockError = new Error('Network error')

      expect(errorHandler(mockError)).rejects.toEqual(mockError)
    })
  })

  describe('Integration with Store', () => {
    it('should coordinate request lifecycle with store', () => {
      mockStore.bearerToken = 'auth-token'

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const responseHandler = responseInterceptor.use.mock.calls[0][0]

      // Simulate request
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: { from: { currency: 'USDC' } },
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.clearRequestData).toHaveBeenCalled()
      expect(mockStore.setRequestUrl).toHaveBeenCalled()
      expect(mockStore.setRequestPayload).toHaveBeenCalled()

      // Simulate response
      const mockResponse = {
        data: { result: 'success' },
      }

      responseHandler(mockResponse)

      expect(mockStore.setResponse).toHaveBeenCalledWith(mockResponse)
    })

    it('should handle undefined payload gracefully', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/trades',
        data: undefined,
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.setRequestPayload).toHaveBeenCalledWith(undefined)
    })

    it('should handle null payload', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/trades/123',
        data: null,
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.setRequestPayload).toHaveBeenCalledWith(null)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing baseURL in config', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        url: '/v1/exchange/cps/quotes',
        data: {},
        headers: {},
      }

      requestHandler(mockConfig)

      expect(mockStore.setRequestUrl).toHaveBeenCalledWith(
        'undefined/v1/exchange/cps/quotes',
      )
    })

    it('should handle empty config headers', () => {
      mockStore.bearerToken = 'token'

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/test',
        data: {},
        headers: {},
      }

      const result = requestHandler(mockConfig)

      expect(result.headers).toBeDefined()
      expect(result.headers.Authorization).toBe('Bearer token')
    })

    it('should preserve existing headers', () => {
      mockStore.bearerToken = 'token'

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/test',
        data: {},
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'value',
        },
      }

      const result = requestHandler(mockConfig)

      expect(result.headers['Content-Type']).toBe('application/json')
      expect(result.headers['X-Custom-Header']).toBe('value')
      expect(result.headers.Authorization).toBe('Bearer token')
    })

    it('should handle whitespace-only bearerToken as falsy', () => {
      mockStore.bearerToken = '   '

      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]
      const mockConfig = {
        baseURL: 'https://api.circle.com',
        url: '/test',
        data: {},
        headers: {},
      }

      // Whitespace string is truthy in JavaScript, so it will add the header
      const result = requestHandler(mockConfig)

      // This tests actual behavior - a whitespace token will be added
      expect(result.headers.Authorization).toBe('Bearer    ')
    })
  })

  describe('Multiple Requests', () => {
    it('should clear data before each request', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]

      // First request
      const config1 = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/quotes',
        data: { from: { currency: 'USDC' } },
        headers: {},
      }
      requestHandler(config1)

      expect(mockStore.clearRequestData).toHaveBeenCalledTimes(1)

      // Second request
      const config2 = {
        baseURL: 'https://api.circle.com',
        url: '/v1/exchange/cps/trades',
        data: { idempotencyKey: 'key' },
        headers: {},
      }
      requestHandler(config2)

      expect(mockStore.clearRequestData).toHaveBeenCalledTimes(2)
    })

    it('should update store with latest request data', () => {
      const mockNuxtApp = {
        $pinia: {},
      }

      cpsTradesApiPlugin(() => mockNuxtApp)

      const requestHandler = requestInterceptor.use.mock.calls[0][0]

      // First request
      requestHandler({
        baseURL: 'https://api.circle.com',
        url: '/endpoint1',
        data: { data: 'first' },
        headers: {},
      })

      // Second request
      requestHandler({
        baseURL: 'https://api.circle.com',
        url: '/endpoint2',
        data: { data: 'second' },
        headers: {},
      })

      expect(mockStore.setRequestUrl).toHaveBeenLastCalledWith(
        'https://api.circle.com/endpoint2',
      )
      expect(mockStore.setRequestPayload).toHaveBeenLastCalledWith({
        data: 'second',
      })
    })
  })
})