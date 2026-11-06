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
- In the **Admin panel** (`/admin`) the admin adds a user by typing their email and **choosing an access
  code** (6+ characters, any characters, case-sensitive). Nothing is generated automatically.
- **Users** sign in at `/login` with their email + that access code.
- Only the admin can add users. The admin can also **set a new code** for a user (the old one stops
  working and the user is signed out), **disable / enable** a user, or **delete** a user.
- Codes and passwords are stored only as hashes, so an old code can't be looked up later. If a code is
  forgotten, the admin sets a new one.
- Wrong guesses are rate-limited (5 tries per 15 minutes per email).

## Setup
```bash
npm run install-all          # installs root, server and client dependencies
# edit server/.env: MongoDB address, ADMIN_EMAIL / ADMIN_PASSWORD and SESSION_SECRET
npm run seed                 # loads the 13 logos into MongoDB
npm run dev                  # API on :5000, React on http://localhost:5173
```

## Deploy on Render
Render runs the whole thing as **one web service** (Express serves the API and the built React site).
Render has no MongoDB, so the database is a free **MongoDB Atlas** cluster.

**1. Database (MongoDB Atlas)**
1. Create a free cluster at mongodb.com/atlas.
2. *Database Access* → add a database user (username + password).
3. *Network Access* → add IP address `0.0.0.0/0` (Render's addresses change).
4. *Connect → Drivers* → copy the connection string and put the database name before the `?`, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/unstoppable_logos?retryWrites=true&w=majority`
   (if the password has special characters like `@` or `#`, URL-encode them).

**2. Put the code on GitHub**
Push this project's folder (the one containing `render.yaml`). `.env` and `node_modules` are ignored by
`.gitignore`, so your local secrets are not uploaded.

**3. Render**
1. Render dashboard → **New → Blueprint** → pick the repo. Render reads `render.yaml`.
   (Or **New → Web Service** and set: Build Command `npm run render-build`, Start Command `npm start`.)
2. Fill in the environment variables it asks for:
   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | the Atlas connection string from step 1 |
   | `ADMIN_EMAIL` | your admin login email |
   | `ADMIN_PASSWORD` | a strong password (8+ characters) |
   | `SESSION_SECRET` | generated automatically by the Blueprint (if you made a plain Web Service, add any long random text) |
   | `NODE_ENV` | `production` (set by the Blueprint) |
3. Deploy. The first start loads the 13 logos into the database and creates the admin account, so there is
   no separate seed step.
4. Open your `https://<name>.onrender.com/admin/login`, sign in, and add users.

Notes
- On Render's free plan the site sleeps after ~15 minutes without visits; the first visit afterwards takes
  about a minute to wake up.
- To change the admin password later, edit `ADMIN_PASSWORD` in Render's environment and redeploy/restart.
- If the deploy shows `Startup failed`, read the log line: it is almost always `MONGO_URI` (wrong password,
  missing database name, or Atlas Network Access not set to `0.0.0.0/0`).

## Production (your own server)
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
| GET / POST | /api/admin/users `{email, name, code}` | admin only |
| POST | /api/admin/users/:id/code `{code}` | admin only (set new code) |
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

## Solid backgrounds (USP Logo + Vertical)
Two extra image sets, shown as sections 04 and 05 on the page and stored in their own `Background` collection:
- **USP Logo** (landscape, 8000 × 4500): `server/public/backgrounds/landscape/`
- **Vertical** (portrait, 2480 × 3508): `server/public/backgrounds/portrait/`
- In both sets **01-09 are green = primary** and **10-18 are red = secondary** (edit `server/data/backgrounds.js` to change).
- Each folder has `original/` (full-size JPG, download only) and `preview/` (small thumbnails shown on the page).
- They are JPG only, so each card has a single JPG download button.
- They load into MongoDB automatically on server start (`ensureBackgrounds`), or with `npm run seed`.
- API: `GET /api/backgrounds/sections`, `GET /api/backgrounds/:set/:code/download` (`:set` is `landscape` or `portrait`).

## Where the images live
- Preview images (shown on the page): `server/public/logos/preview/` (served to signed-in people at `/assets/logos/preview/logo-XX.png`)
- Full-size PNG originals: `server/public/logos/original/`
- JPG versions: `server/public/jpg/` (named `Unstoppable Logos-XX.jpg`)
- TIFF versions: `server/public/tiff/` (named `Unstoppable Logos-XX.tiff`)
