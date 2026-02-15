# SkaiScraper Mobile API Documentation

## Overview

The SkaiScraper Mobile API provides RESTful endpoints for iOS and Android applications to interact with the platform. All endpoints require JWT authentication.

**Base URL:** `https://skaiscrape.com/api/mobile` (Production)  
**Base URL:** `http://localhost:3000/api/mobile` (Development)

---

## Authentication

### POST /api/mobile/auth

Authenticate a user and receive a JWT token.

**Request:**

```json
{
  "email": "contractor@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "30d",
  "user": {
    "id": "user_2abc123def",
    "email": "contractor@example.com",
    "name": "John Contractor",
    "organizationId": "org_xyz789",
    "organizationName": "Acme Roofing LLC",
    "role": "contractor"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

**Token Usage:**
Include the token in all subsequent requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 30 days  
**Token Refresh:** Re-authenticate before expiration

---

## Endpoints

### POST /api/mobile/upload

Upload photos from mobile device to a claim.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (Form Data):**

```
file: <binary file data>
claimId: "claim_abc123"
category: "roof" | "interior" | "exterior" | "other"
```

**File Constraints:**

- Max size: 10MB
- Supported formats: JPEG, PNG, HEIC
- Automatic compression applied
- EXIF data preserved

**Response (200 OK):**

```json
{
  "success": true,
  "file": {
    "url": "https://supabase.co/storage/v1/object/public/photos/claim_abc123/roof/1701234567890-x7k9m.jpg",
    "path": "claim_abc123/roof/1701234567890-x7k9m.jpg",
    "size": 2457600,
    "mimeType": "image/jpeg"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Missing file or claimId
- `401 Unauthorized` - Invalid or expired token
- `413 Payload Too Large` - File exceeds 10MB
- `415 Unsupported Media Type` - Invalid file format
- `500 Internal Server Error` - Upload failed

**Example (Swift):**

```swift
let url = URL(string: "\(baseURL)/upload")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

let boundary = UUID().uuidString
request.setValue("multipart/form-data; boundary=\(boundary)",
                 forHTTPHeaderField: "Content-Type")

var body = Data()
// Add file data...
// Add claimId...
// Add category...

URLSession.shared.dataTask(with: request) { data, response, error in
    // Handle response
}.resume()
```

---

### GET /api/mobile/claims

Retrieve claims list with pagination and filtering.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `limit` (optional, default: 20, max: 100) - Number of results per page
- `offset` (optional, default: 0) - Pagination offset
- `status` (optional) - Filter by status: `new`, `in_progress`, `approved`, `denied`, `completed`

**Request:**

```
GET /api/mobile/claims?limit=20&offset=0&status=in_progress
```

**Response (200 OK):**

```json
{
  "claims": [
    {
      "id": "claim_abc123",
      "claimNumber": "CLM-2024-001",
      "title": "Wind Damage - 123 Main St",
      "status": "in_progress",
      "damageType": "wind",
      "dateOfLoss": "2024-11-15T00:00:00.000Z",
      "estimatedValue": 15000,
      "property": {
        "address": "123 Main St",
        "city": "Austin",
        "state": "TX",
        "zipCode": "78701"
      },
      "createdAt": "2024-11-16T10:30:00.000Z",
      "updatedAt": "2024-12-02T14:22:00.000Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or expired token
- `500 Internal Server Error` - Query failed

**Example (Kotlin):**

```kotlin
val url = "$baseURL/claims?limit=20&offset=0"
val request = Request.Builder()
    .url(url)
    .addHeader("Authorization", "Bearer $token")
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onResponse(call: Call, response: Response) {
        val claims = response.body?.string()
        // Parse and display
    }
})
```

---

## Error Codes

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional context (development only)"
}
```

**Common Error Codes:**

- `UNAUTHORIZED` - Missing or invalid token
- `INVALID_REQUEST` - Malformed request body
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file format
- `CLAIM_NOT_FOUND` - Claim ID doesn't exist
- `ORGANIZATION_MISMATCH` - Claim belongs to different organization
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

**Limits:**

- Authentication: 10 requests per minute
- Upload: 30 requests per minute
- Claims list: 60 requests per minute

**Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701234567
```

**429 Response:**

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30
}
```

---

## Best Practices

### Security

1. **Store tokens securely** - Use Keychain (iOS) or EncryptedSharedPreferences (Android)
2. **Never log tokens** - Exclude from crash reports and analytics
3. **Validate SSL certificates** - Enable certificate pinning for production
4. **Handle token expiration** - Implement automatic re-authentication

### Performance

1. **Compress images** - Use native compression before upload
2. **Batch uploads** - Queue multiple photos, upload sequentially
3. **Cache claims data** - Store locally, sync periodically
4. **Implement retry logic** - Handle network failures gracefully

### User Experience

1. **Show upload progress** - Display real-time progress bars
2. **Enable offline mode** - Queue operations, sync when online
3. **Handle errors gracefully** - Provide clear error messages
4. **Optimize battery usage** - Batch operations, use background tasks

---

## Example: Complete Photo Upload Flow

```javascript
// 1. Authenticate
const authResponse = await fetch("https://skaiscrape.com/api/mobile/auth", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "contractor@example.com",
    password: "password123",
  }),
});
const { token } = await authResponse.json();

// 2. Upload photo
const formData = new FormData();
formData.append("file", {
  uri: photoUri,
  type: "image/jpeg",
  name: "photo.jpg",
});
formData.append("claimId", "claim_abc123");
formData.append("category", "roof");

const uploadResponse = await fetch("https://skaiscrape.com/api/mobile/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "multipart/form-data",
  },
  body: formData,
});
const { file } = await uploadResponse.json();

// 3. Verify upload
console.log("Photo uploaded:", file.url);
```

---

## SDK Roadmap

**Q1 2025:**

- iOS Swift SDK
- Android Kotlin SDK
- React Native wrapper

**Q2 2025:**

- Flutter SDK
- Xamarin support
- Offline sync SDK

---

## Support

**Technical Issues:**

- Email: support@skaiscrape.com
- Slack: #mobile-api
- Response time: <2 hours (Enterprise), <24 hours (Professional)

**Documentation Updates:**

- Changelog: https://docs.skaiscrape.com/mobile/changelog
- API Status: https://status.skaiscrape.com

**Feedback:**

- Feature requests: feedback@skaiscrape.com
- Bug reports: bugs@skaiscrape.com

---

## Changelog

### v1.0.0 (2024-12-02)

- Initial release
- JWT authentication
- Photo upload with compression
- Claims list with pagination
- Rate limiting implemented

---

**API Version:** 1.0.0  
**Last Updated:** December 2, 2024  
**Stability:** Production Ready
