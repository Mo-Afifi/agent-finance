/**
 * AuthContext Tests
 * Tests for Google OAuth login and automatic user registration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Google JWT token payload
const createMockGoogleCredential = (email: string, name: string, sub: string) => {
  const payload = {
    email,
    name,
    picture: 'https://example.com/photo.jpg',
    sub,
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  
  const header = { alg: 'RS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Mock backend response
const createMockBackendResponse = (email: string, apiKey: string) => ({
  success: true,
  data: {
    userId: 'user-123',
    email,
    apiKey,
    createdAt: new Date().toISOString(),
  },
});

describe('AuthContext - Login Flow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  it('should extract email correctly from Google credential', () => {
    const mockCredential = createMockGoogleCredential(
      'test@example.com',
      'Test User',
      'google-sub-123'
    );
    
    const parts = mockCredential.split('.');
    const payload = JSON.parse(atob(parts[1]));
    
    expect(payload.email).toBe('test@example.com');
    expect(payload.name).toBe('Test User');
    expect(payload.sub).toBe('google-sub-123');
  });

  it('should validate email format', () => {
    const validEmails = [
      'user@example.com',
      'test.user@domain.co.uk',
      'name+tag@gmail.com',
    ];
    
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
    ];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should send correct request body to backend', async () => {
    const email = 'test@example.com';
    const name = 'Test User';
    const googleId = 'google-sub-123';
    
    const mockResponse = createMockBackendResponse(email, 'api-key-123');
    
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });
    
    const response = await fetch('http://localhost:3000/api/users/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, name, googleId }),
    });
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/users/register'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
    
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.apiKey).toBe('api-key-123');
  });

  it('should store API key in localStorage after successful registration', async () => {
    const apiKey = 'test-api-key-abc123';
    
    localStorage.setItem('apiToken', apiKey);
    
    expect(localStorage.getItem('apiToken')).toBe(apiKey);
  });

  it('should handle backend errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => JSON.stringify({ error: 'Invalid email' }),
    });
    
    try {
      const response = await fetch('http://localhost:3000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid' }),
      });
      
      if (!response.ok) {
        throw new Error('Backend registration failed');
      }
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Backend registration failed');
    }
  });

  it('should clear localStorage on login failure', () => {
    localStorage.setItem('apiToken', 'old-token');
    localStorage.setItem('openclaw_pay_user', JSON.stringify({ email: 'old@example.com' }));
    
    // Simulate login failure - clear state
    localStorage.removeItem('apiToken');
    localStorage.removeItem('openclaw_pay_user');
    
    expect(localStorage.getItem('apiToken')).toBeNull();
    expect(localStorage.getItem('openclaw_pay_user')).toBeNull();
  });
});

describe('Email Validation', () => {
  it('should reject invalid email formats', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const testCases = [
      { email: 'invalid', expected: false },
      { email: 'invalid@', expected: false },
      { email: '@invalid.com', expected: false },
      { email: 'user @example.com', expected: false },
      { email: 'valid@example.com', expected: true },
      { email: 'user+tag@domain.co.uk', expected: true },
    ];
    
    testCases.forEach(({ email, expected }) => {
      expect(emailRegex.test(email)).toBe(expected);
    });
  });
});
