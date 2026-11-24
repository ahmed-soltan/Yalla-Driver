# Yalla Captain API Contract

This document describes the API endpoints currently used or expected by the
captain mobile application. Unless stated otherwise:

- The API base URL is configured by the app environment.
- Authenticated requests use `Authorization: Bearer <accessToken>`.
- JSON requests use `Content-Type: application/json`.
- Dates use ISO-8601 strings (`YYYY-MM-DD` for date-only values).
- Error responses should use the following shape:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

## 1. Authentication

### Request signup OTP

```http
POST /auth/signup/request-otp
Content-Type: application/json
```

```json
{
  "phoneNumber": "+201012345678",
  "accountType": "CAPTAIN"
}
```

Response:

```json
{
  "verificationId": "verification-id",
  "expiresAt": "2026-10-08T18:00:00Z"
}
```

`expiresAt` is optional on the client but recommended.

### Verify signup OTP

```http
POST /auth/signup/verify-otp
Content-Type: application/json
```

```json
{
  "verificationId": "verification-id",
  "phoneNumber": "+201012345678",
  "code": "123456",
  "accountType": "CAPTAIN",
  "device": {
    "deviceId": "device-id",
    "deviceName": "Ahmed's Phone",
    "platform": "android",
    "deviceModel": "Pixel 9"
  }
}
```

Response:

```json
{
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "requiresProfileCompletion": true,
  "user": {
    "id": 1,
    "phoneNumber": "+201012345678",
    "fullName": null,
    "email": null,
    "avatarUrl": null,
    "dateOfBirth": null,
    "gender": null,
    "role": "CAPTAIN"
  }
}
```

### Request login OTP

```http
POST /auth/login/request-otp
Content-Type: application/json
```

```json
{
  "phoneNumber": "+201012345678"
}
```

Response:

```json
{
  "verificationId": "verification-id",
  "expiresAt": "2026-10-08T18:00:00Z"
}
```

### Verify login OTP

```http
POST /auth/login/verify-otp
Content-Type: application/json
```

```json
{
  "verificationId": "verification-id",
  "phoneNumber": "+201012345678",
  "code": "123456",
  "device": {
    "deviceId": "device-id",
    "deviceName": "Ahmed's Phone",
    "platform": "android",
    "deviceModel": "Pixel 9"
  }
}
```

Response:

```json
{
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "requiresProfileCompletion": false,
  "user": {
    "id": 1,
    "phoneNumber": "+201012345678",
    "fullName": "Ahmed Sultan",
    "email": "ahmed@example.com",
    "avatarUrl": null,
    "dateOfBirth": "2004-02-21",
    "gender": "MALE",
    "role": "CAPTAIN"
  }
}
```

### Get current user

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "id": 1,
  "phoneNumber": "+201012345678",
  "fullName": "Ahmed Sultan",
  "email": "ahmed@example.com",
  "avatarUrl": null,
  "dateOfBirth": "2004-02-21",
  "gender": "MALE",
  "role": "CAPTAIN"
}
```

### Refresh tokens

```http
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```http
204 No Content
```

## 2. Complete captain onboarding

This endpoint is called after the captain completes the profile, vehicle,
vehicle-photo, and document screens.

```http
POST /auth/complete-profile
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "fullName": "Ahmed Sultan",
  "email": "ahmed@example.com",
  "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg",
  "dateOfBirth": "2004-02-21",
  "gender": "MALE",
  "vehicleType": "CAR",
  "vehicleBrand": "Hyundai",
  "vehicleModel": "Accent",
  "vehicleYear": "2022",
  "plateNumber": "م س أ 1234",
  "vehicleImages": {
    "frontImage": "file-vehicle-front-123",
    "sideImage": "file-vehicle-side-123",
    "rearImage": "file-vehicle-rear-123"
  },
  "documents": {
    "NATIONAL_ID_FRONT": "file-national-id-front-123",
    "NATIONAL_ID_BACK": "file-national-id-back-123",
    "DRIVING_LICENSE_FRONT": "file-license-front-123",
    "DRIVING_LICENSE_BACK": "file-license-back-123",
    "VEHICLE_REGISTRATION": "file-registration-123"
  }
}
```

For `BICYCLE`, vehicle-specific text fields can be omitted or sent as empty
strings according to backend validation rules. The app currently still sends
the three vehicle image fields for every vehicle type.

Response:


```json
{
  "id": 1,
  "phoneNumber": "+201012345678",
  "fullName": "Ahmed Sultan",
  "email": "ahmed@example.com",
  "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg",
  "dateOfBirth": "2004-02-21",
  "gender": "MALE",
  "role": "CAPTAIN"
}
```

## 3. File upload

The app uploads images before submitting the onboarding payload. The returned
`fileId` is then sent in `vehicleImages` or `documents`. The returned `url` is
used only by the app to display the uploaded image preview.

