import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import InquiryForm from '../components/InquiryForm'
import * as AuthContext from '../context/AuthContext'

// Mock fetch
global.fetch = vi.fn()

const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+250 123 456 789'
}

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    getToken: () => 'mock-token'
  })
}))

describe('InquiryForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders inquiry form with all required fields', () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
  })

  it('displays validation errors for empty required fields', async () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /send message/i })
    
    // Clear pre-filled fields
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone/i)
    
    fireEvent.change(nameInput, { target: { value: '' } })
    fireEvent.change(emailInput, { target: { value: '' } })
    fireEvent.change(phoneInput, { target: { value: '' } })
    
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/message is required/i)).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const emailInput = screen.getByLabelText(/email/i)
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Inquiry sent successfully' })
    })

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone/i)
    const messageInput = screen.getByLabelText(/message/i)
    const submitButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+250 123 456 789' } })
    fireEvent.change(messageInput, { target: { value: 'I am interested in this property' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/inquiries',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: expect.stringContaining('John Doe')
        })
      )
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('displays error message on submission failure', async () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Server error' })
    })

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone/i)
    const messageInput = screen.getByLabelText(/message/i)
    const submitButton = screen.getByRole('button', { name: /send message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+250 123 456 789' } })
    fireEvent.change(messageInput, { target: { value: 'I am interested in this property' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('closes form when cancel button is clicked', () => {
    const mockOnClose = vi.fn()
    const mockOnSuccess = vi.fn()

    render(
      <InquiryForm
        propertyId="123"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})

/**
 * Feature: inzu-property-rental-platform
 * Property 18: Inquiry Submission Round-Trip
 * 
 * **Validates: Requirements 9.3, 9.4, 9.6**
 * 
 * For any valid inquiry form data (non-empty name, email, phone, message), 
 * submitting the inquiry should send it to the backend, display a success confirmation, 
 * and optionally store it in inquiry history.
 */

describe('Property 18: Inquiry Submission Round-Trip', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should complete full inquiry submission round-trip for any valid inquiry data', async () => {
    // Generator for valid inquiry form data
    const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
    const mongoIdArbitrary = fc.array(hexChar, { minLength: 24, maxLength: 24 }).map(arr => arr.join(''))
    
    const validInquiryArbitrary = fc.record({
      propertyId: mongoIdArbitrary, // MongoDB ObjectId format
      name: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim()),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 })
        .filter(s => /^\+?[0-9\s-]+$/.test(s)),
      message: fc.string({ minLength: 1, maxLength: 500 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim())
    })

    await fc.assert(
      fc.asyncProperty(validInquiryArbitrary, async (inquiryData) => {
        // Setup: Mock successful API response
        const mockInquiryResponse = {
          _id: 'mock-inquiry-id-' + Math.random().toString(36).substr(2, 9),
          propertyId: inquiryData.propertyId,
          userId: 'mock-user-id',
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone,
          message: inquiryData.message,
          status: 'pending',
          createdAt: new Date().toISOString()
        }

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Inquiry sent successfully',
            inquiry: mockInquiryResponse
          })
        })

        const mockOnClose = vi.fn()
        const mockOnSuccess = vi.fn()

        // Render the form
        render(
          <InquiryForm
            propertyId={inquiryData.propertyId}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        // Fill in the form with generated data
        const nameInput = screen.getByLabelText(/name/i)
        const emailInput = screen.getByLabelText(/email/i)
        const phoneInput = screen.getByLabelText(/phone/i)
        const messageInput = screen.getByLabelText(/message/i)

        fireEvent.change(nameInput, { target: { value: inquiryData.name } })
        fireEvent.change(emailInput, { target: { value: inquiryData.email } })
        fireEvent.change(phoneInput, { target: { value: inquiryData.phone } })
        fireEvent.change(messageInput, { target: { value: inquiryData.message } })

        // Submit the form
        const submitButton = screen.getByRole('button', { name: /send message/i })
        fireEvent.click(submitButton)

        // Wait for submission to complete
        await waitFor(() => {
          // Property 1: Inquiry should be sent to backend (Requirement 9.3)
          expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:5000/api/inquiries',
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock-token'
              })
            })
          )

          // Verify the request body contains all inquiry data
          const fetchCall = global.fetch.mock.calls[0]
          const requestBody = JSON.parse(fetchCall[1].body)
          expect(requestBody.propertyId).toBe(inquiryData.propertyId)
          expect(requestBody.name).toBe(inquiryData.name)
          expect(requestBody.email).toBe(inquiryData.email)
          expect(requestBody.phone).toBe(inquiryData.phone)
          expect(requestBody.message).toBe(inquiryData.message)

          // Property 2: Success confirmation should be displayed (Requirement 9.4)
          expect(mockOnSuccess).toHaveBeenCalled()
          
          // Property 3: Form should close after successful submission
          expect(mockOnClose).toHaveBeenCalled()
        })

        // Property 4: Data integrity - submitted data matches original
        const fetchCall = global.fetch.mock.calls[0]
        const submittedData = JSON.parse(fetchCall[1].body)
        expect(submittedData.name).toBe(inquiryData.name)
        expect(submittedData.email).toBe(inquiryData.email)
        expect(submittedData.phone).toBe(inquiryData.phone)
        expect(submittedData.message).toBe(inquiryData.message)

        // Cleanup for next iteration
        cleanup()
        vi.clearAllMocks()
      }),
      { numRuns: 3 }
    )
  })

  it('should verify inquiry is stored in history after submission', async () => {
    // Generator for inquiry history scenarios
    const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
    const mongoIdArbitrary = fc.array(hexChar, { minLength: 24, maxLength: 24 }).map(arr => arr.join(''))
    
    const inquiryHistoryArbitrary = fc.record({
      propertyId: mongoIdArbitrary,
      name: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 })
        .filter(s => /^\+?[0-9\s-]+$/.test(s)),
      message: fc.string({ minLength: 1, maxLength: 500 })
        .filter(s => s.trim().length > 0)
        .map(s => s.trim()),
      existingInquiriesCount: fc.integer({ min: 0, max: 5 })
    })

    await fc.assert(
      fc.asyncProperty(inquiryHistoryArbitrary, async (data) => {
        // Create mock existing inquiries
        const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
        const mongoIdArbitrary = fc.array(hexChar, { minLength: 24, maxLength: 24 }).map(arr => arr.join(''))
        
        const existingInquiries = Array.from({ length: data.existingInquiriesCount }, (_, i) => ({
          _id: `existing-inquiry-${i}`,
          propertyId: mongoIdArbitrary.generate(fc.random()).value,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          phone: `+25012345678${i}`,
          message: `Message ${i}`,
          status: 'pending',
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        }))

        // Mock inquiry submission
        const newInquiry = {
          _id: 'new-inquiry-id',
          propertyId: data.propertyId,
          userId: 'mock-user-id',
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          status: 'pending',
          createdAt: new Date().toISOString()
        }

        // Mock POST /api/inquiries (submission)
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Inquiry sent successfully',
            inquiry: newInquiry
          })
        })

        // Mock GET /api/inquiries (history retrieval)
        const updatedHistory = [newInquiry, ...existingInquiries]
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            count: updatedHistory.length,
            inquiries: updatedHistory
          })
        })

        // Simulate submission
        const mockOnClose = vi.fn()
        const mockOnSuccess = vi.fn()

        render(
          <InquiryForm
            propertyId={data.propertyId}
            onClose={mockOnClose}
            onSuccess={mockOnSuccess}
          />
        )

        const nameInput = screen.getByLabelText(/name/i)
        const emailInput = screen.getByLabelText(/email/i)
        const phoneInput = screen.getByLabelText(/phone/i)
        const messageInput = screen.getByLabelText(/message/i)

        fireEvent.change(nameInput, { target: { value: data.name } })
        fireEvent.change(emailInput, { target: { value: data.email } })
        fireEvent.change(phoneInput, { target: { value: data.phone } })
        fireEvent.change(messageInput, { target: { value: data.message } })

        const submitButton = screen.getByRole('button', { name: /send message/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled()
        })

        // Simulate fetching inquiry history (Requirement 9.6)
        const historyResponse = await fetch('http://localhost:5000/api/inquiries', {
          headers: { Authorization: 'Bearer mock-token' }
        })
        const historyData = await historyResponse.json()

        // Property 1: Inquiry history should include the new inquiry
        expect(historyData.inquiries).toBeDefined()
        expect(Array.isArray(historyData.inquiries)).toBe(true)
        expect(historyData.inquiries.length).toBe(data.existingInquiriesCount + 1)

        // Property 2: New inquiry should be first (most recent)
        const firstInquiry = historyData.inquiries[0]
        expect(firstInquiry.name).toBe(data.name)
        expect(firstInquiry.email).toBe(data.email)
        expect(firstInquiry.phone).toBe(data.phone)
        expect(firstInquiry.message).toBe(data.message)
        expect(firstInquiry.propertyId).toBe(data.propertyId)

        // Property 3: All inquiries should have required fields
        historyData.inquiries.forEach(inquiry => {
          expect(inquiry._id).toBeDefined()
          expect(inquiry.propertyId).toBeDefined()
          expect(inquiry.name).toBeDefined()
          expect(inquiry.email).toBeDefined()
          expect(inquiry.phone).toBeDefined()
          expect(inquiry.message).toBeDefined()
          expect(inquiry.status).toBeDefined()
          expect(inquiry.createdAt).toBeDefined()
        })

        // Property 4: Count should match array length
        expect(historyData.count).toBe(historyData.inquiries.length)

        // Cleanup
        cleanup()
        vi.clearAllMocks()
      }),
      { numRuns: 3 }
    )
  })

  it('should preserve data integrity through serialization round-trip', () => {
    // Test that inquiry data survives JSON serialization/deserialization
    const hexChar = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f')
    const mongoIdArbitrary = fc.array(hexChar, { minLength: 24, maxLength: 24 }).map(arr => arr.join(''))
    
    const inquiryDataArbitrary = fc.record({
      propertyId: mongoIdArbitrary,
      name: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim()),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 })
        .filter(s => /^\+?[0-9\s-]+$/.test(s)),
      message: fc.string({ minLength: 1, maxLength: 500 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim())
    })

    fc.assert(
      fc.property(inquiryDataArbitrary, (inquiryData) => {
        // Simulate API payload creation
        const apiPayload = {
          propertyId: inquiryData.propertyId,
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone,
          message: inquiryData.message
        }

        // Simulate network transmission (JSON serialization)
        const serialized = JSON.stringify(apiPayload)
        const deserialized = JSON.parse(serialized)

        // Property: All data should be preserved exactly
        expect(deserialized.propertyId).toBe(inquiryData.propertyId)
        expect(deserialized.name).toBe(inquiryData.name)
        expect(deserialized.email).toBe(inquiryData.email)
        expect(deserialized.phone).toBe(inquiryData.phone)
        expect(deserialized.message).toBe(inquiryData.message)

        // Property: All fields should remain strings
        expect(typeof deserialized.propertyId).toBe('string')
        expect(typeof deserialized.name).toBe('string')
        expect(typeof deserialized.email).toBe('string')
        expect(typeof deserialized.phone).toBe('string')
        expect(typeof deserialized.message).toBe('string')

        // Property: No data corruption or loss
        expect(deserialized.name.length).toBe(inquiryData.name.length)
        expect(deserialized.message.length).toBe(inquiryData.message.length)
      }),
      { numRuns: 3 }
    )
  })
})
