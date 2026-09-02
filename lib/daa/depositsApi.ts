import { daaInstance, nullIfEmpty } from './client'

const DEPOSITS_PATH = '/v1/accounts/deposits'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Get Deposits
 */
function getDeposits(
  clientEntityId: string,
  type: string,
  from: string,
  to: string,
  pageBefore: string,
  pageAfter: string,
  pageSize: string,
) {
  const params = {
    clientEntityId: nullIfEmpty(clientEntityId),
    type: nullIfEmpty(type),
    from: nullIfEmpty(from),
    to: nullIfEmpty(to),
    pageBefore: nullIfEmpty(pageBefore),
    pageAfter: nullIfEmpty(pageAfter),
    pageSize: nullIfEmpty(pageSize),
  }
  return daaInstance.get(DEPOSITS_PATH, { params })
}

export default {
  getInstance,
  getDeposits,
}
