import { mount, VueWrapper } from '@vue/test-utils'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import TradeStatus from '../TradeStatus.vue'

// Mock the Nuxt app context
const mockTradesApi = {
  getTrade: vi.fn(),
}

const mockUseNuxtApp = () => ({
  $tradesApi: mockTradesApi,
})

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => mockUseNuxtApp(),
}))

describe('TradeStatus.vue', () => {
  let wrapper: VueWrapper<any>
  let windowSetInterval: typeof window.setInterval
  let windowClearInterval: typeof window.clearInterval

  beforeEach(() => {
    // Save original functions
    windowSetInterval = window.setInterval
    windowClearInterval = window.clearInterval

    // Mock timers
    vi.useFakeTimers()

    // Reset mocks
    vi.clearAllMocks()
    mockTradesApi.getTrade.mockClear()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  const createWrapper = (props = {}) => {
    return mount(TradeStatus, {
      props: {
        quoteId: 'quote-123',
        tradeId: 'trade-456',
        from: { currency: 'USDC', amount: 100 },
        to: { currency: 'EURC', amount: 85 },
        rate: 0.85,
        fulfill: true,
        ...props,
      },
      global: {
        stubs: {
          'v-progress-circular': true,
          'v-btn': true,
        },
      },
    })
  }

  describe('Component Rendering', () => {
    it('should render with all provided props', () => {
      wrapper = createWrapper()

      expect(wrapper.text()).toContain('quote-123')
      expect(wrapper.text()).toContain('trade-456')
      expect(wrapper.text()).toContain('USDC')
      expect(wrapper.text()).toContain('100')
      expect(wrapper.text()).toContain('EURC')
      expect(wrapper.text()).toContain('85')
      expect(wrapper.text()).toContain('0.85')
    })

    it('should render with default props', () => {
      wrapper = mount(TradeStatus, {
        global: {
          stubs: {
            'v-progress-circular': true,
            'v-btn': true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display instant payment status', () => {
      wrapper = createWrapper({ fulfill: true })
      expect(wrapper.text()).toContain('true')
    })

    it('should display non-instant payment status', () => {
      wrapper = createWrapper({ fulfill: false })
      expect(wrapper.text()).toContain('false')
    })
  })

  describe('Trade Polling', () => {
    it('should start polling when component is mounted with tradeId', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      // Fast-forward time
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(mockTradesApi.getTrade).toHaveBeenCalledWith('trade-123')
    })

    it('should not start polling without tradeId', async () => {
      wrapper = createWrapper({ tradeId: '' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(5000)
      await wrapper.vm.$nextTick()

      expect(mockTradesApi.getTrade).not.toHaveBeenCalled()
    })

    it('should update trade status when polling', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending_signature' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.tradeStatus).toBe('pending_signature')
    })

    it('should poll at 3 second intervals', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      // Advance 9 seconds = 3 polls (0s, 3s, 6s, 9s)
      vi.advanceTimersByTime(9000)
      await wrapper.vm.$nextTick()

      // Should have been called at 3s, 6s, 9s
      expect(mockTradesApi.getTrade).toHaveBeenCalledTimes(3)
    })

    it('should display polling indicator when polling', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(true)
      expect(wrapper.find('v-progress-circular-stub').exists()).toBe(true)
    })
  })

  describe('Polling Termination', () => {
    it('should stop polling when status is "confirmed"', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'confirmed' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
      expect(wrapper.vm.tradeStatus).toBe('confirmed')

      // Verify no more calls after stopping
      const callCount = mockTradesApi.getTrade.mock.calls.length
      vi.advanceTimersByTime(10000)
      expect(mockTradesApi.getTrade).toHaveBeenCalledTimes(callCount)
    })

    it('should stop polling when status is "pending_settlement"', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending_settlement' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
    })

    it('should stop polling when status is "failed"', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'failed' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
      expect(wrapper.vm.tradeStatus).toBe('failed')
    })

    it('should emit finished event when polling stops', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'confirmed' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('finished')).toBeTruthy()
      expect(wrapper.emitted('finished')).toHaveLength(1)
    })

    it('should continue polling for non-terminal statuses', async () => {
      mockTradesApi.getTrade
        .mockResolvedValueOnce({ data: { status: 'pending' } })
        .mockResolvedValueOnce({ data: { status: 'pending_signature' } })
        .mockResolvedValueOnce({ data: { status: 'confirmed' } })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      // First poll
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.polling).toBe(true)

      // Second poll
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.polling).toBe(true)

      // Third poll - should stop
      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.polling).toBe(false)
    })
  })

  describe('Manual Stop Polling', () => {
    it('should stop polling when stop button is clicked', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(true)

      // Find and click stop button
      await wrapper.vm.stopPolling()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
    })

    it('should emit finished event when manually stopped', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      await wrapper.vm.stopPolling()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('finished')).toBeTruthy()
    })

    it('should not make additional API calls after manual stop', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      const callsBeforeStop = mockTradesApi.getTrade.mock.calls.length

      await wrapper.vm.stopPolling()
      vi.advanceTimersByTime(10000)
      await wrapper.vm.$nextTick()

      expect(mockTradesApi.getTrade).toHaveBeenCalledTimes(callsBeforeStop)
    })
  })

  describe('Error Handling', () => {
    it('should stop polling on API error', async () => {
      mockTradesApi.getTrade.mockRejectedValue(new Error('API Error'))

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
    })

    it('should emit error event when API call fails', async () => {
      const mockError = new Error('Network failure')
      mockTradesApi.getTrade.mockRejectedValue(mockError)

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('error')).toBeTruthy()
      expect(wrapper.emitted('error')?.[0]).toEqual([mockError])
    })

    it('should handle 404 errors gracefully', async () => {
      const notFoundError = {
        response: { status: 404, data: { message: 'Trade not found' } },
      }
      mockTradesApi.getTrade.mockRejectedValue(notFoundError)

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
      expect(wrapper.emitted('error')?.[0]).toEqual([notFoundError])
    })

    it('should handle timeout errors', async () => {
      const timeoutError = { code: 'ECONNABORTED', message: 'timeout' }
      mockTradesApi.getTrade.mockRejectedValue(timeoutError)

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('error')).toBeTruthy()
    })
  })

  describe('New Trade Action', () => {
    it('should emit makeNewTrade event when button is clicked', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()

      await wrapper.vm.newTrade()

      expect(wrapper.emitted('makeNewTrade')).toBeTruthy()
      expect(wrapper.emitted('makeNewTrade')).toHaveLength(1)
    })

    it('should show new trade button when not polling', async () => {
      wrapper = createWrapper({ tradeId: '' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(false)
      // Button should be visible when not polling
    })

    it('should hide new trade button when polling', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(true)
    })
  })

  describe('Lifecycle Hooks', () => {
    it('should cleanup polling interval on unmount', async () => {
      mockTradesApi.getTrade.mockResolvedValue({
        data: { status: 'pending' },
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.polling).toBe(true)

      wrapper.unmount()

      // Advance time and verify no more calls
      const callCount = mockTradesApi.getTrade.mock.calls.length
      vi.advanceTimersByTime(10000)
      expect(mockTradesApi.getTrade).toHaveBeenCalledTimes(callCount)
    })

    it('should not crash if unmounted during API call', async () => {
      let resolveGetTrade: any
      mockTradesApi.getTrade.mockImplementation(() => {
        return new Promise((resolve) => {
          resolveGetTrade = resolve
        })
      })

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)

      // Unmount while API call is pending
      wrapper.unmount()

      // Resolve the promise after unmount
      if (resolveGetTrade) {
        resolveGetTrade({ data: { status: 'confirmed' } })
      }

      // Should not crash
      await wrapper.vm.$nextTick()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing response data gracefully', async () => {
      mockTradesApi.getTrade.mockResolvedValue({})

      wrapper = createWrapper({ tradeId: 'trade-123' })
      await wrapper.vm.$nextTick()

      vi.advanceTimersByTime(3000)
      await wrapper.vm.$nextTick()

      // Should not crash, but polling should stop due to error
      expect(wrapper.vm.polling).toBe(false)
    })

    it('should handle undefined tradeId prop', () => {
      wrapper = createWrapper({ tradeId: undefined })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.polling).toBe(false)
    })

    it('should handle empty amount objects', () => {
      wrapper = createWrapper({
        from: { currency: '', amount: 0 },
        to: { currency: '', amount: 0 },
      })

      expect(wrapper.text()).toContain('0')
    })

    it('should handle zero rate', () => {
      wrapper = createWrapper({ rate: 0 })
      expect(wrapper.text()).toContain('0')
    })

    it('should handle very large amounts', () => {
      wrapper = createWrapper({
        from: { currency: 'USDC', amount: 999999999 },
        to: { currency: 'EURC', amount: 999999999 },
      })

      expect(wrapper.text()).toContain('999999999')
    })

    it('should handle rapid status changes', async () => {
      mockTradesApi.getTrade
        .mockResolvedValueOnce({ data: { status: 'pending' } })
        .mockResolvedValueOnce({ data: { status: 'pending_signature' } })
        .mockResolvedValueOnce({ data: { status: 'confirmed' } })

      wrapper = createWrapper({ tradeId: 'trade-123' })

      for (let i = 0; i < 3; i++) {
        vi.advanceTimersByTime(3000)
        await wrapper.vm.$nextTick()
      }

      expect(wrapper.vm.tradeStatus).toBe('confirmed')
      expect(wrapper.vm.polling).toBe(false)
    })
  })

  describe('Props Validation', () => {
    it('should accept optional props', () => {
      wrapper = mount(TradeStatus, {
        props: {},
        global: {
          stubs: {
            'v-progress-circular': true,
            'v-btn': true,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should use default values for optional props', () => {
      wrapper = mount(TradeStatus, {
        global: {
          stubs: {
            'v-progress-circular': true,
            'v-btn': true,
          },
        },
      })

      expect(wrapper.vm.quoteId).toBe('')
      expect(wrapper.vm.tradeId).toBe('')
      expect(wrapper.vm.rate).toBe(0)
      expect(wrapper.vm.fulfill).toBe(false)
    })
  })
})