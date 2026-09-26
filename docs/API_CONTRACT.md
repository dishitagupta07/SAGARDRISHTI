# SAGARDRISHTI API Contract

Base URL:

${import.meta.env.VITE_BACKEND_URL}

---

## 1. Health Check

### GET /

Checks whether the backend is running.

### Response

```json
{
  "message": "SAGARDRISHTI backend is running"
}