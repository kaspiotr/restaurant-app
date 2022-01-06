export interface Meal {
  id: string;
  name: string
  cuisine: string
  type: string
  category: string
  available: number
  ingredients: Ingredient[],
  dayLimit: number
  price: Price
  description: string
  imgUrls: string[]
  rating: number
}

export interface Ingredient {
  name: string
}

export interface Price {
  value: number;
  currency: string;
}
