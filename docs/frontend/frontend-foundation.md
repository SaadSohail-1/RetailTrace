# RetailTrace Frontend Foundation

## 1. Overview

The frontend foundation provides the shared application structure and design system for the RetailTrace business console.

**Stack**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (`lucide-react`) for icons
- Fetch API for backend communication

The foundation includes application routing, shared navigation, API client setup, environment configuration, and the initial Business Dashboard.

## 2. Project Structure

```text
frontend/
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   └── AppLayout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── SchemasPage.tsx
│   │   └── RecordsPage.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── package.json
└── vite.config.ts
```

Add new shared components under `src/components/`. Keep page-specific UI and logic in the appropriate page files. Additional folders can be introduced when a feature genuinely needs them.

## 3. Design System

All pages should follow the RetailTrace color palette.

| Color | Hex | Suggested usage |
|---|---|---|
| Soft Sand | `#D9D28B` | Highlights, subtle backgrounds |
| Sage | `#B2BD7E` | Secondary accents and selected states |
| Olive | `#8E9162` | Muted emphasis, borders and metadata |
| Forest Sage | `#6A795D` | Primary buttons, active navigation |
| Warm Background | `#F6F5EB` | Application background |
| Main Text | `#263326` | Headings and body text |
| Muted Text | `#68735C` | Descriptions and secondary text |
| White | `#FFFFFF` | Cards and navigation surfaces |

### Styling conventions

- Use Tailwind utility classes.
- Use rounded cards, subtle borders, and restrained shadows.
- Maintain consistent spacing, typography, and icon sizing.
- Design responsively for desktop, tablet, and mobile.
- Use the existing palette rather than introducing unrelated colors.
- Reuse shared components when multiple pages need the same UI.

Example:

```tsx
<button className="rounded-xl bg-[#6A795D] px-4 py-2.5
  font-semibold text-white transition hover:bg-[#56634B]">
  Save changes
</button>
```

## 4. Shared Application Layout

`src/components/AppLayout.tsx` provides the common application shell.

It includes:
- RetailTrace branding
- Responsive navigation
- Dashboard, Schemas, and Records & Verification links
- Notification icon placeholder
- Main content area using React Router's `Outlet`
- Shared footer

All authenticated business pages should render inside this layout.

Do not recreate the global navbar, page background, or footer in individual pages. Page components should focus on their own content.

The notification button is currently a visual placeholder; do not assume a notification system exists.

## 5. Routes

| Route | Page | Issue |
|---|---|---|
| `/login` | Business Login | #41 |
| `/` | Business Dashboard | Foundation |
| `/schemas` | Schema Management | #43 |
| `/records` | Records & Verification | #44 |
| Schema builder route | Schema Builder | #42 |

The schema builder route should be agreed upon with the team before implementation. Update `App.tsx` when adding it.

Use React Router's `Link` or `NavLink` for internal navigation rather than ordinary anchor tags.

## 6. Business Dashboard

`src/pages/DashboardPage.tsx` provides the initial business console landing page.

It contains:
- Overview heading and introductory text
- Summary cards for schemas, records, verification, and blockchain status
- Recent activity / onboarding guidance
- Quick actions for schema management and records
- Responsive layout using the shared palette

**Data status:** Statistics and activity are placeholders until connected to real backend endpoints. Do not present placeholder values as actual business or blockchain data.

The dashboard is part of the frontend foundation and does not require a separate issue.

## 7. Backend API Client

Use `src/api/client.ts` as the shared entry point for HTTP requests.

Example:

```tsx
import { apiRequest } from "../api/client";

const schemas = await apiRequest<Schema[]>("/schemas");
```

Before implementing requests:

1. Check `docs/api-contract.md` for the actual endpoint, method, request body, and response shape.
2. Use the shared client rather than duplicating `fetch` configuration.
3. Handle loading, success, empty, and error states.
4. Define TypeScript types for the data used by the page.
5. Do not invent endpoints or assume response fields.

The API base URL is configured through `VITE_API_BASE_URL`.

## 8. Environment Configuration

Use `.env.example` as the committed template:

```dotenv
VITE_API_BASE_URL=http://localhost:5000/api
```

Create a local `.env.local` file for machine-specific settings.

- Commit `.env.example`.
- Do not commit `.env.local` or secrets.
- Restart the Vite development server after changing environment variables.
- Configure backend CORS for the frontend development origin when making API requests.

Vite exposes variables prefixed with `VITE_` to browser code. Never put database credentials, MultiChain RPC credentials, or other server secrets in frontend environment variables.

## 9. Team Responsibilities

### Issue #40 — Frontend Foundation

Completed foundation scope:
- React + TypeScript + Vite setup
- Tailwind configuration
- React Router setup
- Shared API client and environment template
- Responsive `AppLayout`
- Initial Business Dashboard

### Issue #41 — Business Authentication UI

Implement:
- Login and registration screens as supported by the backend contract
- Form validation and loading/error states
- Integration with authentication endpoints
- Appropriate navigation after authentication

Coordinate token/session handling with the backend contract. Do not assume a particular authentication response format.

### Issue #42 — Schema Builder UI

Implement:
- UI for defining schema fields
- Supported field types and validation options
- Add/remove field interactions
- Schema creation form
- Integration with the documented schema API

Coordinate with the Schema Management page owner to avoid duplicated components or conflicting routes.

### Issue #43 — Schema Management UI

Implement:
- Schema listing
- Schema details and relevant metadata
- Create/edit actions where supported
- Empty, loading, and error states
- Integration with schema endpoints

Reuse the shared design system and coordinate the schema builder route with issue #42.

### Issue #44 — Record & Verification UI

Implement:
- Record creation using an existing schema
- Record listing and relevant details
- Record verification interface
- Clear verification outcomes based on actual API responses
- Loading, empty, and error states

Follow the API contract for publishing and verifying records. Do not claim a record is verified without a corresponding backend result.

## 10. Development Workflow

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Build and type-check through the project's configured build script:

```bash
npm run build
```

Before opening a PR:

1. Pull the latest `main`.
2. Create a feature branch for your assigned issue.
3. Implement only the scope of your issue.
4. Test the affected routes and responsive behavior.
5. Run the production build.
6. Commit and push your changes.
7. Open a PR against `main`, referencing the relevant issue.

Example:

```bash
git switch main
git pull origin main
git switch -c feat/schema-management
```

If `main` has already been updated, resolve any conflicts in your feature branch before requesting review.

## 11. Team Conventions

- Keep shared navigation and global layout in `AppLayout.tsx`.
- Keep route definitions in `App.tsx`.
- Use the shared API client for backend calls.
- Use the agreed palette and Tailwind CSS.
- Avoid adding another CSS framework or component library without team agreement.
- Avoid unnecessary dependencies and duplicated components.
- Never commit `.env.local`, credentials, or private keys.
- Do not fabricate API responses, record data, verification results, or blockchain status.
- Coordinate changes to shared files, especially `App.tsx`, `AppLayout.tsx`, and `api/client.ts`.
- Run `npm run build` before submitting a PR.

## 12. Definition of Done

A frontend issue is ready for review when:
- Its required UI is implemented.
- It follows the shared RetailTrace design system.
- It works at the agreed route.
- It integrates with the documented API where applicable.
- Loading, empty, and error states are handled where needed.
- No unrelated changes or secrets are included.
- The production build passes.
- The PR references the corresponding GitHub issue.