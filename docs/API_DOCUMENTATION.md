# TruthGuard — API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## Health

### GET /health
Check API status.

**Response 200:**
```json
{ "status": "ok", "service": "TruthGuard API", "version": "1.0.0" }
```

---

## Authentication

### POST /auth/register
Create a new user account.

**Request:**
```json
{ "email": "user@example.com", "password": "secret123", "full_name": "John Doe" }
```

**Response 201:**
```json
{ "token": "eyJ...", "user": { "id": "uuid", "email": "user@example.com", "role": "user" } }
```

**Errors:** 400 (missing fields), 409 (user exists)

---

### POST /auth/login
Authenticate and receive a JWT token.

**Request:**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Response 200:**
```json
{ "token": "eyJ...", "user": { "id": "uuid", "email": "user@example.com", "role": "user" } }
```

**Errors:** 401 (invalid credentials)

---

### GET /auth/profile
Get the current user's profile. **[Auth]**

**Response 200:**
```json
{ "user": { "id": "uuid", "email": "...", "full_name": "...", "role": "user", "created_at": "..." } }
```

---

## Predictions

### POST /predict/detect
Run fake news detection on article text. **[Auth]**

**Request:**
```json
{ "text": "The full news article text...", "source": "manual" }
```

**Response 200:**
```json
{
  "prediction_id": "uuid",
  "label": "Fake",
  "confidence": 0.8734,
  "prob_fake": 0.8734,
  "prob_real": 0.1266,
  "suspicious_words": ["shocking", "conspiracy", "leaked"],
  "explanation": "High sensational language detected..."
}
```

**Errors:** 400 (text too short)

---

### GET /predict/history
Get the current user's prediction history. **[Auth]**

**Query params:**
- `q` — search text (optional)
- `label` — filter by `Fake` or `Real` (optional)

**Response 200:**
```json
{
  "predictions": [
    { "id": "uuid", "input_text": "...", "label": "Fake", "confidence": 0.87, "created_at": "..." }
  ]
}
```

---

### DELETE /predict/{prediction_id}
Delete a prediction. **[Auth]**

**Response 200:**
```json
{ "deleted": "uuid" }
```

---

## Admin

### GET /admin/stats
Get platform-wide statistics. **[Admin]**

**Response 200:**
```json
{ "total_users": 42, "total_predictions": 156, "fake": 89, "real": 67 }
```

---

### GET /admin/users
List all users. **[Admin]**

**Response 200:**
```json
{ "users": [ { "id": "uuid", "email": "...", "full_name": "...", "role": "user", "created_at": "..." } ] }
```

---

### PUT /admin/users/{user_id}/role
Change a user's role. **[Admin]**

**Request:**
```json
{ "role": "admin" }
```

**Response 200:**
```json
{ "updated": "uuid", "role": "admin" }
```

---

### GET /admin/logs
Get admin action audit logs. **[Admin]**

**Response 200:**
```json
{ "logs": [ { "id": "uuid", "admin_id": "uuid", "action": "export", "detail": "...", "created_at": "..." } ] }
```

---

### GET /admin/export
Export all predictions as CSV. **[Admin]**

**Response 200:** `text/csv` file download.

---

## Error Format
All errors return:
```json
{ "error": "Error message describing what went wrong" }
```

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (admin only) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |
