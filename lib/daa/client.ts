import get from 'lodash/get'
import axios from 'axios'

import { getAPIHostname } from '../apiTarget'

/**
 * Shared axios instance for the Digital Asset Accounts (DAA) endpoints.
 * Request/response store-capture and auth interceptors are attached once in
 * plugins/daa/index.ts.
 */
export const daaInstance = axios.create({
  baseURL: getAPIHostname(),
})

/**
 * Global error handler:
 * Intercepts all axios responses and maps to errorHandler object
 */
daaInstance.interceptors.response.use(
  function (response) {
    if (get(response, 'data.data')) {
      return response.data.data
    }
    if (response.data !== undefined) {
      return response.data
    }
    return response
  },
  function (error) {
    let response = get(error, 'response')
    if (!response) {
      response = error.toJSON()
    }
    return Promise.reject(response)
  },
)

export const nullIfEmpty = (prop: string | undefined) => {
  if (prop === '') {
    return undefined
  }
  return prop
}
