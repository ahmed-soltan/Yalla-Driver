1. Captain Profile

Your CaptainProfile is the captain-specific data associated with Users.

Get profile
GET /captain/profile
Authorization: Bearer <accessToken>

Response:

{
  "id": "captain-profile-id",
  "user": {
    "id": "user-id",
    "fullName": "Ahmed Sultan",
    "phoneNumber": "+201012345678",
    "email": null
  },
  "dateOfBirth": "2000-05-12",
  "nationality": "EG",
  "rating": 4.85,
  "totalTrips": 127,
  "verificationStatus": "VERIFIED",
  "availabilityStatus": "OFFLINE",
  "createdAt": "2026-10-01T10:00:00Z"
}
Update profile
PATCH /captain/profile
Authorization: Bearer <accessToken>
{
  "fullName": "Ahmed Sultan",
  "email": "ahmed@example.com",
  "dateOfBirth": "2000-05-12"
}

I would not allow things such as:

{
  "rating": 5,
  "verificationStatus": "VERIFIED",
  "totalTrips": 999
}

Those are backend-controlled.

2. Captain Verification

This is one of the most important endpoints for your captain home screen.

Get verification status
GET /captain/verification
Authorization: Bearer <accessToken>

Response:

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
    "status": "VERIFIED"
  },
  "rejectionReason": null
}

Possible overall statuses:

PENDING
UNDER_REVIEW
VERIFIED
REJECTED
SUSPENDED
Important

I wouldn't store a manually-maintained VerificationStatus everywhere.

You can have the captain's overall status, but the backend should determine canGoOnline based on requirements.

For example:

Captain verified
        +
Required documents valid
        +
Vehicle verified
        +
No suspension
        ↓
   canGoOnline = true

That prevents bugs like:

verificationStatus = VERIFIED
vehicle = not verified
canGoOnline = true   ❌
3. Captain Documents

Your existing table:

CaptainDocuments

should support the document lifecycle.

Get documents
GET /captain/documents
Authorization: Bearer <accessToken>

Response:

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
Upload document

For MVP, you can simply do:

POST /captain/documents
Content-Type: multipart/form-data
Authorization: Bearer <accessToken>

Fields:

type=DRIVING_LICENSE
frontImage=<file>
backImage=<file>

Response:

{
  "id": "document-id",
  "type": "DRIVING_LICENSE",
  "status": "PENDING"
}

Later, I strongly recommend moving large image uploads to object storage using presigned upload URLs rather than sending them through your ASP.NET API.

Replace rejected document
POST /captain/documents/{documentId}/replace

This is better than allowing arbitrary PATCH operations on a document.

Example:

DRIVING_LICENSE
     ↓
REJECTED
     ↓
Captain uploads replacement
     ↓
PENDING
     ↓
Admin reviews
     ↓
VERIFIED
4. Captain Vehicle

You decided earlier that for the MVP:

CaptainProfile 1 ─── 1 CaptainVehicle

So keep the API simple.

Get vehicle
GET /captain/vehicle
Authorization: Bearer <accessToken>

Response:

{
  "id": "vehicle-id",
  "type": "CAR",
  "make": "Hyundai",
  "model": "Accent",
  "year": 2022,
  "color": "White",
  "plateNumber": "م س أ 1234",
  "status": "VERIFIED"
}
Create vehicle
POST /captain/vehicle
Authorization: Bearer <accessToken>
{
  "type": "CAR",
  "make": "Hyundai",
  "model": "Accent",
  "year": 2022,
  "color": "White",
  "plateNumber": "م س أ 1234"
}
Update vehicle
PATCH /captain/vehicle
Authorization: Bearer <accessToken>
{
  "color": "Black",
  "plateNumber": "م س أ 5678"
}

If changing important information such as vehicle type or registration information, you can automatically put the vehicle back into:

UNDER_REVIEW

because it may require re-verification.

5. Vehicle Documents

This is where things become important.

For example:

Car
NATIONAL_ID
DRIVING_LICENSE
VEHICLE_REGISTRATION
Motorcycle
NATIONAL_ID
DRIVING_LICENSE
VEHICLE_REGISTRATION
Scooter

Depending on your Egyptian legal/business requirements, you need to define exactly what documentation you require before launching. Don't hard-code the assumption that every scooter has the same document requirements as a car.

The backend can determine required documents based on:

CaptainVehicle.type

For example:

{
  "vehicleType": "CAR",
  "requiredDocuments": [
    "DRIVING_LICENSE",
    "VEHICLE_REGISTRATION"
  ]
}

This is better than the mobile app deciding which documents are required.

6. Captain Availability

This is the endpoint the captain app will use when the captain presses:

ابدأ استقبال الرحلات

Get current availability
GET /captain/availability
Authorization: Bearer <accessToken>

Response:

{
  "status": "OFFLINE",
  "canGoOnline": true
}

Possible values:

OFFLINE
ONLINE

I would not use BUSY here.

Busy should be derived from the active service:

ONLINE
   +
ACTIVE_RIDE
   ↓
Captain is operationally busy
Go online / offline
PUT /captain/availability
Authorization: Bearer <accessToken>
{
  "status": "ONLINE"
}

or:

{
  "status": "OFFLINE"
}

Backend validation:

ONLINE requested
      ↓
