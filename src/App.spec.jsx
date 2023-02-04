import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('Application', () => {
  it('should render', () => {
    render(<App />)
    expect(screen.getByText('Text Input')).toBeInTheDocument
  })
})

describe('Font options', () => {
  test('select font family', async () => {
    const user = userEvent.setup()
    render(<App />)

    const selectElm = screen.getByLabelText('Font Family')
    const fontFamilies = [
      'Arial',
      'Verdana',
      'Times New Roman',
      'Georgia',
      'Monaco',
      'Courier New',
      'Papyrus'
    ]
    const testFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)]
    await user.selectOptions(selectElm, testFontFamily)
    expect(selectElm.value).toBe(testFontFamily)
  })

  test('select font size', async () => {
    render(<App />)

    const rangeElm = screen.getByRole('slider')
    const testFontSize = Math.floor(Math.random() * 255 + 1)
    await fireEvent.change(rangeElm, { target: { value: testFontSize } })
    expect(rangeElm.value).toBe(testFontSize.toString())
  })
})

describe('Input text', () => {
  test('type short text', async () => {
    const user = userEvent.setup()
    render(<App />)

    const inputElm = screen.getByLabelText('Text Input')
    const testText = randomString(10)
    await user.clear(inputElm)
    await user.type(inputElm, testText)
    expect(inputElm.value).toBe(testText)
  })

  test('type 1000 characters text', async () => {
    const user = userEvent.setup()
    render(<App />)

    const inputElm = screen.getByLabelText('Text Input')
    await user.clear(inputElm)
    await user.type(inputElm, randomString(1000))
    expect(screen.getByText('Text Input')).toBeInTheDocument
  }, 120000)

  /*
  test('paste 1000000 characters text', async () => {
    const user = userEvent.setup()
    render(<App />)

    const inputElm = screen.getByLabelText('Text Input')
    await user.clear(inputElm)
    await user.paste(inputElm, randomString(1000000))
    expect(inputElm).toBeInTheDocument
  })
  */
})

function randomString(length) {
  let result = ''
  const charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < length; i++) {
    result += charSet.charAt(Math.floor(Math.random() * charSet.length))
  }
  return result
}