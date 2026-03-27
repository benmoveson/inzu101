# Requirements Document: INZU Property Rental Platform

## Introduction

INZU is a mobile-first web application designed to connect property seekers with rental and sale listings across Rwanda. The platform provides a comprehensive property discovery experience with search, filtering, favorites management, inquiry messaging, and user profile management. The system emphasizes responsive design, real-time data synchronization, and seamless user experience across authentication, property browsing, and communication workflows.

## Glossary

- **INZU_System**: The complete property rental web application including frontend, backend API, and data storage
- **User**: Any person who has created an account and can browse, save, and inquire about properties
- **Guest**: An unauthenticated visitor who has not logged in
- **Property_Listing**: A rental or sale property entry with details, images, location, and contact information
- **Property_Owner**: A user who has listed properties and can receive inquiries
- **Inquiry**: A message sent by a user to a property owner expressing interest
- **Favorite**: A property saved by a user for later reference
- **Session**: An authenticated user state maintained via JWT token or localStorage
- **Feed**: The main scrollable list of property listings on the home screen
- **Filter**: User-defined criteria to narrow property search results
- **OTP**: One-Time Password sent via email or SMS for account verification
- **Geolocation**: The user's current geographic position used to prioritize nearby properties
- **Theme**: A visual appearance mode (light or dark) that affects the app's color scheme
- **District**: An administrative region in Rwanda used for location-based filtering
- **Voice_Note**: An audio message recorded and sent within the messaging system
- **Review**: A user-submitted rating and comment about a property experience
- **Emoji**: A graphical icon used to express emotion in messages
- **Splash_Screen**: The initial loading screen displayed when the app launches
- **Unread_Count**: The number of messages that have not been viewed by the user
- **Seen_Status**: An indicator showing whether a message has been viewed by the recipient
- **Terms_And_Conditions**: Legal document outlining user rights and responsibilities

## Requirements

### Requirement 1: Launch and Session Management

**User Story:** As a user, I want the app to remember my login state, so that I don't have to log in every time I open the app.

#### Acceptance Criteria

1. WHEN the app launches, THE INZU_System SHALL display a Splash_Screen with the INZU logo, tagline "Find your dream property in Rwanda", and a loading animation
2. WHEN the splash screen is displayed, THE INZU_System SHALL check for a valid session token in localStorage
3. IF a valid session token exists, THEN THE INZU_System SHALL load the user profile and navigate to the Home Feed
4. IF no valid session token exists, THEN THE INZU_System SHALL navigate to the Login screen
5. WHEN a session token is expired, THE INZU_System SHALL clear the session and redirect to the Login screen

### Requirement 2: User Registration

**User Story:** As a new user, I want to create an account with email or phone verification, so that I can access the platform securely.

#### Acceptance Criteria

1. WHEN a guest accesses the Signup screen, THE INZU_System SHALL display fields for name, email or phone, and password
2. WHEN a guest submits the signup form, THE INZU_System SHALL validate that all required fields are non-empty
3. WHEN signup data is valid, THE INZU_System SHALL create a user account and send an OTP via email or SMS
4. WHEN an OTP is sent, THE INZU_System SHALL display a verification screen prompting the user to enter the OTP
5. WHEN a user enters a correct OTP, THE INZU_System SHALL mark the account as verified and create a session
6. WHEN a user enters an incorrect OTP, THE INZU_System SHALL display an error message and allow retry
7. WHEN a user has not verified their account, THE INZU_System SHALL prevent access to authenticated features
8. WHEN a guest submits the signup form, THE INZU_System SHALL require acceptance of Terms & Conditions

### Requirement 3: User Authentication

**User Story:** As a registered user, I want to log in with my credentials, so that I can access my saved properties and inquiries.

#### Acceptance Criteria

1. WHEN a guest accesses the Login screen, THE INZU_System SHALL display fields for email or phone and password
2. WHEN a guest submits valid credentials, THE INZU_System SHALL create a session token and navigate to the Home Feed
3. WHEN a guest submits invalid credentials, THE INZU_System SHALL display an error message "Invalid email/phone or password"
4. WHEN a user clicks "Forgot Password", THE INZU_System SHALL navigate to a password reset flow
5. WHERE social login is enabled, THE INZU_System SHALL provide options to authenticate via third-party providers
6. WHEN a user successfully logs in, THE INZU_System SHALL store the session token in localStorage

### Requirement 4: Password Recovery

**User Story:** As a user who forgot my password, I want to reset it via email or SMS, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user initiates password reset, THE INZU_System SHALL prompt for email or phone number
2. WHEN a valid email or phone is provided, THE INZU_System SHALL send a password reset OTP
3. WHEN a user enters the correct OTP, THE INZU_System SHALL display a form to set a new password
4. WHEN a new password is submitted, THE INZU_System SHALL update the user's password and confirm success
5. WHEN an invalid OTP is entered, THE INZU_System SHALL display an error and allow retry

