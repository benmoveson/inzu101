# Implementation Plan: INZU Property Rental Platform

## Overview

This implementation plan breaks down the INZU property rental platform into discrete coding tasks. The approach follows a layered implementation strategy: authentication foundation → core property browsing → advanced features → testing. Each task builds incrementally, ensuring the system remains functional at every checkpoint.

The implementation uses React 19 with React Router for the frontend, Node.js/Express for the backend, and MongoDB for data persistence. Property-based testing will be implemented using fast-check with a minimum of 100 iterations per test.

## Tasks

- [x] 1. Set up authentication infrastructure and context
  - Create AuthContext with login, signup, logout, and session management methods
  - Implement JWT token storage and retrieval from localStorage
  - Create authentication middleware for backend API
  - Set up MongoDB User model with password hashing
  - _Requirements: 1.2, 1.3, 1.4, 3.2, 3.6, 11.1_

- [ ]* 1.1 Write property test for session token round-trip
  - **Property 1: Session Token Round-Trip**
  - **Validates: Requirements 1.2, 1.3, 3.2, 3.6, 11.1**

- [ ]* 1.2 Write property test for unauthenticated navigation
  - **Property 2: Unauthenticated Navigation**
  - **Validates: Requirements 1.4, 1.5**

- [x] 2. Implement splash screen and session initialization
  - Create SplashScreen component with INZU logo and tagline
  - Implement session check on app launch
  - Add navigation logic: valid session → Home Feed, invalid → Login
  - Handle expired token cleanup and redirect
  - _Requirements: 1.1, 1.5_

- [x] 3. Build login and signup flows
  - [x] 3.1 Create Login component with email/phone and password fields
    - Implement form validation for non-empty fields
    - Connect to AuthContext.login() method
    - Display error messages for invalid credentials
    - Add "Forgot Password" navigation link
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.2 Create Signup component with registration form
    - Add fields: name, email/phone, password, terms checkbox
    - Validate all required fields and terms acceptance
    - Connect to AuthContext.signup() method
    - Navigate to OTP verification on success
    - _Requirements: 2.1, 2.2, 2.8_
  
  - [x] 3.3 Create OTPVerification component
    - Implement 6-digit OTP input field
    - Connect to AuthContext.verifyOTP() method
    - Add resend OTP functionality with 60-second cooldown
    - Navigate to Home Feed on successful verification
    - _Requirements: 2.4, 2.5, 2.6_

- [ ]* 3.4 Write property test for OTP verification round-trip
  - **Property 3: OTP Verification Round-Trip**
  - **Validates: Requirements 2.3, 2.5**

- [ ]* 3.5 Write property test for form validation
  - **Property 4: Form Validation Rejects Empty Fields**
  - **Validates: Requirements 2.2, 9.2, 10.2**

- [ ]* 3.6 Write property test for unverified account access prevention
  - **Property 5: Unverified Account Access Prevention**
  - **Validates: Requirements 2.7**

- [x] 4. Implement password recovery flow
  - Create ForgotPassword component with email/phone input
  - Create ResetPassword component with OTP and new password fields
  - Implement backend endpoints for OTP generation and password reset
  - Add validation and error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for password reset round-trip
  - **Property 6: Password Reset Round-Trip**
  - **Validates: Requirements 4.2, 4.4**

- [x] 5. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Set up property data models and API endpoints
  - Create MongoDB Property model with all required fields
  - Implement GET /api/properties with filtering and pagination
  - Implement GET /api/properties/:id for detailed property data
  - Add geolocation-based sorting logic
  - _Requirements: 5.2, 7.6, 16.2, 16.3_

- [x] 7. Build Home Feed with property listings
  - [x] 7.1 Create PropertyCard component
    - Display property image, price, location, type
    - Implement lazy loading for images using Intersection Observer
    - Add heart icon for favorite toggle
    - Add tap handler for navigation to detail screen
    - _Requirements: 5.3, 15.1_
  
  - [x] 7.2 Create HomeFeed component
    - Fetch properties from /api/properties on mount
    - Display scrollable grid of PropertyCard components
    - Implement infinite scroll with pagination
    - Show "No properties found" message when empty
    - Request geolocation permission and pass coordinates to API
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 16.1, 16.2_
  
  - [x] 7.3 Connect PropertyCard favorite toggle to FavoritesContext
    - Implement optimistic UI update for favorite state
    - Sync favorite changes with backend API
    - _Requirements: 5.7, 15.2_

