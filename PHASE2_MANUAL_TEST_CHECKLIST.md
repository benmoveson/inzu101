# Phase 2 Manual Testing Checklist

## Instructions
Test each feature manually in the browser. Check the box when verified working.

## Theme Toggle System (Task 21)
- [ ] Navigate to Settings page
- [ ] Toggle theme switch
- [ ] Verify all screens update to dark/light theme immediately
- [ ] Refresh page and verify theme persists
- [ ] Check localStorage for `inzu_theme` value
- [ ] Verify theme syncs with backend (check network tab)

## Global Search Enhancement (Task 22)
- [ ] Test search on Home page
- [ ] Test search on Houses page
- [ ] Test search on Rooms page
- [ ] Test search on Apartments page
- [ ] Test search on Hotels page
- [ ] Verify search results filter by location
- [ ] Verify search query persists in sessionStorage
- [ ] Test clear search button

## District-Level Location Tracking (Task 23)
- [ ] Allow location permission when prompted
- [ ] Verify district is detected and stored
- [ ] Click "Near me" filter button
- [ ] Verify properties filtered by district
- [ ] Test with location permission denied
- [ ] Verify fallback behavior

## Enhanced Messaging System (Task 25)
- [ ] Navigate to Messages page
- [ ] Verify unread count badge displays
- [ ] Open a conversation
- [ ] Send a text message
- [ ] Verify "seen" status appears when recipient views
- [ ] Test reply to message (Instagram-style indicator)
- [ ] Record and send voice note
- [ ] Verify voice note sends immediately on release
- [ ] Click emoji button
- [ ] Select emoji and verify insertion in message input
- [ ] Verify real-time message updates

## Property Review System (Task 30)
- [ ] Navigate to a property detail page
- [ ] Verify average rating displays at top
- [ ] Scroll to reviews section
- [ ] Click "Write a Review" button
- [ ] Select star rating (1-5)
- [ ] Enter comment text
- [ ] Submit review
- [ ] Verify review appears in list
- [ ] Verify average rating updates
- [ ] Test editing existing review

## Room Descriptions (Task 31)
- [ ] Navigate to Add Property page
- [ ] Click "Add Room" button
- [ ] Select room type from dropdown
- [ ] Enter room description
- [ ] Add multiple rooms
- [ ] Remove a room
- [ ] Try to submit without room descriptions (should fail)
- [ ] Submit property with room descriptions
- [ ] View property detail page
- [ ] Verify room descriptions display correctly

## Real-Time Updates (Task 29)
- [ ] Open app in two browser windows
- [ ] Add a new property in window 1
- [ ] Verify property appears in window 2 without refresh
- [ ] Send a message in window 1
- [ ] Verify message appears in window 2 without refresh
- [ ] Disconnect internet
- [ ] Verify polling fallback activates
- [ ] Reconnect internet
- [ ] Verify WebSocket reconnects

## Account Deletion (Task 27)
- [ ] Navigate to Settings page
- [ ] Click "Delete Account" button
- [ ] Verify confirmation dialog appears
- [ ] Enter password
- [ ] Confirm deletion
- [ ] Verify redirect to Login page
- [ ] Try to log in with deleted account (should fail)

## Terms and Conditions (Task 28)
- [ ] Navigate to Settings page
- [ ] Click "Terms & Conditions" link
- [ ] Verify terms content displays
- [ ] Test scrolling through content
- [ ] Click back button
- [ ] Navigate to Signup page
- [ ] Verify terms acceptance checkbox
- [ ] Try to signup without accepting terms (should fail)

## Bottom Navigation Unread Count (Task 33)
- [ ] Send yourself a message
- [ ] Navigate away from Messages page
- [ ] Verify unread count badge on Messages tab
- [ ] Open Messages page
- [ ] Verify badge updates/disappears

## Back Button in PropertyDetail (Task 32)
- [ ] Navigate to a property detail page
- [ ] Click back button at top
- [ ] Verify navigation to previous page

## Performance Testing
- [ ] Run Lighthouse audit
- [ ] Check initial page load time (target: < 2s)
- [ ] Check time to interactive (target: < 3s)
- [ ] Test on slow 3G network
- [ ] Test on mobile device
- [ ] Check bundle size
- [ ] Verify lazy loading of images
- [ ] Test infinite scroll performance

## Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome

## Notes
Add any issues or observations below:

