# TASK-02: Frontend Project Setup (Router, Layout, Auth)

## Info
| Item | Value |
|------|-------|
| Phase | Phase 1 — Foundation |
| Priority | 🔴 Critical |
| Estimasi | 2-3 hari |
| Dependencies | — |

## Deskripsi
Setup project frontend React + TypeScript + Vite + TailwindCSS secara menyeluruh. Meliputi instalasi dependensi, konfigurasi folder structure, pembuatan layout components (AdminLayout, PublicLayout, ApplicantLayout), setup routing dengan role-based guards, dan konfigurasi API service layer menggunakan axios dengan interceptor untuk token management.

## Scope

### Frontend (UI)

#### 1. Instalasi Dependensi
```bash
# Core
npm install react-router-dom axios zustand

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# UI Components
npm install @headlessui/react @heroicons/react
npm install clsx tailwind-merge
npm install react-hot-toast

# Dev
npm install -D @types/react-router-dom
```

#### 2. Folder Structure
```
src/
├── assets/                  # Static assets (images, fonts)
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Alert.tsx
│   │   ├── Spinner.tsx
│   │   ├── Pagination.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── index.ts         # Barrel export
│   ├── forms/               # Reusable form components
│   │   ├── FormField.tsx
│   │   ├── FormSelect.tsx
│   │   ├── FormDatePicker.tsx
│   │   └── FormTextarea.tsx
│   └── shared/              # Shared composite components
│       ├── DataTable.tsx
│       ├── SearchFilter.tsx
│       ├── StatusBadge.tsx
│       └── EmptyState.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── usePagination.ts
│   ├── useModal.ts
│   └── useMediaQuery.ts
├── layouts/
│   ├── AdminLayout.tsx       # Sidebar + header + content area
│   ├── PublicLayout.tsx      # Navbar + footer
│   ├── ApplicantLayout.tsx   # Simplified sidebar for applicants
│   └── components/
│       ├── Sidebar.tsx
│       ├── AdminHeader.tsx
│       ├── PublicNavbar.tsx
│       ├── PublicFooter.tsx
│       ├── ApplicantSidebar.tsx
│       └── UserMenu.tsx
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ForgotPasswordPage.tsx
│   ├── admin/                # Admin pages (TASK-07+)
│   ├── applicant/            # Applicant dashboard pages
│   ├── public/               # Public pages (TASK-10)
│   └── errors/
│       ├── NotFoundPage.tsx
│       ├── ForbiddenPage.tsx
│       └── ServerErrorPage.tsx
├── routes/
│   ├── index.tsx             # Main route configuration
│   ├── AdminRoutes.tsx       # Admin route group
│   ├── ApplicantRoutes.tsx   # Applicant route group
│   ├── PublicRoutes.tsx      # Public route group
│   └── guards/
│       ├── ProtectedRoute.tsx
│       ├── RoleGuard.tsx
│       └── GuestRoute.tsx
├── services/
│   ├── api.ts                # Axios instance + interceptors
│   ├── auth.service.ts       # Auth API calls
│   └── index.ts
├── stores/
│   ├── authStore.ts          # Zustand auth store
│   ├── uiStore.ts            # Sidebar state, theme, etc.
│   └── index.ts
├── types/
│   ├── auth.types.ts
│   ├── api.types.ts          # API response wrapper types
│   ├── common.types.ts       # Shared types
│   └── index.ts
├── utils/
│   ├── cn.ts                 # clsx + tailwind-merge helper
│   ├── format.ts             # Date, currency formatters
│   ├── constants.ts          # App-wide constants
│   └── validators.ts         # Common zod schemas
├── App.tsx
├── main.tsx
└── index.css                 # Tailwind directives
```

#### 3. Layout Components

**AdminLayout** (`layouts/AdminLayout.tsx`)
- Collapsible sidebar di kiri (240px expanded, 64px collapsed)
- Header bar di atas dengan: breadcrumb, notification bell, user menu dropdown
- Main content area dengan padding
- Sidebar navigation items:
  - Dashboard
  - Konfigurasi PPDB (submenu: Periode, Gelombang, Jenjang, Kategori, Flow Seleksi, Konfigurasi Gelombang)
  - Pendaftar (submenu: Daftar Pendaftar, Verifikasi Dokumen)
  - Seleksi (submenu: Jadwal Tes, Input Nilai, Kelulusan)
  - Keuangan (submenu: Pembayaran, Tagihan, Diskon)
  - MOU
  - Daftar Ulang
  - MPLS
  - Laporan
  - Pengaturan (submenu: Users, Roles, Template Notifikasi)
- Responsive: pada mobile, sidebar menjadi drawer overlay
- State sidebar (collapsed/expanded) disimpan di `uiStore`

**PublicLayout** (`layouts/PublicLayout.tsx`)
- Top navbar dengan: logo sekolah, nama sekolah, menu items (Home, Info PPDB, Jadwal, Kontak), tombol Login/Daftar
- Footer dengan: info sekolah, alamat, kontak, social media, copyright
- Full-width content area
- Responsive navbar → hamburger menu di mobile

