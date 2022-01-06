export interface Order {
  id: string,
  date: Date,
  details: OrderDetail[],
  userId: string
}

export interface OrderDetail {
  id: string,
  name: string,
  amount: number,
  price: number
}
