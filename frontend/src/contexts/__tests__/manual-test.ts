/**
 * Manual Test Script for Login Flow
 * Run this in the browser console to test the login flow
 */

// Test 1: Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const testEmails = [
  { email: 'test@example.com', expected: true },
  { email: 'invalid', expected: false },
  { email: 'user @domain.com', expected: false },
  { email: 'valid+tag@domain.co.uk', expected: true },
];

console.log('=== Email Validation Tests ===');
testEmails.forEach(({ email, expected }) => {
  const result = emailRegex.test(email);
  console.log(`${email}: ${result === expected ? '✅' : '❌'} (expected: ${expected}, got: ${result})`);
});

// Test 2: Decode mock Google credential
const createMockCredential = (email: string, name: string) => {
  const payload = {
    email,
    name,
    picture: 'https://example.com/photo.jpg',
    sub: 'google-user-123',
    email_verified: true,
  };
  
  const encodedPayload = btoa(JSON.stringify(payload));
  return `header.${encodedPayload}.signature`;
};

console.log('\n=== Google Credential Decoding Test ===');
const mockCredential = createMockCredential('test@example.com', 'Test User');
const parts = mockCredential.split('.');
const decoded = JSON.parse(atob(parts[1]));
console.log('Decoded payload:', decoded);
console.log('Email extracted:', decoded.email);
console.log('Valid email?', emailRegex.test(decoded.email) ? '✅' : '❌');

// Test 3: localStorage API key storage
console.log('\n=== localStorage Tests ===');
const testApiKey = 'test-api-key-' + Math.random().toString(36).substring(7);
localStorage.setItem('apiToken', testApiKey);
const retrieved = localStorage.getItem('apiToken');
console.log('Stored API key:', testApiKey);
console.log('Retrieved API key:', retrieved);
console.log('Match?', testApiKey === retrieved ? '✅' : '❌');

// Clean up
localStorage.removeItem('apiToken');

console.log('\n=== All manual tests complete! ===');
console.log('To test the full login flow:');
console.log('1. Open the app in dev mode');
console.log('2. Open browser console');
console.log('3. Click "Sign in with Google"');
console.log('4. Watch for console logs marked with emoji (🔐, ✅, ❌, etc.)');
console.log('5. After login, check localStorage for "apiToken"');