Is captain verified?
      ↓
Are required documents valid?
      ↓
Is vehicle verified?
      ↓
Is captain suspended?
      ↓
YES → ONLINE
NO  → reject

Example error:

{
  "code": "CAPTAIN_NOT_VERIFIED",
  "message": "لا يمكنك استقبال الرحلات قبل اكتمال التحقق من حسابك"
}
7. Captain Location

This is slightly different because location is high-frequency transient data.

Don't constantly save captain GPS coordinates to PostgreSQL.

Use:

Captain App
    ↓
Location updates
    ↓
Redis
    ↓
Assignment system
Update location

Initially you can have:

POST /captain/location
Authorization: Bearer <accessToken>
{
  "latitude": 30.558,
  "longitude": 31.010,
  "heading": 180,
  "speed": 32,
  "accuracy": 8
}

But for your final architecture, I'd eventually move this to SignalR when the captain is online:

Captain
   │
   │ SignalR
   ↓
Backend
   ↓
Redis

REST can remain useful as a fallback/initial implementation.

8. Captain Dashboard

The captain home screen will probably need some summary data.

Instead of making 6 requests:

GET profile
GET verification
GET vehicle
GET availability
GET stats
GET active ride

I'd create:

GET /captain/dashboard
Authorization: Bearer <accessToken>

Response:

{
  "captain": {
    "name": "Ahmed Sultan",
    "rating": 4.85,
    "totalTrips": 127
  },
  "verification": {
    "status": "VERIFIED",
    "canGoOnline": true
  },
  "availability": {
    "status": "OFFLINE"
  },
  "vehicle": {
    "type": "CAR",
    "make": "Hyundai",
    "model": "Accent",
    "status": "VERIFIED"
  },
  "today": {
    "trips": 8,
    "earnings": 640
  },
  "activeService": null
}

This is especially useful for the initial captain home screen.

9. Captain Status / Readiness

I'd actually add one more endpoint because it will make your mobile logic much cleaner:

GET /captain/readiness
Authorization: Bearer <accessToken>

Response:

{
  "canGoOnline": false,
  "status": "INCOMPLETE",
  "requirements": [
    {
      "key": "PROFILE",
      "completed": true
    },
    {
      "key": "NATIONAL_ID",
      "completed": true
    },
    {
      "key": "DRIVING_LICENSE",
      "completed": true
    },
    {
      "key": "VEHICLE",
      "completed": true
    },
    {
      "key": "VEHICLE_REGISTRATION",
      "completed": false
    }
  ]
}

Then your captain app can easily show:

حسابك غير مكتمل

✓ البيانات الشخصية
✓ البطاقة الشخصية
✓ رخصة القيادة
✓ بيانات المركبة
⚠️ رخصة المركبة

[استكمال البيانات]

This is much better than having the React Native app implement its own complicated verification rules.

10. Ratings

Don't let the captain edit this.

GET /captain/rating
Authorization: Bearer <accessToken>

Response:

{
  "average": 4.85,
  "totalRatings": 120,
  "distribution": {
    "5": 105,
    "4": 10,
    "3": 3,
    "2": 1,
    "1": 1
  }
}

You can postpone this until the ride system exists.

Recommended Captain API

So your Captain API can eventually look like this:

AUTH
────────────────────────────────
POST   /auth/login/request-otp
POST   /auth/login/verify-otp
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me


ONBOARDING
────────────────────────────────
POST   /auth/complete-profile
...your existing onboarding endpoints


PROFILE
────────────────────────────────
GET    /captain/profile
PATCH  /captain/profile


VERIFICATION
────────────────────────────────
GET    /captain/verification
GET    /captain/readiness


DOCUMENTS
────────────────────────────────
GET    /captain/documents
POST   /captain/documents
POST   /captain/documents/{id}/replace


VEHICLE
────────────────────────────────
GET    /captain/vehicle
POST   /captain/vehicle
PATCH  /captain/vehicle


AVAILABILITY
────────────────────────────────
GET    /captain/availability
PUT    /captain/availability


LOCATION
────────────────────────────────
POST   /captain/location
# later → SignalR


DASHBOARD
────────────────────────────────
GET    /captain/dashboard


RATING
────────────────────────────────
GET    /captain/rating
But don't build all of these right now

For your current stage, I'd implement them in this order:

Phase 1 — Captain account setup
GET    /captain/profile
PATCH  /captain/profile

GET    /captain/documents
POST   /captain/documents
POST   /captain/documents/{id}/replace

GET    /captain/vehicle
POST   /captain/vehicle
PATCH  /captain/vehicle

GET    /captain/verification
GET    /captain/readiness
Phase 2 — Captain becomes operational
GET    /captain/availability
PUT    /captain/availability
POST   /captain/location
Phase 3 — Actual work
GET    /captain/dashboard
GET    /captain/rating

GET    /captain/services/offers
POST   /captain/services/{id}/accept
POST   /captain/services/{id}/reject

And then the ride/delivery endpoints become their own domain rather than dumping everything under /captain.

One architectural point I'd strongly keep: verification, readiness, and availability should be different concepts. A captain can be VERIFIED but OFFLINE; and a captain can have a verified profile but still not be READY because a vehicle/document is missing. That separation will make your captain app and backend state machine much cleaner.