### Requirement 5: Home Feed Display

**User Story:** As a user, I want to browse property listings on the home feed, so that I can discover properties that match my needs.

#### Acceptance Criteria

1. WHEN a user navigates to the Home Feed, THE INZU_System SHALL display a search bar, filter controls, and a scrollable list of property cards
2. WHEN the Home Feed loads, THE INZU_System SHALL fetch property listings from the backend API
3. WHEN property listings are fetched, THE INZU_System SHALL display each listing as a card showing image, price, location, and property type
4. WHEN a user scrolls to the bottom of the feed, THE INZU_System SHALL load additional property listings (infinite scroll)
5. WHEN no properties match the current filters, THE INZU_System SHALL display a message "No properties found"
6. WHEN a user taps a property card, THE INZU_System SHALL navigate to the Property Detail screen
7. WHEN a user taps the heart icon on a property card, THE INZU_System SHALL toggle the favorite state for that property

### Requirement 6: Search and Filter

**User Story:** As a user, I want to search and filter properties by location, price, type, and amenities, so that I can find properties that meet my specific criteria.

#### Acceptance Criteria

1. WHEN a user enters text in the search bar on any screen, THE INZU_System SHALL filter properties by location matching the search query
2. WHEN a user applies filters, THE INZU_System SHALL combine all active filters using AND logic
3. WHEN a user selects a property type filter (Apartment, House, Land), THE INZU_System SHALL display only properties of that type
4. WHEN a user adjusts the price range slider, THE INZU_System SHALL display only properties within the selected price range
5. WHEN a user selects bedroom or bathroom count filters, THE INZU_System SHALL display only properties matching those criteria
6. WHEN a user taps "Near me", THE INZU_System SHALL filter properties by the user's current District
7. WHEN filters are applied, THE INZU_System SHALL update the feed in real-time without requiring a manual refresh
8. WHEN a user clears all filters, THE INZU_System SHALL display all available properties

### Requirement 7: Property Detail View

**User Story:** As a user, I want to view detailed information about a property, so that I can make an informed decision about contacting the owner.

#### Acceptance Criteria

1. WHEN a user navigates to the Property Detail screen, THE INZU_System SHALL display an image carousel, price, location, type, description, room descriptions, and amenities
2. WHEN a user swipes the image carousel, THE INZU_System SHALL display the next or previous property image
3. WHEN a user taps the favorite button, THE INZU_System SHALL toggle the saved state for that property
4. WHEN a user taps the contact button, THE INZU_System SHALL display an inquiry form
5. WHEN a user taps the map, THE INZU_System SHALL open the device's map application with the property location
6. WHEN the Property Detail screen loads, THE INZU_System SHALL fetch detailed property data from the backend API
7. WHEN a user taps the back button, THE INZU_System SHALL navigate to the previous screen
8. WHEN the Property Detail screen loads, THE INZU_System SHALL display property reviews and average rating

### Requirement 8: Favorites Management

**User Story:** As a user, I want to save properties to my favorites, so that I can easily access them later.

#### Acceptance Criteria

1. WHEN a user taps the heart icon on a property, THE INZU_System SHALL add the property to the user's favorites list
2. WHEN a user taps the heart icon on a favorited property, THE INZU_System SHALL remove the property from the favorites list
3. WHEN a user navigates to the Favorites screen, THE INZU_System SHALL display all saved properties
4. WHEN a user removes a property from favorites, THE INZU_System SHALL update the list immediately
5. WHEN favorites are modified, THE INZU_System SHALL sync changes with the backend API
6. WHEN the app is offline, THE INZU_System SHALL cache favorite changes locally and sync when connection is restored
7. WHEN a user taps a property in the Favorites screen, THE INZU_System SHALL navigate to the Property Detail screen

### Requirement 9: Inquiry Submission

**User Story:** As a user, I want to send inquiries to property owners, so that I can express interest and request more information.

#### Acceptance Criteria

1. WHEN a user taps the contact button on a property, THE INZU_System SHALL display an inquiry form with fields for name, email, phone, and message
2. WHEN a user submits the inquiry form, THE INZU_System SHALL validate that all required fields are non-empty
3. WHEN inquiry data is valid, THE INZU_System SHALL send the inquiry to the property owner via the backend API
4. WHEN an inquiry is successfully sent, THE INZU_System SHALL display a confirmation toast or modal with the message "Message sent"
5. WHEN inquiry submission fails, THE INZU_System SHALL display an error message and allow retry
6. WHERE inquiry history is enabled, THE INZU_System SHALL store a record of sent inquiries for the user

