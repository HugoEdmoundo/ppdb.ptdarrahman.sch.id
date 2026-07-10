# TASK-03: Auth Integration (Login, Register, Token)

## Info
| Item | Value |
|------|-------|
| Phase | Phase 1 |
| Priority | 🔴 Critical |
| Estimasi | 2-3 hari |
| Dependencies | TASK-01 |

## Deskripsi
Implementasi fitur autentikasi khusus untuk sistem PPDB.

## Scope
### Backend (API)
- POST /auth/applicant/register
- POST /auth/applicant/login
- Token refresh mechanism

### Frontend (UI)
- Login page & register page khusus applicant
- Auth store dengan Zustand
- Protected route component

### Database
- users, refresh_tokens, applicants