- [x] 7.4 Write property test for property listing display completeness
  - **Property 7: Property Listing Display Completeness**
  - **Validates: Requirements 5.3, 7.1**

- [x] 7.5 Write property test for infinite scroll pagination
  - **Property 8: Infinite Scroll Pagination**
  - **Validates: Requirements 5.4**

- [x] 7.6 Write property test for property navigation
  - **Property 9: Property Navigation**
  - **Validates: Requirements 5.6, 8.7**

- [x] 7.7 Write property test for lazy image loading 
  - **Property 28: Lazy Image Loading**
  - **Validates: Requirements 15.1**

- [ ]* 7.8 Write property test for geolocation-based sorting
  - **Property 31: Geolocation-Based Sorting**
  - **Validates: Requirements 16.2, 16.3**

- [x] 8. Implement search and filter functionality
  - [x] 8.1 Create SearchFilter component
    - Add search bar for location text input
    - Add filter controls: property type, price range slider, bedrooms, bathrooms
    - Add optional filters: furnished, pet-friendly checkboxes
    - Implement real-time filter updates
    - Add "Clear all filters" button
    - Persist filters in sessionStorage
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.8_
  
  - [x] 8.2 Connect filters to HomeFeed
    - Update property fetch to include filter parameters
    - Implement AND logic for combining multiple filters
    - Update feed in real-time when filters change
    - _Requirements: 6.2, 6.7_

- [x] 8.3 Write property test for search filter application
  - **Property 13: Search Filter Application**
  - **Validates: Requirements 6.1**

- [x] 8.4 Write property test for multiple filter combination
  - **Property 14: Multiple Filter Combination (AND Logic)**
  - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6**

- [x] 8.5 Write property test for filter real-time update
  - **Property 15: Filter Real-Time Update**
  - **Validates: Requirements 6.7**

- [x] 8.6 Write property test for filter clear reset
  - **Property 16: Filter Clear Reset**
  - **Validates: Requirements 6.8**

- [x] 9. Checkpoint - Ensure property browsing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Buil]\]d property detail screen
  - [x] 10.1 Create PropertyDetail component
    - Fetch detailed property data from /api/properties/:id
    - Display all property information: images, price, location, type, description, amenities
    - Implement image carousel with swipe gestures
    - Add favorite toggle button
    - Add contact button to open inquiry form
    - Add map integration with property coordinates
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 10.2 Write property test for image carousel navigation
  - **Property 17: Image Carousel Navigation**
  - **Validates: Requirements 7.2**

- [x] 11. Implement favorites management system
  - [x] 11.1 Create FavoritesContext for global state management
    - Implement add/remove favorite methods
    - Sync with backend /api/favorites endpoints
    - Implement offline caching with sync on reconnect
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_
  
  - [x] 11.2 Create Favorites screen component
    - Fetch user's saved properties from /api/favorites
    - Display as grid of PropertyCard components
    - Handle remove from favorites
    - Navigate to PropertyDetail on card tap
    - _Requirements: 8.3, 8.7_
  
  - [x] 11.3 Create backend favorites endpoints
    - Implement POST /api/favorites/:propertyId
    - Implement DELETE /api/favorites/:propertyId
    - Implement GET /api/favorites
    - Add authentication middleware
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 11.4 Write property test for favorite state consistency
  - **Property 10: Favorite State Consistency**
  - **Validates: Requirements 5.7, 7.3, 8.1, 8.4, 8.5**

- [x] 11.5 Write property test for favorite add-remove round-trip
  - **Property 11: Favorite Add-Remove Round-Trip**
  - **Validates: Requirements 8.1, 8.2**

- [x] 11.6 Write property test for offline favorites synchronization
  - **Property 12: Offline Favorites Synchronization**
  - **Validates: Requirements 8.6**

- [x] 11.7 Write property test for optimistic UI updates
  - **Property 29: Optimistic UI Updates**
  - **Validates: Requirements 15.2**

