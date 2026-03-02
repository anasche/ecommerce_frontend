export interface Product {
  id: string | number
  name: string
  price: number
  description: string
  image?: string
  stock?: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CreateOrderPayload {
  customer: {
    name: string
    email: string
    phone?: string
    address?: string
    address2?: string
    city?: string
    country?: string
  }
  items: Array<{ productId: string | number; quantity: number }>
  total: number
}

export interface Order {
  id: string | number
  total: number
}
