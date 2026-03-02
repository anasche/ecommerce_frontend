import axios from 'axios'
import type { Product, CreateOrderPayload, Order } from '@/types'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

export const hasApiBaseUrl = Boolean(baseURL)

export const apiClient = axios.create({
  baseURL: baseURL ?? '',
  headers: { 'Content-Type': 'application/json' },
})

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Boost Energy Drink 1kg',
    description:
      'High performance malt-based energy drink with 3x more stamina, clinically proven for active individuals.',
    price: 24.99,
    image: '/products/boost.jpg',
    stock: 50,
  },
  {
    id: 2,
    name: 'Philips 43" 4K Smart TV',
    description:
      'Ultra HD Smart TV with a vibrant display, built-in apps, and crisp 4K resolution for an immersive viewing experience.',
    price: 399.99,
    image: '/products/tv.jpg',
    stock: 12,
  },
  {
    id: 3,
    name: 'iPhone 14 128GB',
    description:
      'Apple iPhone 14 with A15 Bionic chip, advanced dual-camera system, and all-day battery life. Available in Blue.',
    price: 899.99,
    image: '/products/iphone.jpg',
    stock: 25,
  },
]

export async function getProducts(): Promise<Product[]> {
  if (!hasApiBaseUrl) return fallbackProducts
  try {
    const { data } = await apiClient.get<{ data: Product[] }>('/api/products')
    return data.data
  } catch {
    return fallbackProducts
  }
}

export async function getProduct(id: string | number): Promise<Product> {
  if (!hasApiBaseUrl) {
    const product = fallbackProducts.find((p) => String(p.id) === String(id))
    if (product) return product
    throw new Error(`Product ${id} not found`)
  }
  try {
    const { data } = await apiClient.get<{ data: Product }>(`/api/products/${id}`)
    return data.data
  } catch {
    const product = fallbackProducts.find((p) => String(p.id) === String(id))
    if (product) return product
    throw new Error(`Product ${id} not found`)
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  if (!hasApiBaseUrl) {
    // Demo mode: simulate a successful order
    await new Promise((r) => setTimeout(r, 1200))
    return { id: `DEMO-${Math.floor(Math.random() * 90000) + 10000}`, total: payload.total }
  }
  const { data } = await apiClient.post<{ data: Order }>('/api/orders', payload)
  return data.data
}