- [x] 12. Build inquiry and messaging system
  - [x] 12.1 Create InquiryForm component
    - Add fields: name, email, phone, message
    - Implement validation for all required fields
    - Display inline error messages for invalid fields
    - Submit inquiry to /api/inquiries
    - Show success toast on completion
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 14.3_
  
  - [x] 12.2 Create backend inquiry endpoints
    - Implement POST /api/inquiries
    - Implement GET /api/inquiries for user's inquiry history
    - Add authentication middleware
    - Send notification to property owner
    - _Requirements: 9.3, 9.6_

- [x] 12.3 Write property test for inquiry submission round-trip
  - **Property 18: Inquiry Submission Round-Trip**
  - **Validates: Requirements 9.3, 9.4, 9.6**

- [ ]* 12.4 Write property test for form validation error highlighting
  - **Property 26: Form Validation Error Highlighting**
  - **Validates: Requirements 14.3**

- [x] 13. Implement user profile and settings
  - [x] 13.1 Create Profile component
    - Display user's name, email, phone
    - Add edit mode for updating profile information
    - Implement password change form with current password verification
    - Add preferences section: notifications, theme
    - Add logout button
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1_
  
  - [x] 13.2 Create backend user endpoints
    - Implement GET /api/users/profile
    - Implement PUT /api/users/profile
    - Implement PUT /api/users/password
    - Add authentication middleware
    - _Requirements: 10.3, 10.5_

- [ ] 13.3 Write property test for profile update round-trip
  - **Property 19: Profile Update Round-Trip**
  - **Validates: Requirements 10.1, 10.3, 10.6**

- [ ]* 13.4 Write property test for password change verification
  - **Property 20: Password Change Verification**
  - **Validates: Requirements 10.4, 10.5**

- [ ]* 13.5 Write property test for logout session cleanup
  - **Property 21: Logout Session Cleanup**
  - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ]* 13.6 Write property test for profile completeness validation
  - **Property 27: Profile Completeness Validation**
  - **Validates: Requirements 14.5**

- [ ] 14. Checkpoint - Ensure user management tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Implement notification system
  - [x] 15.1 Create Notification model and backend endpoints
    - Create MongoDB Notification model
    - Implement POST /api/notifications (internal use)
    - Implement GET /api/notifications for user's notifications
    - Implement PUT /api/notifications/:id/read
    - _Requirements: 12.3_
  
  - [x] 15.2 Add notification generation logic
    - Generate notifications for new listings matching saved searches
    - Generate notifications for inquiry replies
    - Implement push notification sending (if enabled in preferences)
    - _Requirements: 12.1, 12.2, 12.5_
  
  - [x] 15.3 Create NotificationCenter component
    - Display list of user's notifications
    - Mark notifications as read on tap
    - Navigate to relevant screen on notification tap
    - _Requirements: 12.3, 12.4_

- [ ]* 15.4 Write property test for notification matching and storage
  - **Property 22: Notification Matching and Storage**
  - **Validates: Requirements 12.1, 12.3**

- [ ]* 15.5 Write property test for notification navigation
  - **Property 23: Notification Navigation**
  - **Validates: Requirements 12.4**

- [ ]* 15.6 Write property test for notification preference enforcement
  - **Property 24: Notification Preference Enforcement**
  - **Validates: Requirements 12.5**

- [x] 16. Build bottom navigation and routing
  - [x] 16.1 Create BottomNavigation component
    - Add 5 tabs: Home, Search, Favorites, Messages, Profile
    - Highlight active tab based on current route
    - Implement navigation via React Router
    - Fix position at bottom of viewport
    - _Requirements: 13.1, 13.2, 13.4_
  
  - [x] 16.2 Implement state preservation for navigation
    - Use React Router's location state to preserve scroll position
    - Persist filter state in sessionStorage
    - Restore state when navigating back to screens
    - _Requirements: 13.3_

- [ ]* 16.3 Write property test for bottom navigation state preservation
  - **Property 25: Bottom Navigation State Preservation**
  - **Validates: Requirements 13.3**

- [x] 17. Implement responsive design and UI optimizations
  - [x] 17.1 Add responsive CSS for mobile-first design
    - Implement responsive grid for property cards
    - Add media queries for tablet and desktop breakpoints
    - Ensure images scale appropriately
    - Test on various viewport sizes
    - _Requirements: 15.3_
  
  - [x] 17.2 Add loading states and animations
    - Add skeleton loaders for property cards
    - Implement smooth transitions between screens
    - Add filter panel slide-in/slide-out animations
    - _Requirements: 15.4, 15.5_