```http
POST /files/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Multipart fields:

| Field | Type | Required | Description |
|---|---|---:|---|
| `File` | file | Yes | Image selected from the gallery or captured with the camera |
| `Folder` | string | No | Storage folder |
| `Name` | string | No | Logical file name |
| `Embedding.Enabled` | boolean string | No | Set only when embedding processing is requested |

Example response:

```json
{
  "fileId": "file-123",
  "fileType": "image/jpeg",
  "url": "https://cdn.example.com/files/file-123.jpg",
  "originalName": "vehicle-front.jpg",
  "size": 245678
}
```

The backend must persist and return `fileId`. The mobile app sends this ID—not
the URL—in the onboarding payload so the backend can create relations between
the files table and vehicle/document records. The `url` should still be
directly usable by the mobile app's image component for previews.

## 4. Captain profile

### Get profile

```http
GET /captain/profile
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "id": "captain-profile-id",
  "user": {
    "id": "user-id",
    "fullName": "Ahmed Sultan",
    "phoneNumber": "+201012345678",
    "email": "ahmed@example.com"
  },
  "dateOfBirth": "2000-05-12",
  "nationality": "EG",
  "rating": 4.85,
  "totalTrips": 127,
  "verificationStatus": "UNDER_REVIEW",
  "availabilityStatus": "OFFLINE",
  "createdAt": "2026-10-01T10:00:00Z"
}
```

### Update profile

```http
PATCH /captain/profile
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "fullName": "Ahmed Sultan",
  "email": "ahmed@example.com",
  "dateOfBirth": "2000-05-12"
}
```

Response: same shape as `GET /captain/profile`.

The client must not be allowed to update backend-controlled fields such as
`rating`, `totalTrips`, `verificationStatus`, or `availabilityStatus`.

## 5. Captain verification

### Get verification status

```http
GET /captain/verification
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "status": "UNDER_REVIEW",
  "canGoOnline": false,
  "requiredDocuments": [
    {
      "type": "NATIONAL_ID",
      "status": "VERIFIED"
    },
    {
      "type": "DRIVING_LICENSE",
      "status": "UNDER_REVIEW"
    },
    {
      "type": "VEHICLE_REGISTRATION",
      "status": "MISSING"
    }
  ],
  "vehicle": {
    "status": "UNDER_REVIEW"
  },
  "rejectionReason": null
}
```

Allowed overall statuses:

```text
PENDING | UNDER_REVIEW | VERIFIED | REJECTED | SUSPENDED
```

The backend should calculate `canGoOnline` from captain verification, valid
required documents, vehicle verification, and suspension status.

## 6. Captain documents

### Get documents

```http
GET /captain/documents
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "documents": [
    {
      "id": "doc-1",
      "type": "NATIONAL_ID",
      "status": "VERIFIED",
      "expiresAt": null,
      "rejectionReason": null,
      "uploadedAt": "2026-10-01T12:00:00Z"
    },
    {
      "id": "doc-2",
      "type": "DRIVING_LICENSE",
      "status": "UNDER_REVIEW",
      "expiresAt": "2029-08-20",
      "rejectionReason": null,
      "uploadedAt": "2026-10-02T12:00:00Z"
    }
  ]
}
```

### Upload document

```http
POST /captain/documents
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Multipart fields:

| Field | Type | Required | Description |
|---|---|---:|---|
| `type` | string | Yes | Document type, for example `DRIVING_LICENSE` |
| `frontImage` | file | Depends on type | Front image |
| `backImage` | file | Depends on type | Back image |

Response:

```json
{
  "id": "document-id",
  "type": "DRIVING_LICENSE",
  "status": "PENDING"
}
```

### Replace rejected document

```http
POST /captain/documents/{documentId}/replace
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Use the same multipart fields as document upload. The replacement should move
the document from `REJECTED` to `PENDING`.

## 7. Captain vehicle

### Get vehicle

```http
GET /captain/vehicle
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "id": "vehicle-id",
  "type": "CAR",
  "make": "Hyundai",
  "model": "Accent",
  "year": 2022,
  "color": "White",
  "plateNumber": "م س أ 1234",
  "status": "UNDER_REVIEW"
}
```

### Create vehicle

```http
POST /captain/vehicle
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "type": "CAR",
  "make": "Hyundai",
  "model": "Accent",
  "year": 2022,
  "color": "White",
  "plateNumber": "م س أ 1234"
}
```

Response: same shape as `GET /captain/vehicle`.

### Update vehicle

```http
PATCH /captain/vehicle
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "color": "Black",
  "plateNumber": "م س أ 5678"
}
```

Response: same shape as `GET /captain/vehicle`.

Changing important vehicle information should return the vehicle to
`UNDER_REVIEW` when re-verification is required.

## 8. Captain availability

### Get availability

```http
GET /captain/availability
Authorization: Bearer <accessToken>
```

Response:

```json
{
  "status": "OFFLINE",
  "canGoOnline": true
}
```

Allowed availability statuses:

```text
OFFLINE | ONLINE
```

### Change availability

```http
PUT /captain/availability
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Request:

```json
{
  "status": "ONLINE"
}
```

or:

```json
{
  "status": "OFFLINE"
}
```

Response:

```json
{
  "status": "ONLINE",
  "canGoOnline": true
}
```

When `ONLINE` is requested, the backend must verify the captain, required
documents, vehicle status, and suspension status before accepting the change.

Example rejection:

```json
{
  "code": "CAPTAIN_NOT_VERIFIED",
  "message": "Captain verification is required before going online."
}
```

## 9. Required backend decisions

Before implementation, please confirm:

1. Whether documents should be uploaded through `/files/upload` first and then
   referenced by `fileId`, or uploaded directly through `/captain/documents`.
2. The exact document keys returned by the backend for each vehicle type.
3. Whether vehicle images belong inside `/auth/complete-profile` as
   `vehicleImages`, or should be submitted through a separate vehicle endpoint.
4. Whether the backend expects `vehicleBrand` or `make`.
5. Whether `vehicleYear` is accepted as a string during onboarding or must be
   converted to a number.
6. The production file-upload base URL and whether uploaded URLs are public or
   require authenticated image requests.
