import axios from 'axios'
import btoa from 'btoa'
import handleError from './routr_errors'
import phone from 'phone'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/**
 * Oversimplified version of a Routr API Client
 */
export default class RoutrClient {
  apiUrl: string
  username: string
  secret: string
  token: string
  resource: string

  constructor (apiUrl: string, username: string, secret: string) {
    this.apiUrl = apiUrl
    this.username = username
    this.secret = secret
  }

  async connect () {
    this.token = await this.getToken(this.username, this.secret)
    return this
  }

  resourceType (resource: string) {
    this.resource = resource
    return this
  }

  private async getToken (username: string, password: string) {
    try {
      const response = await axios
        .create({
          baseURL: `${this.apiUrl}`,
          headers: { Authorization: `Basic ${btoa(username + ':' + password)}` }
        })
        .get('/token')
      return response.data.data
    } catch (err) {
      handleError(err)
    }
  }

  async list (params: object | {}) {
    const queryParams = (p: any) => Object.keys(p).map(k => `${k}=${p[k]}`)
    try {
      const url = `${this.apiUrl}/${this.resource}?token=${
        this.token
      }&filter=*&${queryParams(params).join('&')}`
      const response = await axios.get(url)
      return response.data
    } catch (err) {
      handleError(err)
    }
  }

  async getDomainUriFromNumber (number: string) {
    const e164Number = phone(number)[0]
    const en = e164Number.replace('+', '%2B')
    try {
      const url = `${this.apiUrl}/numbers?token=${this.token}&filter=@.spec.location.telUrl=='tel:${en}'`
      let response = await axios.get(url)
      const numberObj = response.data.data[0]
      if (numberObj) {
        const url = `${this.apiUrl}/domains?token=${this.token}&filter=@.spec.context.egressPolicy.numberRef=='${numberObj.metadata.ref}'`
        const res = await axios.get(url)
        const domainObj = res.data.data[0]

        if (domainObj) {
          return domainObj.spec.context.domainUri
        }
      }
    } catch (err) {
      handleError(err)
    }
  }

  async get (ref: string) {
    const ep = `/${ref}`
    try {
      const response = await axios.get(
        `${this.apiUrl}/${this.resource}${ep}?token=${this.token}`
      )
      return response.data.data
    } catch (err) {
      handleError(err)
    }
  }

  async delete (ref: string) {
    const ep = `/${ref}`
    try {
      await axios.delete(
        `${this.apiUrl}/${this.resource}${ep}?token=${this.token}`
      )
    } catch (err) {
      handleError(err)
    }
  }

  async create (data: any) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.resource}?token=${this.token}`,
        data
      )
      return response.data.data
    } catch (err) {
      handleError(err)
    }
  }

  async update (data: any) {
    try {
      const ref = data.metadata.ref
      const response = await axios.put(
        `${this.apiUrl}/${this.resource}/${ref}?token=${this.token}`,
        data
      )
      return response.data.data
    } catch (err) {
      handleError(err)
    }
  }
}
