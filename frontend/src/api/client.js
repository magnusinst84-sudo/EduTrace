import axios from 'axios'
import { getAuth } from 'firebase/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
})

api.interceptors.request.use(async (config) => {
  const auth = getAuth()
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken(false)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      getAuth().signOut()
      window.location.href = '/login'
      return
    }
    if (status === 429) {
      throw new Error('Too many requests. Please wait a moment.')
    }
    if (status === 400) {
      throw new Error(error.response?.data?.detail || 'Invalid request.')
    }
    throw new Error('Something went wrong. Please try again.')
  }
)

export default api