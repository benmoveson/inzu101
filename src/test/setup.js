import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {
    // Immediately trigger the callback to simulate intersection
    this.callback([{ isIntersecting: true }])
  }
  unobserve() {}
  disconnect() {}
}

// Mock geolocation
Object.defineProperty(global.navigator, 'geolocation', {
  value: {
    getCurrentPosition: (success, error) => {
      // Mock successful geolocation
      success({
        coords: {
          latitude: -1.9536,
          longitude: 30.0606
        }
      })
    }
  },
  writable: true,
  configurable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: (key) => {
    return localStorageMock[key] || null
  },
  setItem: (key, value) => {
    localStorageMock[key] = value
  },
  removeItem: (key) => {
    delete localStorageMock[key]
  },
  clear: () => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorageMock[key]
      }
    })
  }
}

global.localStorage = localStorageMock
