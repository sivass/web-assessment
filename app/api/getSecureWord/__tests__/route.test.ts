import { NextRequest } from "next/server";
import { POST } from "../route";
import { clearRateLimitState } from "@/lib/rateLimit";
import { cookies } from "next/headers";

// Mock Next.js modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => ({
    url,
    method: options?.method || 'GET',
    body: options?.body,
    json: () => Promise.resolve(JSON.parse(options?.body || '{}')),
  })),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      cookies: {
        set: jest.fn(),
      },
    })),
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// Mock CryptoJS
jest.mock("crypto-js", () => ({
  SHA256: jest.fn(() => ({
    toString: () => "mocked-secure-word-hash-123456789012",
  })),
}));

describe("getSecureWord API", () => {
  const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore as unknown as ReturnType<typeof cookies>);
    
    // Set default environment
    process.env.SECRET_KEY = "test-secret-key";
    
    // Clear the rate limiting state
    clearRateLimitState();
  });

  describe("POST /api/getSecureWord", () => {
    it("should generate a new secure word for valid request", async () => {
      // Mock empty cookie store (no existing secure word)
      mockCookieStore.get.mockReturnValue(undefined);

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("secureWord");
      expect(data).toHaveProperty("expiresIn", 60);
      expect(data).toHaveProperty("issuedAt");
      expect(typeof data.secureWord).toBe("string");
      expect(data.secureWord.length).toBe(12);
    });

    it("should return rate limit error for rapid requests", async () => {
      // Mock empty cookie store
      mockCookieStore.get.mockReturnValue(undefined);

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      // First request should succeed
      const firstResponse = await POST(request);
      expect(firstResponse.status).toBe(200);

      // Second request within 10 seconds should be rate limited
      const secondResponse = await POST(request);
      const secondData = await secondResponse.json();

      expect(secondResponse.status).toBe(429);
      expect(secondData).toHaveProperty("error", "Rate limited. Try again later.");
    });

    it("should return existing valid secure word if not expired", async () => {
      const existingSecureWord = "existing123";
      const issuedTime = Date.now() - 30000; // 30 seconds ago (still valid)

      // Mock existing secure word and timestamp
      mockCookieStore.get
        .mockReturnValueOnce({ value: existingSecureWord }) // secure-word-{username}
        .mockReturnValueOnce({ value: issuedTime.toString() }); // secure-word-time-{username}

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("secureWord", existingSecureWord);
      expect(data).toHaveProperty("expiresIn");
      expect(data.expiresIn).toBeGreaterThan(0);
      expect(data.expiresIn).toBeLessThanOrEqual(60);
      expect(data).toHaveProperty("issuedAt", issuedTime);
    });

    it("should generate new secure word if existing one is expired", async () => {
      const existingSecureWord = "expired123";
      const issuedTime = Date.now() - 70000; // 70 seconds ago (expired)

      // Mock expired secure word and timestamp
      mockCookieStore.get
        .mockReturnValueOnce({ value: existingSecureWord }) // secure-word-{username}
        .mockReturnValueOnce({ value: issuedTime.toString() }); // secure-word-time-{username}

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("secureWord");
      expect(data.secureWord).not.toBe(existingSecureWord);
      expect(data).toHaveProperty("expiresIn", 60);
      expect(data).toHaveProperty("issuedAt");
    });

    it("should handle missing username gracefully", async () => {
      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      // API should still process the request even with missing username
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("secureWord");
    });

    it("should handle malformed JSON gracefully", async () => {
      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: "invalid-json",
      });

      // This should throw because JSON.parse will fail
      await expect(POST(request)).rejects.toThrow();
    });

    it("should set cookies with correct properties", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      
      // Verify that cookies.set was called
      expect(response.cookies.set).toHaveBeenCalled();
    });

    it("should use different rate limits for different usernames", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const user1Request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "user1" }),
      });

      const user2Request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "user2" }),
      });

      // Both users should be able to make requests
      const response1 = await POST(user1Request);
      const response2 = await POST(user2Request);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it("should handle environment variables correctly", async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      
      // Test with different SECRET_KEY
      process.env.SECRET_KEY = "prod-secret-key";

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it("should handle missing SECRET_KEY environment variable", async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      
      // Remove SECRET_KEY
      delete process.env.SECRET_KEY;

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Rate Limiting", () => {
    it("should allow requests after rate limit period", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      // First request
      const firstResponse = await POST(request);
      expect(firstResponse.status).toBe(200);

      // Mock time passing (11 seconds later)
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + 11000);

      // Second request after rate limit period
      const secondResponse = await POST(request);
      expect(secondResponse.status).toBe(200);

      // Restore original Date.now
      Date.now = originalDateNow;
    });
  });

  describe("Cookie Management", () => {
    it("should handle missing timestamp cookie gracefully", async () => {
      const existingSecureWord = "existing123";

      // Mock existing secure word but no timestamp
      mockCookieStore.get
        .mockReturnValueOnce({ value: existingSecureWord }) // secure-word-{username}
        .mockReturnValueOnce(undefined); // secure-word-time-{username}

      const request = new NextRequest("http://localhost:3000/api/getSecureWord", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should generate new secure word since timestamp is missing
      expect(data).toHaveProperty("secureWord");
      expect(data.secureWord).not.toBe(existingSecureWord);
    });
  });
}); 