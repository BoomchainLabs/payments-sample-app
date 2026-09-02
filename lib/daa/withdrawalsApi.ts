import { daaInstance, nullIfEmpty } from './client'

export interface CreateWithdrawalPayload {
  idempotencyKey: string
  source: {
    id: string
    type: string
  }
  destination: {
    id: string
    type: string
  }
  amount: {
    amount: string
    currency: string
  }
  toAmount?: {
    currency: string
  }
}

const WITHDRAWALS_PATH = '/v1/accounts/withdrawals'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Create Withdrawal
 */
function createWithdrawal(payload: CreateWithdrawalPayload) {
  return daaInstance.post(WITHDRAWALS_PATH, payload)
}

/**
 * Get Withdrawals
 */
function getWithdrawals(
  clientEntityId: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    status: nullIfEmpty(status),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return daaInstance.get(WITHDRAWALS_PATH, { params })
}

/**
 * Get Withdrawal by id
 */
function getWithdrawalById(withdrawalId: string) {
  return daaInstance.get(`${WITHDRAWALS_PATH}/${withdrawalId}`)
}

export default {
  getInstance,
  createWithdrawal,
  getWithdrawals,
  getWithdrawalById,
}
