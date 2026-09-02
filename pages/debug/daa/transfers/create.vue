<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field v-model="formData.amount" label="Amount" />

          <v-select
            v-model="formData.destinationType"
            :items="destinationTypes"
            label="Destination Type"
          />

          <v-text-field
            v-model="formData.destinationId"
            :label="
              formData.destinationType === 'account'
                ? 'Destination Account ID'
                : 'Address ID'
            "
          />

          <v-text-field
            v-model="formData.sourceId"
            label="Source Account ID (optional)"
          />

          <v-btn
            variant="flat"
            class="mb-7"
            color="primary"
            :loading="loading"
            @click.prevent="makeApiCall"
          >
            Make api call
          </v-btn>
        </v-form>
      </v-col>
      <v-col cols="12" md="8">
        <RequestInfo
          :url="requestUrl"
          :payload="payload"
          :response="response"
        />
      </v-col>
    </v-row>
    <ErrorSheet
      :error="error"
      :show-error="showError"
      @on-change="onErrorSheetClosed"
    />
  </v-container>
</template>

<script setup lang="ts">
import { v4 as uuidv4 } from 'uuid'
import type { CreateTransferPayload } from '@/lib/daa/transfersApi'

const store = useMainStore()
const { $daaTransfersApi } = useNuxtApp()

const formData = reactive({
  amount: '',
  destinationType: 'verified_blockchain',
  destinationId: '',
  sourceId: '',
})

const destinationTypes = ['verified_blockchain', 'account']
const error = ref<any>({})
const loading = ref(false)
const showError = ref(false)

const payload = computed(() => store.getRequestPayload)
const response = computed(() => store.getRequestResponse)
const requestUrl = computed(() => store.getRequestUrl)

const onErrorSheetClosed = () => {
  error.value = {}
  showError.value = false
}

const makeApiCall = async () => {
  loading.value = true

  const amountDetail = {
    amount: formData.amount,
    currency: 'USD',
  }
  const destinationDetail =
    formData.destinationType === 'account'
      ? { type: 'account', id: formData.destinationId }
      : { type: 'verified_blockchain', addressId: formData.destinationId }

  const payloadData: CreateTransferPayload = {
    idempotencyKey: uuidv4(),
    amount: amountDetail,
    destination: destinationDetail,
    ...(formData.sourceId && {
      source: { type: 'account', id: formData.sourceId },
    }),
  }

  try {
    await $daaTransfersApi.createTransfer(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
