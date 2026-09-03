import { daaInstance, nullIfEmpty } from './client'
import type { RiskSignals } from './wiresApi'

export interface CreateDepositAddressPayload {
  idempotencyKey: string
  currency: string
  chain: string
  clientEntityId?: string
}

export interface CreateRecipientAddressPayload {
  idempotencyKey: string
  address: string
  addressTag?: string
  chain: string
  currency?: string
  description: string
  clientEntityId?: string
  riskSignals: RiskSignals
}

const DEPOSIT_PATH = '/v1/accounts/addresses/deposit'
const RECIPIENT_PATH = '/v1/addresses/recipient'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Create deposit address
 */
function createDepositAddress(payload: CreateDepositAddressPayload) {
  if (!payload.clientEntityId) {
    delete payload.clientEntityId
  }
  return daaInstance.post(DEPOSIT_PATH, payload)
}

/**
 * Get deposit addresses
 */
function getDepositAddresses(
  clientEntityId: string,
  chain: string,
  currency: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    chain: nullIfEmpty(chain),
    currency: nullIfEmpty(currency),
  }
  return daaInstance.get(DEPOSIT_PATH, { params })
}

/**
 * Create recipient address
 */
function createRecipientAddress(payload: CreateRecipientAddressPayload) {
  payload.currency = nullIfEmpty(payload.currency)
  if (!payload.clientEntityId) {
    delete payload.clientEntityId
  }
  return daaInstance.post(RECIPIENT_PATH, payload)
}

/**
 * Get recipient addresses
 */
function getRecipientAddresses(
  clientEntityId: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return daaInstance.get(RECIPIENT_PATH, { params })
}

/**
 * Delete selected recipient address
 */
function deleteRecipientAddress(recipientId: string) {
  return daaInstance.delete(`${RECIPIENT_PATH}/${recipientId}`)
}

export default {
  getInstance,
  createDepositAddress,
  getDepositAddresses,
  createRecipientAddress,
  getRecipientAddresses,
  deleteRecipientAddress,
}