- [ ]* 17.3 Write property test for responsive layout scaling
  - **Property 30: Responsive Layout Scaling**
  - **Validates: Requirements 15.3**

- [x] 18. Implement comprehensive error handling
  - [x] 18.1 Add network error handling
    - Display "Check your connection" message on network failures
    - Implement retry buttons for failed requests
    - Add 30-second timeout for all API requests
    - _Requirements: 14.1_
  
  - [x] 18.2 Add validation error handling
    - Highlight invalid form fields with red borders
    - Display inline error messages
    - Validate email and phone formats
    - Implement password strength indicator
    - _Requirements: 14.3_
  
  - [x] 18.3 Add session expiry handling
    - Detect expired tokens on API responses
    - Clear session and redirect to Login
    - Display "Session expired" message
    - _Requirements: 14.4_

- [x] 19. Final integration and wiring
  - [x] 19.1 Connect all components to routing
    - Set up React Router with all routes
    - Add protected route wrapper for authenticated routes
    - Implement navigation guards for unverified accounts
    - _Requirements: 1.3, 1.4, 2.7_
  
  - [x] 19.2 Wire up all context providers
    - Wrap app with AuthContext provider
    - Wrap app with FavoritesContext provider
    - Ensure all components have access to global state
    - _Requirements: Multiple_
  
  - [x] 19.3 Add PWA configuration
    - Configure vite-plugin-pwa for offline support
    - Set up service worker for caching
    - Add manifest.json for installability
    - _Requirements: 8.6_

- [x] 20. Final checkpoint - Run all tests and verify functionality
  - Ensure all property-based tests pass with 100+ iterations
  - Ensure all unit tests pass
  - Verify all user flows work end-to-end
  - Ask the user if questions arise.

## Phase 2: Enhanced Features (13 New Improvements)

- [x] 21. Implement theme toggle system
  - [x] 21.1 Create ThemeContext for global theme state
    - Add theme state: 'light' | 'dark'
    - Implement toggleTheme() method
    - Load theme from localStorage on mount
    - Detect system preference on first load
    - _Requirements: 17.1, 17.4_
  
  - [x] 21.2 Create CSS variables for theme colors
    - Define light theme variables
    - Define dark theme variables
    - Apply data-theme attribute to document root
    - _Requirements: 17.2, 17.3_
  
  - [x] 21.3 Add theme toggle to Settings screen
    - Display theme toggle switch
    - Update theme on toggle
    - Persist to localStorage and backend
    - Apply theme immediately to all screens
    - _Requirements: 17.1, 17.5_

- [ ]* 21.4 Write property test for theme persistence
  - **Property 32: Theme Persistence and Application**
  - **Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5**

- [x] 22. Enhance search functionality globally
  - [x] 22.1 Update SearchBar component for global use
    - Add debounced search input (300ms)
    - Implement clear search button
    - Persist search query in sessionStorage
    - _Requirements: 6.1_
  
  - [x] 22.2 Integrate search across all property pages
    - Add search to Home, Houses, Rooms, Apartments, Hotels
    - Filter properties by location matching query
    - Combine with existing filters
    - Update results in real-time
    - _Requirements: 6.1, 6.7_

- [ ]* 22.3 Write property test for global search consistency
  - **Property 42: Global Search Consistency**
  - **Validates: Requirements 6.1**

- [x] 23. Implement district-level location tracking
  - [x] 23.1 Create LocationTracker component
    - Request geolocation permission
    - Fetch user coordinates
    - Reverse geocode to district name
    - Store district in user context
    - _Requirements: 6.6, 16.1, 16.2_
  
  - [x] 23.2 Add "Near me" filter functionality
    - Display "Near me" button when district available
    - Filter properties by matching district
    - Update feed when filter applied
    - _Requirements: 6.6, 16.3_
  
  - [x] 23.3 Update Property model with district field
    - Add district field to Property schema
    - Update property creation to include district
    - Migrate existing properties with district data
    - _Requirements: 16.2_

- [ ]* 23.4 Write property test for district-level filtering
  - **Property 41: District-Level Location Filtering**
  - **Validates: Requirements 6.6, 16.2, 16.3**

