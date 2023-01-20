import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import App from './App'

describe('Application', () => {
  it('should render', async () => {
    render(<App />)
    expect(await screen.getByText('Text Input')).toBeInTheDocument
  })

  it('should be zoomable', async () => {

  })

  it('should be pannable', async () => {

  })

  test('select font family', async () => {

  })

  test('select font size', async () => {

  })

  test('type text', async () => {

  })


})