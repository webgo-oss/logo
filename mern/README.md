# Unstoppable Logo Showcase (MERN)

- **MongoDB** stores the 13 logos (section, sub-type, tone, download counter)
- **Express** serves the API, the preview images and the download route
- **React (Vite)** renders the showcase page

## Requirements
Node 18+ and a running MongoDB (local, or a MongoDB Atlas connection string).

## Logins (admin + users)
The logo page is private. Nobody can see the logos or download files without signing in.

- **Admin** signs in at `/admin/login` with the email + password from `server/.env`
  (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). The account is created automatically when the server starts.
  **Change the sample password before sharing the site.** If you change it later, restart the server.
- In the **Admin panel** (`/admin`) the admin adds a user by email. The system generates an
  access code like `7KQ2M-X9PDA`, shown **once** so the admin can copy it and send it to the user.
- **Users** sign in at `/login` with their email + that access code.
- Only the admin can add users. The admin can also create a **new code** (the old one stops working
  and the user is signed out), **disable / enable** a user, or **delete** a user.
- Codes and passwords are stored only as hashes. If an admin loses a code, just create a new one.
- Wrong guesses are rate-limited (5 tries per 15 minutes per email).

## Setup
```bash
npm run install-all          # installs root, server and client dependencies
# edit server/.env: MongoDB address, ADMIN_EMAIL / ADMIN_PASSWORD and SESSION_SECRET
npm run seed                 # loads the 13 logos into MongoDB
npm run dev                  # API on :5000, React on http://localhost:5173
```

## Production
```bash
npm run build                # builds the React app into client/dist
npm start                    # Express serves API + built site on http://localhost:5000
```

## API
All `/api/logos` routes and the preview images need a signed-in session (cookie). Auth and admin routes:

| Method | Route | Who |
|--------|-------|-----|
| POST | /api/auth/login `{email, code}` | users |
| POST | /api/auth/admin/login `{email, password}` | admin |
| POST | /api/auth/logout, GET /api/auth/me | signed-in |
| GET / POST | /api/admin/users | admin only |
| POST | /api/admin/users/:id/code | admin only (new code) |
| PATCH / DELETE | /api/admin/users/:id | admin only (enable-disable / delete) |

Logo routes:

| Method | Route                      | What it does                                    |
|--------|----------------------------|-------------------------------------------------|
| GET    | /api/logos                 | All logos (`?group=` and `?subtype=` filters)   |
| GET    | /api/logos/sections        | Logos grouped as the page needs them            |
| GET    | /api/logos/:code/preview   | The preview image shown on the page             |
| GET    | /api/logos/:code/download?format=png\|jpg\|tiff | Downloads that format (default png), counts it |

## How the logos are grouped
- **primary**: green, "Beyond the Blueprint" (04, 05, 06)
- **secondary**: white, "Beyond the Blueprint" (01, 02, 03)
- **complementary / primary**: green, "Real Estate Growth Partner" (11, 12, 13)
- **complementary / secondary**: white, "Real Estate Growth Partner" (07, 08, 09)
- **brand**: the gold monogram (10)

## Where the images live
- Preview images (shown on the page): `server/public/logos/preview/` (served to signed-in people at `/assets/logos/preview/logo-XX.png`)
- Full-size PNG originals: `server/public/logos/original/`
- JPG versions: `server/public/jpg/` (named `Unstoppable Logos-XX.jpg`)
- TIFF versions: `server/public/tiff/` (named `Unstoppable Logos-XX.tiff`)
