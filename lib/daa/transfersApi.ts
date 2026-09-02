import { daaInstance, nullIfEmpty } from './client'

export interface BlockchainDestination {
  type: string
  addressId: string
}

export interface AccountDestination {
  type: string
  id: string
}

export interface Source {
  type: string
  id: string
}

export interface Amount {
  amount: string
  currency: string
}

export interface CreateTransferPayload {
  idempotencyKey: string
  destination: BlockchainDestination | AccountDestination
  amount: Amount
  source?: Source
}

const TRANSFERS_PATH = '/v1/accounts/transfers'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Create Transfer
 */
function createTransfer(payload: CreateTransferPayload) {
  if (!payload.source?.id) {
    delete payload.source
  }
  return daaInstance.post(TRANSFERS_PATH, payload)
}

/**
 * Get transfers
 */
function getTransfers(
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
  return daaInstance.get(TRANSFERS_PATH, { params })
}

/**
 * Get Transfer by id
 */
function getTransferById(transferId: string) {
  return daaInstance.get(`${TRANSFERS_PATH}/${transferId}`)
}

export default {
  getInstance,
  createTransfer,
  getTransfers,
  getTransferById,
}
