import { exampleBankAccounts } from '@/lib/businessAccount/bankAccountsTestData'
import type { RiskSignals } from '@/lib/daa/wiresApi'

// Sample end-user risk signals used to prefill the Settings > Risk Signals
// values alongside the wire account form.
const sampleRiskSignals: RiskSignals = {
  ipAddress: '1.2.3.4',
  sessionId: '2c6d8d63-82e2-42a9-9baa-efb8251cfdd5',
  deviceId: '2c6d8d63-82e2-42a9-9baa-efb8251cfdd5',
}

const usAccount = {
  title: 'US Bank Account',
  formData: {
    clientEntityId: '9cdec2c0-1694-3e34-a457-da9fe5401e8e',
    beneficiaryName: 'Leon Callen',
    accountNumber: '111234555',
    routingNumber: '111000614',
    iban: '',
    ffcMemo: '',
    billingDetails: {
      name: 'Leon Callen',
      city: 'Boston',
      country: 'US',
      line1: '100 Money Street',
      line2: 'Suite 1',
      district: 'MA',
      postalCode: '01234',
    },
    bankAddress: {
      bankName: 'Wells Fargo Bank',
      city: 'San Francisco',
      country: 'US',
      line1: '333 Market Street',
      line2: '',
      district: 'CA',
      postalCode: '94105',
    },
    intermediaryBank: {
      identifier: '',
      type: '',
      countryCode: '',
    },
  },
  riskSignals: sampleRiskSignals,
}

// Reuse the non-US examples, adding an (empty) clientEntityId so the DAA form
// resets cleanly when switching between prefills.
const otherAccounts = exampleBankAccounts
  .filter((account) => account.title !== 'US Bank Account')
  .map((account) => ({
    title: account.title,
    formData: { clientEntityId: '', ...account.formData },
    riskSignals: sampleRiskSignals,
  }))

export const exampleDaaWireAccounts = [usAccount, ...otherAccounts]
