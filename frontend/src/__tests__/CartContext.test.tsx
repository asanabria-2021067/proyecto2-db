import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartProvider, useCart } from '@/contexts/CartContext'

function TestConsumer() {
  const { items, count, addItem, removeItem } = useCart()
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="items">{items.map(i => i.titulo).join(',')}</span>
      <button data-testid="add-btn" onClick={() => addItem({ id_producto: 1, titulo: 'Test Book', precio: 10, stock: 5 }, 1)}>Add</button>
      <button data-testid="remove-btn" onClick={() => removeItem(1)}>Remove</button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => localStorage.clear())

  it('starts with empty cart', () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('adds an item to cart', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByTestId('add-btn'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    expect(screen.getByTestId('items').textContent).toBe('Test Book')
  })

  it('removes an item from cart', async () => {
    render(<CartProvider><TestConsumer /></CartProvider>)
    await userEvent.click(screen.getByTestId('add-btn'))
    expect(screen.getByTestId('count').textContent).toBe('1')
    await userEvent.click(screen.getByTestId('remove-btn'))
    expect(screen.getByTestId('count').textContent).toBe('0')
  })
})
