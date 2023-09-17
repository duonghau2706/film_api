import axios from 'axios'
import FormData from 'form-data'

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET } = process.env

async function getAccessToken() {
  try {
    const endPoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`

    const formData = new FormData()

    formData.append('grant_type', 'client_credentials')
    formData.append('client_id', CLIENT_ID)
    formData.append('client_secret', CLIENT_SECRET)
    formData.append('scope', 'https://graph.microsoft.com/.default')

    const response = await axios.post(endPoint, formData)
    return response?.data?.access_token
  } catch (error) {
    throw new Error(error)
  }
}

export { getAccessToken }