- [x] 24. Refine property filters
  - [x] 24.1 Update SearchFilter component
    - Focus on property type filter
    - Remove or simplify amenities filters
    - Improve filter UI/UX
    - _Requirements: 6.3_
  
  - [x] 24.2 Update filter logic
    - Ensure filters work with search and location
    - Maintain real-time updates
    - _Requirements: 6.2, 6.7_

- [x] 25. Enhance messaging system
  - [x] 25.1 Create Conversation and Message models
    - Define Conversation schema with participants, unreadCount
    - Define Message schema with text, voiceNote, replyToId, seen
    - Add indexes for performance
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [x] 25.2 Implement message API endpoints
    - GET /api/messages/conversations
    - GET /api/messages/:conversationId
    - POST /api/messages (text)
    - POST /api/messages/voice (voice note)
    - PUT /api/messages/:id/seen
    - GET /api/messages/unread-count
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.8_
  
  - [x] 25.3 Update Messages component with enhanced features
    - Display unread count badge on conversations
    - Show "seen" status on sent messages
    - Implement reply indicators (Instagram-style)
    - Mark messages as read when conversation opened
    - _Requirements: 18.2, 18.4, 18.5, 18.8_
  
  - [x] 25.4 Optimize voice note sending
    - Remove confirmation dialog
    - Send immediately on button release
    - Display waveform during recording
    - _Requirements: 18.9, 18.10, 18.11_
  
  - [x] 25.5 Add emoji picker to message input
    - Integrate emoji picker component
    - Display on emoji button tap
    - Insert emoji at cursor position
    - _Requirements: 18.6, 18.7_

- [ ]* 25.6 Write property test for message seen status
  - **Property 33: Message Seen Status Tracking**
  - **Validates: Requirements 18.4**

- [ ]* 25.7 Write property test for unread count accuracy
  - **Property 34: Unread Message Count Accuracy**
  - **Validates: Requirements 18.2, 18.8**

- [ ]* 25.8 Write property test for voice note immediate send
  - **Property 35: Voice Note Immediate Send**
  - **Validates: Requirements 18.9, 18.10**

- [ ]* 25.9 Write property test for emoji insertion
  - **Property 36: Emoji Insertion**
  - **Validates: Requirements 18.6, 18.7**

- [ ]* 25.10 Write property test for reply indicator
  - **Property 43: Message Reply Indicator**
  - **Validates: Requirements 18.5**

- [x] 26. Enhance splash screen with animation
  - [x] 26.1 Update SplashScreen component
    - Add INZU logo fade-in animation
    - Add tagline slide-up animation
    - Display loading spinner
    - Minimum display time: 2 seconds
    - _Requirements: 1.1_

- [x] 27. Reorganize settings and add account deletion
  - [x] 27.1 Update Settings screen structure
    - Move logout button from Profile to Settings
    - Add "Delete Account" option
    - Organize into sections: Profile, Security, Preferences, Account
    - _Requirements: 11.1_
  
  - [x] 27.2 Implement account deletion flow
    - Display confirmation dialog
    - Require password confirmation
    - DELETE /api/users/account endpoint
    - Delete all associated data (favorites, inquiries, reviews)
    - Clear session and navigate to Login
    - _Requirements: 11.5, 11.6, 11.7_

- [ ]* 27.3 Write property test for account deletion completeness
  - **Property 40: Account Deletion Completeness**
  - **Validates: Requirements 11.6, 11.7**

- [x] 28. Create Terms and Conditions page
  - [x] 28.1 Create TermsAndConditions component
    - Display full terms content
    - Scrollable content area
    - Back button navigation
    - _Requirements: 22.1, 22.2, 22.3, 22.4_
  
  - [x] 28.2 Add Terms links
    - Link from Settings screen
    - Link from Signup screen
    - Require acceptance during signup
    - _Requirements: 2.8, 22.5_

