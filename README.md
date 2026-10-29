# Akatsuki's Draft – AI-Enabled Content Sharing Platform (Backend)
Nodevember 4.0 · Node.js, Express, MongoDB (Mongoose), JWT, Google Gemini

## Setup
```bash
npm install
cp .env.example .env     # fill MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed:admin       # optional: creates an admin from SEED_ADMIN_* vars
npm start                # or: npm run dev
```

## Schemas
- **User**: `{ name, email, password (hashed), role: "admin" | "user" }`
- **Post**: `{ title, description, content, image, category, createdBy (ref User), status: "draft" | "pending" | "approved" | "rejected", createdAt }`

## Endpoints
Send `Authorization: Bearer <token>` on protected routes.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Register (`name,email,password`). Admin only with `role:"admin"` + correct `adminSecret` |
| POST | /auth/login | public | Login, returns JWT |
| GET | /auth/me | user | Current user |
| POST | /posts | user | Create post. `status`: `"draft"` (default) or `"pending"` (submit for approval) |
| GET | /posts | public | All approved posts (`?category=&search=&page=&limit=`) |
| GET | /posts/my-posts | user | Own posts & drafts (`?status=`) |
| GET | /posts/:id | public | Approved post by ID |
| PATCH | /posts/:id | owner | Update own post (`status` may be set to draft/pending; editing an approved post sends it back to pending) |
| DELETE | /posts/:id | owner | Delete own post |
| GET | /admin/posts/pending | admin | Pending posts |
| PATCH | /admin/posts/approve/:id | admin | Approve a pending post |
| PATCH | /admin/posts/reject/:id | admin | Reject a pending post |
| POST | /ai/improve/:postId | owner | Improve with Gemini, saved as a **new draft** (new ID); original untouched |

### AI improve
`POST /ai/improve/:postId` accepts JSON, or `multipart/form-data` with an optional
`file` (PDF/TXT/MD/HTML/CSV, ≤15MB) sent to Gemini as reference material
(per the Gemini document-processing docs) and an optional `instructions` text field.

## Quick test (curl)
```bash
curl -X POST localhost:3000/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Itachi","email":"itachi@akatsuki.com","password":"secret123"}'

curl -X POST localhost:3000/posts -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Hello","content":"my frist post","status":"pending"}'

curl -X POST localhost:3000/ai/improve/$POST_ID -H "Authorization: Bearer $TOKEN" \
  -F 'instructions=Make it friendly' -F 'file=@notes.pdf'
```
