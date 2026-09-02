import { daaInstance, nullIfEmpty } from './client'

export interface CreateAccountPayload {
  idempotencyKey: string
  description: string
  type: string
  purpose: string
  clientEntityId?: string
}

const ACCOUNTS_PATH = '/v1/accounts'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Create Account
 */
function createAccount(payload: CreateAccountPayload) {
  if (!payload.clientEntityId) {
    delete payload.clientEntityId
  }
  return daaInstance.post(ACCOUNTS_PATH, payload)
}

/**
 * Get Accounts
 */
function getAccounts(
  clientEntityId: string,
  type: string,
  purpose: string,
  status: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    type: nullIfEmpty(type),
    purpose: nullIfEmpty(purpose),
    status: nullIfEmpty(status),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return daaInstance.get(ACCOUNTS_PATH, { params })
}

/**
 * Get Account by id
 */
function getAccountById(accountId: string) {
  return daaInstance.get(`${ACCOUNTS_PATH}/${accountId}`)
}

export default {
  getInstance,
  createAccount,
  getAccounts,
  getAccountById,
}