- [x] 29. Implement real-time data updates
  - [x] 29.1 Set up WebSocket connection
    - Install Socket.io
    - Create WebSocket server
    - Connect client on authentication
    - Handle reconnection
    - _Requirements: 21.1, 21.2_
  
  - [x] 29.2 Implement real-time property updates
    - Emit new_property event on property creation
    - Emit property_updated event on property modification
    - Listen for events in HomeFeed
    - Update feed without refresh
    - _Requirements: 21.1, 21.2_
  
  - [x] 29.3 Implement real-time message updates
    - Emit new_message event on message send
    - Emit message_seen event on message read
    - Listen for events in Messages component
    - Update conversations without refresh
    - _Requirements: 18.8_
  
  - [x] 29.4 Add polling fallback
    - Poll every 30 seconds if WebSocket unavailable
    - Check for updates via REST API
    - Update UI when changes detected
    - _Requirements: 21.1, 21.3, 21.4_

- [ ]* 29.5 Write property test for real-time property updates
  - **Property 39: Real-Time Property Updates**
  - **Validates: Requirements 21.1, 21.4**

- [x] 30. Implement property review system
  - [x] 30.1 Create Review model and API endpoints
    - Define Review schema with rating, comment
    - POST /api/reviews
    - PUT /api/reviews/:id  
    - GET /api/properties/:id/reviews
    - GET /api/reviews/user/:userId
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_
  
  - [x] 30.2 Create PropertyReview component
    - Display all reviews for property
    - Show average rating and total count
    - 5-star rating selector
    - Text area for comment
    - Submit and edit review functionality
    - _Requirements: 19.1, 19.2, 19.3, 19.6, 19.7_
  
  - [x] 30.3 Update PropertyDetail to display reviews
    - Show average rating at top
    - Display all reviews below property details
    - "Write Review" button
    - _Requirements: 7.8, 19.1, 19.2_
  
  - [x] 30.4 Update Property model with review fields
    - Add averageRating field
    - Add totalReviews field
    - Update on review submission
    - _Requirements: 19.2, 19.5_

- [ ]* 30.5 Write property test for review rating validation
  - **Property 37: Review Rating Validation**
  - **Validates: Requirements 19.3, 19.4, 19.5**

- [x] 31. Add room descriptions to property upload
  - [x] 31.1 Create RoomDescriptionInput component
    - Dynamic form with "Add Room" button
    - Room type selector (bedroom, bathroom, kitchen, living room)
    - Description textarea for each room
    - Remove button for each entry
    - _Requirements: 20.1, 20.2_
  
  - [x] 31.2 Update AddProperty component
    - Integrate RoomDescriptionInput
    - Validate at least one room description
    - Include room descriptions in property submission
    - _Requirements: 20.3, 20.4_
  
  - [x] 31.3 Update Property model with roomDescriptions
    - Add roomDescriptions array field
    - Store room type and description
    - _Requirements: 20.4_
  
  - [x] 31.4 Display room descriptions in PropertyDetail
    - Show all room descriptions
    - Group by room type
    - Expandable sections
    - _Requirements: 20.5_

- [ ]* 31.5 Write property test for room description requirement
  - **Property 38: Room Description Requirement**
  - **Validates: Requirements 20.1, 20.3, 20.4**

- [x] 32. Add back button to PropertyDetail
  - [x] 32.1 Update PropertyDetail component
    - Add back button at top
    - Navigate to previous screen on tap
    - _Requirements: 7.7_

- [x] 33. Update BottomNavigation with unread count
  - [x] 33.1 Update BottomNavigation component
    - Fetch unread count from API
    - Display badge on Messages tab
    - Update in real-time
    - _Requirements: 18.2_

- [ ] 34. Final integration and testing for Phase 2
  - [x] 34.1 Test all new features end-to-end
    - Theme toggle across all screens
    - Global search on all pages
    - District-level location filtering
    - Enhanced messaging with all features
    - Property reviews and ratings
    - Room descriptions in upload and detail
    - Real-time updates for properties and messages
    - Account deletion flow
    - Terms and Conditions access
  
  - [x] 34.2 Run all property-based tests
    - Ensure all new property tests pass
    - Verify 100+ iterations per test
  
  - [x] 34.3 Performance optimization
    - Optimize real-time update frequency
    - Reduce bundle size
    - Improve image loading
    - Test on various devices and network conditions
  
  - [x] 34.4 Final checkpoint
    - Ensure all tests pass
    - Verify all requirements met
    - Ask user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Implementation uses React 19, React Router 7, Node.js/Express, and MongoDB
- Property-based testing uses fast-check library
