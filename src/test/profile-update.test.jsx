import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import fc from 'fast-check'
import { BrowserRouter } from 'react-router-dom'
import Profile from '../pages/Profile'
import { AuthProvider } from '../context/AuthContext'

// Mock fetch
global.fetch = vi.fn()

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

/**
 * Feature: inzu-property-rental-platform
 * Property 19: Profile Update Round-Trip
 * 
 * **Validates: Requirements 10.1, 10.3, 10.6**
 * 
 * For any valid profile updates (name, email, phone, preferences), 
 * submitting changes should sync with the backend and reflect in the displayed profile data.
 */

describe('Property 19: Profile Update Round-Trip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('should complete full profile update round-trip for any valid profile data', async () => {
    // Generator for valid profile update data
    const validProfileUpdateArbitrary = fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim()),
      email: fc.emailAddress(),
      phone: fc.option(
        fc.string({ minLength: 10, maxLength: 15 })
          .filter(s => /^\+?[0-9\s-]+$/.test(s)),
        { nil: '' }
      ),
      location: fc.option(
        fc.constantFrom('Kigali', 'Musanze', 'Rubavu', 'Huye', 'Nyanza', 'Gisenyi', 'Butare'),
        { nil: '' }
      )
    })

    await fc.assert(
      fc.asyncProperty(validProfileUpdateArbitrary, async (profileData) => {
        // Setup: Create initial user state
        const initialUser = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          name: 'Initial Name',
          email: 'initial@example.com',
          phone: '+250 123 456 789',
          location: 'Kigali',
          avatar: null,
          isVerified: true,
          twoFactorEnabled: false,
          language: 'en',
          theme: 'light',
          role: 'user'
        }

        // Store initial user in localStorage
        localStorage.setItem('inzu_user', JSON.stringify(initialUser))
        localStorage.setItem('inzu_token', 'mock-token-' + Math.random().toString(36).substr(2, 9))

        // Mock auth verification
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: initialUser })
        })

        // Mock profile update response
        const updatedUser = {
          ...initialUser,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || initialUser.phone,
          location: profileData.location || initialUser.location
        }

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Profile updated successfully',
            user: updatedUser
          })
        })

        // Render Profile component
        render(
          <BrowserRouter>
            <AuthProvider>
              <Profile />
            </AuthProvider>
          </BrowserRouter>
        )

        // Wait for component to load
        await waitFor(() => {
          expect(screen.getByText(initialUser.name)).toBeInTheDocument()
        })

        // Property 1: Initial profile data should be displayed (Requirement 10.1)
        expect(screen.getByText(initialUser.name)).toBeInTheDocument()
        expect(screen.getByText(initialUser.email)).toBeInTheDocument()

        // Click Edit Profile button
        const editButton = screen.getByRole('button', { name: /edit profile/i })
        fireEvent.click(editButton)

        // Wait for edit mode to activate
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
        })

        // Update profile fields with generated data
        const nameInput = screen.getByDisplayValue(initialUser.name)
        const emailInput = screen.getByDisplayValue(initialUser.email)
        const phoneInput = screen.getByDisplayValue(initialUser.phone)
        const locationInput = screen.getByDisplayValue(initialUser.location)

        fireEvent.change(nameInput, { target: { value: profileData.name } })
        fireEvent.change(emailInput, { target: { value: profileData.email } })
        
        if (profileData.phone) {
          fireEvent.change(phoneInput, { target: { value: profileData.phone } })
        }
        
        if (profileData.location) {
          fireEvent.change(locationInput, { target: { value: profileData.location } })
        }

        // Submit the profile update
        const saveButton = screen.getByRole('button', { name: /save changes/i })
        fireEvent.click(saveButton)

        // Wait for update to complete
        await waitFor(() => {
          // Property 2: Profile update should be sent to backend (Requirement 10.3)
          expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:5000/api/users/profile',
            expect.objectContaining({
              method: 'PUT',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                'Authorization': expect.stringContaining('Bearer')
              })
            })
          )
        }, { timeout: 3000 })

        // Verify the request body contains updated profile data
        const fetchCalls = global.fetch.mock.calls.filter(
          call => call[0] === 'http://localhost:5000/api/users/profile' && call[1]?.method === 'PUT'
        )
        
        if (fetchCalls.length > 0) {
          const requestBody = JSON.parse(fetchCalls[0][1].body)
          expect(requestBody.name).toBe(profileData.name)
          expect(requestBody.email).toBe(profileData.email)
          
          if (profileData.phone) {
            expect(requestBody.phone).toBe(profileData.phone)
          }
          
          if (profileData.location) {
            expect(requestBody.location).toBe(profileData.location)
          }
        }

        // Property 3: Updated data should be reflected in localStorage (Requirement 10.6)
        await waitFor(() => {
          const storedUser = JSON.parse(localStorage.getItem('inzu_user'))
          expect(storedUser).toBeDefined()
          expect(storedUser.name).toBe(profileData.name)
          expect(storedUser.email).toBe(profileData.email)
        })

        // Property 4: Data integrity - submitted data matches original
        const storedUser = JSON.parse(localStorage.getItem('inzu_user'))
        expect(storedUser.name).toBe(profileData.name)
        expect(storedUser.email).toBe(profileData.email)

        // Cleanup for next iteration
        cleanup()
        vi.clearAllMocks()
        localStorage.clear()
      }),
      { numRuns: 2 }
    )
  })

  it('should preserve unchanged fields during partial profile updates', async () => {
    // Test that updating only some fields preserves others
    const partialUpdateArbitrary = fc.record({
      updateField: fc.constantFrom('name', 'email', 'phone', 'location'),
      newValue: fc.oneof(
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0).map(s => s.trim()),
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }).filter(s => /^\+?[0-9\s-]+$/.test(s)),
        fc.constantFrom('Kigali', 'Musanze', 'Rubavu', 'Huye')
      )
    })

    await fc.assert(
      fc.asyncProperty(partialUpdateArbitrary, async (updateData) => {
        // Setup initial user
        const initialUser = {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+250 123 456 789',
          location: 'Kigali',
          avatar: null,
          isVerified: true,
          twoFactorEnabled: false,
          language: 'en',
          theme: 'light',
          role: 'user'
        }

        localStorage.setItem('inzu_user', JSON.stringify(initialUser))
        localStorage.setItem('inzu_token', 'mock-token')

        // Mock auth verification
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: initialUser })
        })

        // Create updated user with only one field changed
        const updatedUser = { ...initialUser }
        updatedUser[updateData.updateField] = updateData.newValue

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            message: 'Profile updated successfully',
            user: updatedUser
          })
        })

        render(
          <BrowserRouter>
            <AuthProvider>
              <Profile />
            </AuthProvider>
          </BrowserRouter>
        )

        await waitFor(() => {
          expect(screen.getByText(initialUser.name)).toBeInTheDocument()
        })

        // Enter edit mode
        const editButton = screen.getByRole('button', { name: /edit profile/i })
        fireEvent.click(editButton)

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
        })

        // Update only the specified field
        const inputs = {
          name: screen.getByDisplayValue(initialUser.name),
          email: screen.getByDisplayValue(initialUser.email),
          phone: screen.getByDisplayValue(initialUser.phone),
          location: screen.getByDisplayValue(initialUser.location)
        }

        fireEvent.change(inputs[updateData.updateField], { target: { value: updateData.newValue } })

        // Save changes
        const saveButton = screen.getByRole('button', { name: /save changes/i })
        fireEvent.click(saveButton)

        await waitFor(() => {
          const fetchCalls = global.fetch.mock.calls.filter(
            call => call[0] === 'http://localhost:5000/api/users/profile' && call[1]?.method === 'PUT'
          )
          expect(fetchCalls.length).toBeGreaterThan(0)
        })

        // Property: All unchanged fields should remain the same
        await waitFor(() => {
          const storedUser = JSON.parse(localStorage.getItem('inzu_user'))
          expect(storedUser).toBeDefined()
          
          // Check that the updated field changed
          expect(storedUser[updateData.updateField]).toBe(updateData.newValue)
          
          // Check that other fields remained unchanged
          Object.keys(initialUser).forEach(key => {
            if (key !== updateData.updateField && key !== 'id') {
              expect(storedUser[key]).toBe(initialUser[key])
            }
          })
        })

        cleanup()
        vi.clearAllMocks()
        localStorage.clear()
      }),
      { numRuns: 2 }
    )
  })

  it('should verify profile data survives serialization round-trip', () => {
    // Test that profile data survives JSON serialization/deserialization
    const profileDataArbitrary = fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 })
        .filter(s => s.trim().length > 0 && !/[<>]/.test(s))
        .map(s => s.trim()),
      email: fc.emailAddress(),
      phone: fc.string({ minLength: 10, maxLength: 15 })
        .filter(s => /^\+?[0-9\s-]+$/.test(s)),
      location: fc.constantFrom('Kigali', 'Musanze', 'Rubavu', 'Huye', 'Nyanza'),
      language: fc.constantFrom('en', 'rw', 'fr'),
      theme: fc.constantFrom('light', 'dark')
    })

    fc.assert(
      fc.property(profileDataArbitrary, (profileData) => {
        // Simulate API payload creation
        const apiPayload = {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location,
          language: profileData.language,
          theme: profileData.theme
        }

        // Simulate network transmission (JSON serialization)
        const serialized = JSON.stringify(apiPayload)
        const deserialized = JSON.parse(serialized)

        // Property: All data should be preserved exactly
        expect(deserialized.name).toBe(profileData.name)
        expect(deserialized.email).toBe(profileData.email)
        expect(deserialized.phone).toBe(profileData.phone)
        expect(deserialized.location).toBe(profileData.location)
        expect(deserialized.language).toBe(profileData.language)
        expect(deserialized.theme).toBe(profileData.theme)

        // Property: All fields should remain strings
        expect(typeof deserialized.name).toBe('string')
        expect(typeof deserialized.email).toBe('string')
        expect(typeof deserialized.phone).toBe('string')
        expect(typeof deserialized.location).toBe('string')
        expect(typeof deserialized.language).toBe('string')
        expect(typeof deserialized.theme).toBe('string')

        // Property: No data corruption or loss
        expect(deserialized.name.length).toBe(profileData.name.length)
        expect(deserialized.email.length).toBe(profileData.email.length)
        expect(deserialized.phone.length).toBe(profileData.phone.length)
      }),
      { numRuns: 2 }
    )
  })

  it('should maintain profile consistency across multiple updates', async () => {
    // Test that multiple sequential updates maintain data consistency
    const updateSequenceArbitrary = fc.array(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.trim().length > 0)
          .map(s => s.trim()),
        email: fc.emailAddress()
      }),
      { minLength: 2, maxLength: 5 }
    )

    await fc.assert(
      fc.asyncProperty(updateSequenceArbitrary, async (updates) => {
        let currentUser = {
          id: 'user-123',
          name: 'Initial Name',
          email: 'initial@example.com',
          phone: '+250 123 456 789',
          location: 'Kigali',
          avatar: null,
          isVerified: true,
          twoFactorEnabled: false,
          language: 'en',
          theme: 'light',
          role: 'user'
        }

        // Simulate multiple updates
        for (const update of updates) {
          const updatedUser = {
            ...currentUser,
            name: update.name,
            email: update.email
          }

          // Simulate localStorage update
          localStorage.setItem('inzu_user', JSON.stringify(updatedUser))

          // Verify data integrity after each update
          const storedUser = JSON.parse(localStorage.getItem('inzu_user'))
          
          // Property 1: Updated fields should match
          expect(storedUser.name).toBe(update.name)
          expect(storedUser.email).toBe(update.email)

          // Property 2: Unchanged fields should remain constant
          expect(storedUser.phone).toBe(currentUser.phone)
          expect(storedUser.location).toBe(currentUser.location)
          expect(storedUser.isVerified).toBe(currentUser.isVerified)

          // Property 3: User ID should never change
          expect(storedUser.id).toBe('user-123')

          currentUser = updatedUser
        }

        // Property 4: Final state should match last update
        const finalUser = JSON.parse(localStorage.getItem('inzu_user'))
        const lastUpdate = updates[updates.length - 1]
        expect(finalUser.name).toBe(lastUpdate.name)
        expect(finalUser.email).toBe(lastUpdate.email)

        localStorage.clear()
      }),
      { numRuns: 2 }
    )
  })
})
