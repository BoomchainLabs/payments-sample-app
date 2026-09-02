import { daaInstance, nullIfEmpty } from './client'

const TRANSACTIONS_PATH = '/v1/accounts/transactions'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Get Account Transactions
 */
function getTransactions(
  clientEntityId: string,
  accountId: string,
  type: string,
  currency: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    accountId: nullIfEmpty(accountId),
    type: nullIfEmpty(type),
    currency: nullIfEmpty(currency),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return daaInstance.get(TRANSACTIONS_PATH, { params })
}

export default {
  getInstance,
  getTransactions,
}
