import axios from 'axios'
import cpsTradesApi from '../cpsTradesApi'
import { getAPIHostname } from '../apiTarget'
import type {
  CreateCpsQuotePayload,
  CreateCpsTradePayload,
  CreatePiFXSignaturePayload,
  FundingPresignPayload,
  CpsFundPayload,
  SingleTradeWitnessPermit2,
} from '../cpsTradesApi'

// Mock dependencies
jest.mock('axios')
jest.mock('../apiTarget')

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetAPIHostname = getAPIHostname as jest.MockedFunction<
  typeof getAPIHostname
>

describe('cpsTradesApi', () => {
  let mockAxiosInstance: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
        request: {
          use: jest.fn(),
        },
      },
    }

    mockedGetAPIHostname.mockReturnValue('https://api-sandbox.circle.com')
    mockedAxios.create.mockReturnValue(mockAxiosInstance)
  })

  describe('getInstance', () => {
    it('should return the axios instance', () => {
      const instance = cpsTradesApi.getInstance()
      expect(instance).toBe(mockAxiosInstance)
    })

    it('should create axios instance with correct baseURL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api-sandbox.circle.com',
      })
    })
  })

  describe('createQuote', () => {
    it('should create a quote with both from and to amounts', async () => {
      const payload: CreateCpsQuotePayload = {
        from: {
          amount: 100,
          currency: 'USDC',
        },
        to: {
          amount: 85,
          currency: 'EURC',
        },
      }

      const mockResponse = {
        data: {
          data: {
            quoteId: 'quote-123',
            rate: 0.85,
          },
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      await cpsTradesApi.createQuote(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/quotes',
        payload,
      )
    })

    it('should remove from.amount if not provided', async () => {
      const payload: CreateCpsQuotePayload = {
        from: {
          currency: 'USDC',
        },
        to: {
          amount: 85,
          currency: 'EURC',
        },
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.createQuote(payload)

      const calledPayload = mockAxiosInstance.post.mock.calls[0][1]
      expect(calledPayload.from).not.toHaveProperty('amount')
    })

    it('should remove to.amount if not provided', async () => {
      const payload: CreateCpsQuotePayload = {
        from: {
          amount: 100,
          currency: 'USDC',
        },
        to: {
          currency: 'EURC',
        },
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.createQuote(payload)

      const calledPayload = mockAxiosInstance.post.mock.calls[0][1]
      expect(calledPayload.to).not.toHaveProperty('amount')
    })

    it('should handle API errors', async () => {
      const payload: CreateCpsQuotePayload = {
        from: { currency: 'USDC', amount: 100 },
        to: { currency: 'EURC' },
      }

      const mockError = new Error('Network error')
      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(cpsTradesApi.createQuote(payload)).rejects.toThrow(
        'Network error',
      )
    })
  })

  describe('createTrade', () => {
    it('should create a trade with valid payload', async () => {
      const payload: CreateCpsTradePayload = {
        idempotencyKey: 'idem-key-123',
        quoteId: 'quote-123',
      }

      const mockResponse = {
        data: {
          data: {
            tradeId: 'trade-456',
            status: 'pending',
          },
        },
      }

      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      await cpsTradesApi.createTrade(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/trades',
        payload,
      )
    })

    it('should handle validation errors from API', async () => {
      const payload: CreateCpsTradePayload = {
        idempotencyKey: '',
        quoteId: 'quote-123',
      }

      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid idempotency key' },
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(cpsTradesApi.createTrade(payload)).rejects.toEqual(mockError)
    })
  })

  describe('getTrades', () => {
    it('should fetch trades without query parameters', async () => {
      const mockResponse = {
        data: {
          data: {
            trades: [],
            pagination: {},
          },
        },
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await cpsTradesApi.getTrades()

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/trades',
        {
          params: {
            startCreateDateInclusive: undefined,
            endCreateDateInclusive: undefined,
            status: undefined,
            type: undefined,
            pageAfter: undefined,
            pageBefore: undefined,
            pageSize: undefined,
          },
        },
      )
    })

    it('should fetch trades with all query parameters', async () => {
      const mockResponse = { data: { data: { trades: [] } } }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await cpsTradesApi.getTrades(
        '2024-01-01',
        '2024-01-31',
        'confirmed',
        'maker',
        'page-after-123',
        'page-before-456',
        '50',
      )

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/trades',
        {
          params: {
            startCreateDateInclusive: '2024-01-01',
            endCreateDateInclusive: '2024-01-31',
            status: 'confirmed',
            type: 'maker',
            pageAfter: 'page-after-123',
            pageBefore: 'page-before-456',
            pageSize: '50',
          },
        },
      )
    })

    it('should convert empty strings to undefined', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getTrades('', '', '', '', '', '', '')

      const params = mockAxiosInstance.get.mock.calls[0][1].params
      expect(params.startCreateDateInclusive).toBeUndefined()
      expect(params.endCreateDateInclusive).toBeUndefined()
      expect(params.status).toBeUndefined()
      expect(params.type).toBeUndefined()
    })

    it('should handle pagination parameters correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: { trades: [] } },
      })

      await cpsTradesApi.getTrades(
        undefined,
        undefined,
        undefined,
        undefined,
        'cursor-123',
        undefined,
        '25',
      )

      const params = mockAxiosInstance.get.mock.calls[0][1].params
      expect(params.pageAfter).toBe('cursor-123')
      expect(params.pageSize).toBe('25')
    })
  })

  describe('getTrade', () => {
    it('should fetch a single trade by ID', async () => {
      const tradeId = 'trade-123'
      const mockResponse = {
        data: {
          data: {
            id: tradeId,
            status: 'confirmed',
          },
        },
      }

      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      await cpsTradesApi.getTrade(tradeId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/trades/trade-123',
        { params: { type: undefined } },
      )
    })

    it('should fetch trade with type parameter', async () => {
      const tradeId = 'trade-123'
      const type = 'maker'

      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getTrade(tradeId, type)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/trades/trade-123',
        { params: { type: 'maker' } },
      )
    })

    it('should handle empty string type as undefined', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getTrade('trade-123', '')

      const params = mockAxiosInstance.get.mock.calls[0][1].params
      expect(params.type).toBeUndefined()
    })

    it('should handle 404 errors for non-existent trades', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Trade not found' },
        },
      }

      mockAxiosInstance.get.mockRejectedValue(mockError)

      await expect(cpsTradesApi.getTrade('non-existent')).rejects.toEqual(
        mockError,
      )
    })
  })

  describe('registerSignature', () => {
    it('should register a signature with complete payload', async () => {
      const payload: CreatePiFXSignaturePayload = {
        tradeId: 'trade-123',
        type: 'maker',
        address: '0x1234567890abcdef',
        details: {
          deadline: 1234567890,
          nonce: 1,
          fee: 100,
          consideration: {
            quoteId: 'quote-123',
            base: 'USDC',
            quote: 'EURC',
            quoteAmount: 100,
            baseAmount: 85,
            maturity: 1234567890,
          },
        },
        signature: '0xabcdef123456',
      }

      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } })

      await cpsTradesApi.registerSignature(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures',
        payload,
      )
    })

    it('should register signature with optional recipient', async () => {
      const payload: CreatePiFXSignaturePayload = {
        tradeId: 'trade-123',
        type: 'maker',
        address: '0x1234567890abcdef',
        details: {
          recipient: '0xrecipient',
          deadline: 1234567890,
          nonce: 1,
          fee: 100,
          consideration: {
            quoteId: 'quote-123',
            base: 'USDC',
            quote: 'EURC',
            quoteAmount: 100,
            baseAmount: 85,
            maturity: 1234567890,
          },
        },
        signature: '0xabcdef123456',
      }

      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } })

      await cpsTradesApi.registerSignature(payload)

      const calledPayload = mockAxiosInstance.post.mock.calls[0][1]
      expect(calledPayload.details.recipient).toBe('0xrecipient')
    })

    it('should handle invalid signature format errors', async () => {
      const payload: CreatePiFXSignaturePayload = {
        tradeId: 'trade-123',
        type: 'maker',
        address: '0x1234567890abcdef',
        details: {
          deadline: 1234567890,
          nonce: 1,
          fee: 100,
          consideration: {
            quoteId: 'quote-123',
            base: 'USDC',
            quote: 'EURC',
            quoteAmount: 100,
            baseAmount: 85,
            maturity: 1234567890,
          },
        },
        signature: 'invalid',
      }

      const mockError = {
        response: {
          status: 400,
          data: { message: 'Invalid signature format' },
        },
      }

      mockAxiosInstance.post.mockRejectedValue(mockError)

      await expect(cpsTradesApi.registerSignature(payload)).rejects.toEqual(
        mockError,
      )
    })
  })

  describe('getPresignData', () => {
    it('should fetch presign data without recipient address', async () => {
      const type = 'maker'
      const tradeId = 'trade-123'

      mockAxiosInstance.get.mockResolvedValue({
        data: { data: { presignData: {} } },
      })

      await cpsTradesApi.getPresignData(type, tradeId)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures/presign/maker/trade-123',
        { params: {} },
      )
    })

    it('should fetch presign data with recipient address', async () => {
      const type = 'maker'
      const tradeId = 'trade-123'
      const recipientAddress = '0xrecipient'

      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getPresignData(type, tradeId, recipientAddress)

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures/presign/maker/trade-123',
        { params: { recipientAddress: '0xrecipient' } },
      )
    })

    it('should handle taker type correctly', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getPresignData('taker', 'trade-456')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures/presign/taker/trade-456',
        { params: {} },
      )
    })
  })

  describe('getFundingPresignData', () => {
    it('should fetch funding presign data for single trade (gross)', async () => {
      const payload: FundingPresignPayload = {
        contractTradeIds: ['trade-123'],
        fundingMode: 'gross',
        traderType: 'maker',
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: { permit2Data: {} } },
      })

      await cpsTradesApi.getFundingPresignData(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures/funding/presign',
        payload,
      )
    })

    it('should fetch funding presign data for multiple trades (net)', async () => {
      const payload: FundingPresignPayload = {
        contractTradeIds: ['trade-123', 'trade-456', 'trade-789'],
        fundingMode: 'net',
        traderType: 'maker',
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.getFundingPresignData(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/signatures/funding/presign',
        payload,
      )
      expect(payload.contractTradeIds).toHaveLength(3)
    })

    it('should handle empty trade IDs array', async () => {
      const payload: FundingPresignPayload = {
        contractTradeIds: [],
        fundingMode: 'gross',
        traderType: 'taker',
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.getFundingPresignData(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })
  })

  describe('fund', () => {
    const createMockPermit2Single = (): SingleTradeWitnessPermit2 => ({
      permitted: {
        token: '0xtoken',
        amount: 1000000,
      },
      spender: '0xspender',
      nonce: 1,
      deadline: 1234567890,
      witness: {
        id: 123,
      },
    })

    it('should fund a trade as maker with gross funding', async () => {
      const payload: CpsFundPayload = {
        type: 'maker',
        signature: '0xsignature',
        fundingMode: 'gross',
        permit2: createMockPermit2Single(),
      }

      mockAxiosInstance.post.mockResolvedValue({
        data: { success: true },
      })

      await cpsTradesApi.fund(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/fund',
        payload,
      )
    })

    it('should fund trades as maker with net funding', async () => {
      const payload: CpsFundPayload = {
        type: 'maker',
        signature: '0xsignature',
        fundingMode: 'net',
        permit2: {
          permitted: [
            { token: '0xtoken1', amount: 1000000 },
            { token: '0xtoken2', amount: 2000000 },
          ],
          spender: '0xspender',
          nonce: 1,
          deadline: 1234567890,
          witness: {
            ids: [123, 456],
          },
        },
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.fund(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/exchange/cps/fund',
        payload,
      )
    })

    it('should fund a trade as taker with gross funding', async () => {
      const payload: CpsFundPayload = {
        type: 'taker',
        signature: '0xsignature',
        fundingMode: 'gross',
        permit2: createMockPermit2Single(),
      }

      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      await cpsTradesApi.fund(payload)

      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })

    it('should throw error when taker attempts net funding', async () => {
      const payload: CpsFundPayload = {
        type: 'taker',
        signature: '0xsignature',
        fundingMode: 'net',
        permit2: createMockPermit2Single(),
      }

      await expect(cpsTradesApi.fund(payload)).rejects.toThrow(
        'Net funding mode is only available for makers',
      )

      expect(mockAxiosInstance.post).not.toHaveBeenCalled()
    })

    it('should validate funding mode constraint before API call', () => {
      const payload: CpsFundPayload = {
        type: 'taker',
        signature: '0xsignature',
        fundingMode: 'net',
        permit2: createMockPermit2Single(),
      }

      expect(() => cpsTradesApi.fund(payload)).rejects.toThrow()
    })

    it('should handle batch permit2 structure for net funding', async () => {
      const payload: CpsFundPayload = {
        type: 'maker',
        signature: '0xsignature',
        fundingMode: 'net',
        permit2: {
          permitted: [
            { token: '0xtoken1', amount: 1000000 },
            { token: '0xtoken2', amount: 2000000 },
            { token: '0xtoken3', amount: 3000000 },
          ],
          spender: '0xspender',
          nonce: 5,
          deadline: 9999999999,
          witness: {
            ids: [1, 2, 3],
          },
        },
      }

      mockAxiosInstance.post.mockResolvedValue({ data: { success: true } })

      await cpsTradesApi.fund(payload)

      const calledPayload = mockAxiosInstance.post.mock.calls[0][1]
      expect(Array.isArray(calledPayload.permit2.permitted)).toBe(true)
      expect(calledPayload.permit2.permitted).toHaveLength(3)
      expect(calledPayload.permit2.witness.ids).toEqual([1, 2, 3])
    })
  })

  describe('Response Interceptor', () => {
    it('should extract data from nested response structure', () => {
      const mockResponse = {
        data: {
          data: { result: 'success' },
        },
      }

      // Get the interceptor handler
      const interceptorUse = mockAxiosInstance.interceptors.response.use
      expect(interceptorUse).toHaveBeenCalled()

      // Extract the success handler
      const successHandler = interceptorUse.mock.calls[0][0]
      const result = successHandler(mockResponse)

      expect(result).toEqual({ result: 'success' })
    })

    it('should return response as-is if no nested data', () => {
      const mockResponse = {
        data: { result: 'success' },
      }

      const interceptorUse = mockAxiosInstance.interceptors.response.use
      const successHandler = interceptorUse.mock.calls[0][0]
      const result = successHandler(mockResponse)

      expect(result).toEqual(mockResponse)
    })

    it('should handle error responses with response object', () => {
      const mockError = {
        response: {
          status: 500,
          data: { message: 'Server error' },
        },
      }

      const interceptorUse = mockAxiosInstance.interceptors.response.use
      const errorHandler = interceptorUse.mock.calls[0][1]

      expect(errorHandler(mockError)).rejects.toEqual(mockError.response)
    })

    it('should handle network errors without response object', () => {
      const mockError = new Error('Network error')
      ;(mockError as any).toJSON = () => ({
        message: 'Network error',
      })

      const interceptorUse = mockAxiosInstance.interceptors.response.use
      const errorHandler = interceptorUse.mock.calls[0][1]

      expect(errorHandler(mockError)).rejects.toEqual({
        message: 'Network error',
      })
    })
  })

  describe('nullIfEmpty helper', () => {
    it('should convert empty string to undefined in query params', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getTrades('', '', '', '', '', '', '')

      const params = mockAxiosInstance.get.mock.calls[0][1].params
      Object.values(params).forEach((value) => {
        expect(value).toBeUndefined()
      })
    })

    it('should preserve non-empty string values', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: {} })

      await cpsTradesApi.getTrades('2024-01-01', '2024-01-31', 'confirmed')

      const params = mockAxiosInstance.get.mock.calls[0][1].params
      expect(params.startCreateDateInclusive).toBe('2024-01-01')
      expect(params.endCreateDateInclusive).toBe('2024-01-31')
      expect(params.status).toBe('confirmed')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      }

      mockAxiosInstance.post.mockRejectedValue(timeoutError)

      await expect(
        cpsTradesApi.createQuote({
          from: { currency: 'USDC', amount: 100 },
          to: { currency: 'EURC' },
        }),
      ).rejects.toEqual(timeoutError)
    })

    it('should handle malformed JSON responses', async () => {
      const malformedError = new SyntaxError('Unexpected token in JSON')
      mockAxiosInstance.get.mockRejectedValue(malformedError)

      await expect(cpsTradesApi.getTrades()).rejects.toThrow(
        'Unexpected token in JSON',
      )
    })

    it('should handle authentication errors (401)', async () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      }

      mockAxiosInstance.get.mockRejectedValue(authError)

      await expect(cpsTradesApi.getTrade('trade-123')).rejects.toEqual(
        authError.response,
      )
    })

    it('should handle rate limiting errors (429)', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too many requests' },
        },
      }

      mockAxiosInstance.post.mockRejectedValue(rateLimitError)

      await expect(
        cpsTradesApi.createTrade({
          idempotencyKey: 'key',
          quoteId: 'quote',
        }),
      ).rejects.toEqual(rateLimitError.response)
    })
  })

  describe('Type Safety', () => {
    it('should enforce correct payload types for createQuote', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      const validPayload: CreateCpsQuotePayload = {
        from: { currency: 'USDC', amount: 100 },
        to: { currency: 'EURC' },
      }

      await cpsTradesApi.createQuote(validPayload)
      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })

    it('should enforce correct types for funding modes', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: {} })

      const validPayload: CpsFundPayload = {
        type: 'maker',
        signature: '0xsig',
        fundingMode: 'gross',
        permit2: {
          permitted: { token: '0xtoken', amount: 100 },
          spender: '0xspender',
          nonce: 1,
          deadline: 123,
          witness: { id: 1 },
        },
      }

      await cpsTradesApi.fund(validPayload)
      expect(mockAxiosInstance.post).toHaveBeenCalled()
    })
  })
})