**ApplicantLayout** (`layouts/ApplicantLayout.tsx`)
- Simplified sidebar atau top tabs:
  - Dashboard
  - Data Pendaftaran
  - Dokumen
  - Pembayaran
  - Jadwal Tes
  - Hasil Seleksi
  - MOU
  - Daftar Ulang
  - MPLS
- Header dengan: welcome message, notification bell, user menu
- Progress indicator menunjukkan step saat ini

#### 4. Route Configuration

```typescript
// routes/index.tsx
const routes = [
  // Public routes (no auth required)
  { path: '/', element: <PublicLayout />, children: [
    { index: true, element: <LandingPage /> },
    { path: 'info', element: <InfoPage /> },
    { path: 'register', element: <RegistrationPage /> },
  ]},

  // Auth routes (guest only)
  { path: '/auth', element: <GuestRoute />, children: [
    { path: 'login', element: <LoginPage /> },
    { path: 'register', element: <RegisterPage /> },
  ]},

  // Admin routes (superadmin, admin_ppdb, admin_keuangan)
  { path: '/admin', element: <ProtectedRoute><RoleGuard roles={['superadmin','admin_ppdb','admin_keuangan']}><AdminLayout /></RoleGuard></ProtectedRoute>, children: [
    { index: true, element: <AdminDashboard /> },
    { path: 'periods', element: <RoleGuard roles={['superadmin']}><PeriodListPage /></RoleGuard> },
    { path: 'waves', element: <RoleGuard roles={['superadmin']}><WaveListPage /></RoleGuard> },
    // ... more admin routes
  ]},

  // Applicant routes
  { path: '/applicant', element: <ProtectedRoute><RoleGuard roles={['applicant']}><ApplicantLayout /></RoleGuard></ProtectedRoute>, children: [
    { index: true, element: <ApplicantDashboard /> },
    { path: 'profile', element: <ApplicantProfilePage /> },
    // ... more applicant routes
  ]},

  // Error pages
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
];
```

#### 5. API Service Layer

**Axios Instance** (`services/api.ts`)
```typescript
// Fitur:
// - Base URL dari environment variable (VITE_API_URL)
// - Request interceptor: inject Authorization header dari authStore
// - Response interceptor: handle 401 → attempt token refresh → retry original request
// - Response interceptor: handle 403 → redirect ke /403
// - Response interceptor: handle 500 → show toast error
// - Queue mechanism untuk concurrent 401 requests saat refresh sedang berjalan
```

**API Response Types** (`types/api.types.ts`)
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

#### 6. UI Component Library (Base)

**Button** — variants: `primary`, `secondary`, `danger`, `ghost`, `outline`; sizes: `sm`, `md`, `lg`; loading state
**Input** — label, error message, helper text, prefix/suffix icons
**Select** — native select with styling, error message
**Modal** — overlay, header, body, footer, close button, sizes: `sm`, `md`, `lg`, `xl`
**Table** — sortable headers, loading skeleton, empty state
**Card** — header, body, footer sections
**Badge** — color variants for status display
**Alert** — info, success, warning, error variants
**Spinner** — loading indicator
**Pagination** — page numbers, prev/next, page size selector

## Acceptance Criteria
- [ ] Semua dependensi terinstall dan `npm run dev` berjalan tanpa error
- [ ] Folder structure sesuai spesifikasi di atas
- [ ] AdminLayout render dengan sidebar navigasi yang bisa di-collapse
- [ ] PublicLayout render dengan navbar dan footer
- [ ] ApplicantLayout render dengan sidebar/tabs
- [ ] Route configuration berjalan — navigasi antar halaman bekerja
- [ ] ProtectedRoute redirect ke `/auth/login` jika belum login
- [ ] GuestRoute redirect ke dashboard jika sudah login
- [ ] RoleGuard redirect ke `/403` jika role tidak sesuai
- [ ] Axios instance terkonfigurasi dengan interceptors (token injection, 401 refresh, error handling)
- [ ] Minimal 5 base UI components (Button, Input, Modal, Table, Card) sudah dibuat
- [ ] Semua layout responsive (mobile, tablet, desktop)
- [ ] TailwindCSS custom theme terkonfigurasi (colors, fonts sesuai branding sekolah)
- [ ] Dark mode support (optional, menggunakan Tailwind `dark:` classes)
- [ ] Error pages (404, 403, 500) sudah dibuat
- [ ] TypeScript strict mode — tidak ada `any` type

## Technical Notes
- Gunakan `createBrowserRouter` dari react-router-dom v6 untuk definisi routes
- Zustand store menggunakan `persist` middleware untuk auth state (simpan ke localStorage)
- `cn()` utility menggunakan `clsx` + `twMerge` untuk conditional class merging
- Axios interceptor harus handle race condition saat multiple requests mendapat 401 bersamaan — gunakan queue pattern
- Layout components menggunakan `<Outlet />` dari react-router untuk render child routes
- Sidebar navigation items didefinisikan sebagai array config agar mudah di-maintain
- Gunakan `React.lazy()` + `Suspense` untuk code splitting per route group (admin, applicant, public)
- Environment variables: `VITE_API_URL`, `VITE_APP_NAME`, `VITE_APP_VERSION`
- Tailwind config: extend colors dengan warna brand sekolah (primary, secondary)
- Semua icon menggunakan `@heroicons/react` (outline variant untuk sidebar, solid untuk badge/alert)