### Requirement 10: User Profile Management

**User Story:** As a user, I want to view and update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a user navigates to the Profile screen, THE INZU_System SHALL display the user's name, email, and phone number
2. WHEN a user updates profile information, THE INZU_System SHALL validate the new data
3. WHEN updated profile data is valid, THE INZU_System SHALL send the changes to the backend API and confirm success
4. WHEN a user changes their password, THE INZU_System SHALL require the current password for verification
5. WHEN a new password is submitted, THE INZU_System SHALL update the password and display a success message
6. WHEN a user updates preferences (notifications, theme), THE INZU_System SHALL save the changes locally and sync with the backend

### Requirement 11: User Settings Management

**User Story:** As a user, I want to manage my account settings including logout and account deletion, so that I have control over my account.

#### Acceptance Criteria

1. WHEN a user navigates to the Settings screen, THE INZU_System SHALL display options for logout, account deletion, theme preferences, and notification settings
2. WHEN a user taps the logout button in Settings, THE INZU_System SHALL clear the session token from localStorage
3. WHEN the session is cleared, THE INZU_System SHALL navigate to the Login screen
4. WHEN a user logs out, THE INZU_System SHALL clear any cached user data from memory
5. WHEN a user taps "Delete Account", THE INZU_System SHALL display a confirmation dialog
6. WHEN a user confirms account deletion, THE INZU_System SHALL delete the user account and all associated data
7. WHEN account deletion is complete, THE INZU_System SHALL navigate to the Login screen

### Requirement 12: Push Notifications

**User Story:** As a user, I want to receive notifications about new listings and inquiry replies, so that I stay informed about relevant updates.

#### Acceptance Criteria

1. WHEN a new property listing matches a user's saved search criteria, THE INZU_System SHALL send a push notification to the user
2. WHEN a property owner replies to a user's inquiry, THE INZU_System SHALL send a push notification to the user
3. WHEN a notification is received, THE INZU_System SHALL store it in the app's notification center
4. WHEN a user taps a notification, THE INZU_System SHALL navigate to the relevant screen (property detail or inquiry thread)
5. WHEN a user disables notifications in preferences, THE INZU_System SHALL stop sending push notifications

### Requirement 13: Bottom Navigation

**User Story:** As a user, I want persistent bottom navigation, so that I can quickly switch between main sections of the app.

#### Acceptance Criteria

1. WHEN a user is on any main screen, THE INZU_System SHALL display a bottom navigation bar with Home, Search, Favorites, Messages, and Profile tabs
2. WHEN a user taps a navigation tab, THE INZU_System SHALL switch to the corresponding screen
3. WHEN a user switches screens via bottom navigation, THE INZU_System SHALL preserve the previous screen's state (scroll position, applied filters)
4. WHEN a user is on a detail screen, THE INZU_System SHALL continue displaying the bottom navigation bar

### Requirement 14: Error Handling and Network Resilience

**User Story:** As a user, I want clear error messages when something goes wrong, so that I understand what happened and how to proceed.

#### Acceptance Criteria

1. WHEN a network request fails, THE INZU_System SHALL display an error message "Check your connection"
2. WHEN no properties match the applied filters, THE INZU_System SHALL display "No properties found"
3. WHEN a user submits an invalid inquiry form, THE INZU_System SHALL highlight the missing or invalid fields
4. WHEN a session token expires, THE INZU_System SHALL redirect the user to the Login screen
5. WHEN a user's profile has empty required fields, THE INZU_System SHALL prompt the user to complete their profile

### Requirement 15: Responsive and Optimized UI

**User Story:** As a user on a mobile device, I want the app to load quickly and display content smoothly, so that I have a pleasant browsing experience.

#### Acceptance Criteria

1. WHEN the app displays property images, THE INZU_System SHALL use lazy loading to load images only when they become visible
2. WHEN a user toggles a favorite, THE INZU_System SHALL update the UI optimistically before confirming with the backend
3. WHEN the app displays property cards, THE INZU_System SHALL scale images and layout responsively for different screen sizes
4. WHEN a user navigates between screens, THE INZU_System SHALL use smooth transitions and animations
5. WHEN filters are applied, THE INZU_System SHALL animate the filter panel slide-in and slide-out

### Requirement 16: Geolocation-Based Property Prioritization

**User Story:** As a user, I want to see properties near my current location first, so that I can find convenient options quickly.

#### Acceptance Criteria

1. WHEN the Home Feed loads, THE INZU_System SHALL request the user's geolocation permission
2. WHEN geolocation permission is granted, THE INZU_System SHALL fetch the user's current District
3. WHEN property listings are fetched, THE INZU_System SHALL prioritize properties in the user's District
4. WHEN geolocation permission is denied, THE INZU_System SHALL display properties without location-based prioritization

