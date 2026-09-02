<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-form>
          <v-text-field
            v-model="formData.description"
            label="Description"
            hint="Human-readable account label"
          />

          <v-select v-model="formData.type" :items="types" label="Type" />

          <v-select
            v-model="formData.purpose"
            :items="purposes"
            label="Purpose"
          />

          <v-text-field
            v-model="formData.clientEntityId"
            label="Client Entity Id (optional)"
            hint="Sub-entity identifier; omit if the caller owns the account"
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
import type { CreateAccountPayload } from '@/lib/daa/accountsApi'

const store = useMainStore()
const { $daaAccountsApi } = useNuxtApp()

const formData = reactive({
  description: '',
  type: 'first_party',
  purpose: 'custody',
  clientEntityId: '',
})

const types = ['first_party', 'third_party']
const purposes = ['custody']
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
  const payloadData: CreateAccountPayload = {
    idempotencyKey: uuidv4(),
    description: formData.description,
    type: formData.type,
    purpose: formData.purpose,
    clientEntityId: formData.clientEntityId,
  }
  try {
    await $daaAccountsApi.createAccount(payloadData)
  } catch (err) {
    error.value = err
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>
