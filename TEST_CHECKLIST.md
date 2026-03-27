# Test Checklist

## Visual Verification

### Property Cards (Home Page)
- [ ] Cards are small, Airbnb-style (1:1 aspect ratio)
- [ ] Heart icon (red when liked) in top-right of image
- [ ] Bookmark icon (save) below heart icon in image area
- [ ] Location displayed in dark color
- [ ] Bedroom count shows (e.g., "2 beds")
- [ ] Amenity icons visible on right side (WiFi, Electricity, Water, AC)
- [ ] Price shows exact database value with format:
  - Rent: `{price} RWF / month` or `{price} RWF / night`
  - Sale: `{price} RWF`

### Header Navigation
- [ ] "Rent | Buy" text toggle (no icons)
- [ ] Clicking "Rent" filters to rental properties
- [ ] Clicking "Buy" filters to sale properties
- [ ] No "Houses Rooms Apartments Services" categories

### Bottom Navigation
- [ ] Home icon → /home
- [ ] Search icon → /search
- [ ] Heart icon → /favorites
- [ ] Messages icon → /messages (NOT dashboard)
- [ ] Settings icon → /profile

### Messages Page
- [ ] Accessible from bottom navigation
- [ ] Shows empty state with message icon if no conversations
- [ ] Shows conversation list if messages exist
- [ ] Each conversation shows: avatar, name, last message, timestamp
- [ ] NOT showing dashboard information

### Property Details Page
- [ ] Bedroom count displayed correctly
- [ ] Price shows exact database value (no multiplication)
- [ ] Format matches listing type (rent with period, sale without)
- [ ] NO "N/A Sq Ft" displayed
- [ ] Amenities section visible
- [ ] NO map button in location display

### Search Functionality
- [ ] Location search input works
- [ ] Typing location filters properties
- [ ] Filter panel opens with slider icon
- [ ] Price range filters work
- [ ] Property type filters work
- [ ] Bedroom/bathroom filters work

### Colors
- [ ] All hover effects are green (not blue)
- [ ] Floating add button is green
- [ ] Like button is red when active
- [ ] No blue hover colors anywhere

### Footer
- [ ] Footer completely removed from all pages

## Backend API Tests

### Properties Endpoint
```bash
# Test location search
curl "http://localhost:5000/api/properties?location=Kigali"

# Test listing type filter (rent)
curl "http://localhost:5000/api/properties?listingType=rent"

# Test listing type filter (sale)
curl "http://localhost:5000/api/properties?listingType=sale"

# Test combined filters
curl "http://localhost:5000/api/properties?location=Kigali&listingType=rent&minPrice=50000&maxPrice=200000"
```

### Messages Endpoint
```bash
# Get conversations (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/messages"

# Send message (requires auth token)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"Hello","receiverId":"USER_ID","propertyId":"PROPERTY_ID"}' \
  "http://localhost:5000/api/messages"
```

## Data Verification

### Property Model Fields Used
- `amenities.bedrooms.count` - Bedroom count
- `amenities.internet` - WiFi icon
- `amenities.electricity` - Electricity icon
- `amenities.water` - Water icon
- `amenities.airConditioning` - AC icon
- `price` - Exact price (no multiplication)
- `listingType` - "rent" or "sale"
- `rentPeriod` - "month" or "night" (for rentals)
- `district` - Location display
- `location` - Location display

## User Flow Tests

1. **Browse Properties**
   - Open app → See property cards
   - Verify amenity icons visible
   - Verify prices match database

2. **Filter by Category**
   - Click "Rent" → See only rental properties
   - Click "Buy" → See only sale properties

3. **Search by Location**
   - Type location in search bar
   - Verify properties filter by location

4. **View Property Details**
   - Click property card
   - Verify bedroom count shows
   - Verify price is correct
   - Verify no "N/A Sq Ft"

5. **Navigate to Messages**
   - Click Messages icon in bottom nav
   - Verify Messages page loads (not Dashboard)
   - Verify empty state or conversation list

6. **Save Properties**
   - Click bookmark icon on property card
   - Navigate to Favorites
   - Verify saved property appears

## Issues to Watch For

1. **Amenity Icons Not Showing**: Check if property data has amenities object
2. **Search Not Working**: Verify backend is running on port 5000
3. **Wrong Prices**: Check if any code is multiplying price values
4. **Messages Shows Dashboard**: Verify route points to /messages not /dashboard
5. **Blue Hover Colors**: Search for `#3b82f6` or `blue` in CSS files