### Requirement 17: Theme Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN a user navigates to Settings, THE INZU_System SHALL display a Theme toggle option
2. WHEN a user toggles the Theme, THE INZU_System SHALL switch between light and dark color schemes
3. WHEN the Theme is changed, THE INZU_System SHALL apply the new Theme to all screens immediately
4. WHEN the app launches, THE INZU_System SHALL load the user's saved Theme preference
5. WHEN a Theme is selected, THE INZU_System SHALL persist the preference in localStorage

### Requirement 18: Messaging System

**User Story:** As a user, I want to send and receive messages with property owners, so that I can communicate about property details.

#### Acceptance Criteria

1. WHEN a user navigates to the Messages screen, THE INZU_System SHALL display a list of conversation threads
2. WHEN a conversation has unread messages, THE INZU_System SHALL display an Unread_Count badge on the conversation
3. WHEN a user opens a conversation, THE INZU_System SHALL display all messages in chronological order
4. WHEN a user sends a message, THE INZU_System SHALL display a Seen_Status indicator when the recipient views it
5. WHEN a user replies to a message, THE INZU_System SHALL display a reply indicator similar to Instagram's reply feature
6. WHEN a user taps the emoji button, THE INZU_System SHALL display an emoji picker
7. WHEN a user selects an emoji, THE INZU_System SHALL insert it into the message input field
8. WHEN new messages are received, THE INZU_System SHALL update the conversation in real-time without requiring a page refresh
9. WHEN a user taps the voice note button, THE INZU_System SHALL begin recording audio
10. WHEN a user releases the voice note button, THE INZU_System SHALL send the Voice_Note immediately
11. WHEN a Voice_Note is sent, THE INZU_System SHALL display the audio waveform and duration in the conversation

### Requirement 19: Property Reviews and Ratings

**User Story:** As a user, I want to read and submit reviews for properties, so that I can make informed decisions and share my experiences.

#### Acceptance Criteria

1. WHEN a user views a Property Detail screen, THE INZU_System SHALL display all reviews for that property
2. WHEN reviews are displayed, THE INZU_System SHALL show the average rating calculated from all reviews
3. WHEN a user taps "Write Review", THE INZU_System SHALL display a review form with a 5-star rating selector and text field
4. WHEN a user submits a review, THE INZU_System SHALL validate that a rating between 1 and 5 stars is selected
5. WHEN a review is submitted, THE INZU_System SHALL save the Review and update the property's average rating
6. WHEN a user has already reviewed a property, THE INZU_System SHALL display their existing review and allow editing
7. WHEN reviews are displayed, THE INZU_System SHALL show the reviewer's name, rating, comment, and submission date

### Requirement 20: Property Upload with Room Descriptions

**User Story:** As a property owner, I want to add detailed room descriptions when uploading a property, so that potential renters have comprehensive information.

#### Acceptance Criteria

1. WHEN a user uploads a property, THE INZU_System SHALL display fields for room descriptions
2. WHEN a user adds a room description, THE INZU_System SHALL allow specifying room type (bedroom, bathroom, kitchen, living room)
3. WHEN a user submits the property upload form, THE INZU_System SHALL validate that at least one room description is provided
4. WHEN a property is saved, THE INZU_System SHALL store all room descriptions with the property listing
5. WHEN a user views a Property Detail screen, THE INZU_System SHALL display all room descriptions

### Requirement 21: Real-Time Data Updates

**User Story:** As a user, I want property listings and messages to update automatically, so that I always see the latest information without refreshing.

#### Acceptance Criteria

1. WHEN new properties are added to the system, THE INZU_System SHALL update the Home Feed in real-time without requiring a page refresh
2. WHEN a property's details are modified, THE INZU_System SHALL update the Property Detail screen in real-time
3. WHEN a user's favorites are modified on another device, THE INZU_System SHALL sync the changes in real-time
4. WHEN filters are applied, THE INZU_System SHALL update the property list in real-time
5. WHEN a property is removed from the system, THE INZU_System SHALL remove it from the feed in real-time

### Requirement 22: Terms and Conditions

**User Story:** As a user, I want to read the platform's terms and conditions, so that I understand my rights and responsibilities.

#### Acceptance Criteria

1. WHEN a user taps "Terms & Conditions" in Settings, THE INZU_System SHALL navigate to the Terms and Conditions screen
2. WHEN the Terms and Conditions screen loads, THE INZU_System SHALL display the complete terms content
3. WHEN a user scrolls the Terms and Conditions, THE INZU_System SHALL allow smooth scrolling through all sections
4. WHEN a user taps the back button, THE INZU_System SHALL navigate to the previous screen
5. WHEN a new user signs up, THE INZU_System SHALL require acceptance of Terms & Conditions before account creation
