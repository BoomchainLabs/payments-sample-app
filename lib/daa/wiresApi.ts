import { daaInstance, nullIfEmpty } from './client'

export interface RiskSignals {
  ipAddress: string
  sessionId: string
  deviceId: string
}

export interface CreateWireAccountPayload {
  idempotencyKey: string
  clientEntityId?: string
  beneficiaryName: string
  accountNumber?: string
  routingNumber?: string
  iban?: string
  ffcMemo?: string
  billingDetails: {
    name: string
    city: string
    country: string
    line1: string
    line2: string
    district: string
    postalCode: string
  }
  bankAddress: {
    bankName?: string
    city?: string
    country: string
    line1?: string
    line2?: string
    district?: string
    postalCode?: string
  }
  intermediaryBank?: {
    identifier?: string
    type?: string
    countryCode?: string
  }
  riskSignals: RiskSignals
}

const WIRES_PATH = '/v1/banks/wires'

/** Returns the shared DAA axios instance */
function getInstance() {
  return daaInstance
}

/**
 * Create wire bank account
 */
function createWireAccount(payload: CreateWireAccountPayload) {
  payload.accountNumber = nullIfEmpty(payload.accountNumber)
  payload.routingNumber = nullIfEmpty(payload.routingNumber)
  payload.iban = nullIfEmpty(payload.iban)
  payload.bankAddress.bankName = nullIfEmpty(payload.bankAddress.bankName)
  payload.bankAddress.city = nullIfEmpty(payload.bankAddress.city)
  payload.bankAddress.line1 = nullIfEmpty(payload.bankAddress.line1)
  payload.bankAddress.line2 = nullIfEmpty(payload.bankAddress.line2)
  payload.bankAddress.district = nullIfEmpty(payload.bankAddress.district)
  payload.bankAddress.postalCode = nullIfEmpty(payload.bankAddress.postalCode)
  if (!payload.clientEntityId) {
    delete payload.clientEntityId
  }
  return daaInstance.post(WIRES_PATH, payload)
}

/**
 * Get wire bank accounts
 */
function getWireAccounts(clientEntityId?: string) {
  const params = {
    clientEntityId: clientEntityId || undefined,
  }
  return daaInstance.get(WIRES_PATH, { params })
}

/**
 * Get wire bank account by id
 */
function getWireAccountById(bankId: string) {
  return daaInstance.get(`${WIRES_PATH}/${bankId}`)
}

/**
 * Get wire bank account instructions
 *
 * Digital Asset Accounts must target an explicit wallet, so `walletId` is
 * required (the master wallet does not expose wire instructions).
 */
function getWireAccountInstructions(
  bankId: string,
  currency: string,
  walletId: string,
) {
  return daaInstance.get(`${WIRES_PATH}/${bankId}/instructions`, {
    params: {
      currency: nullIfEmpty(currency),
      walletId: nullIfEmpty(walletId),
    },
  })
}

export default {
  getInstance,
  createWireAccount,
  getWireAccounts,
  getWireAccountById,
  getWireAccountInstructions,
}
