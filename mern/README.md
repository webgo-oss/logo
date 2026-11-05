# Unstoppable Logo Showcase (MERN)

- **MongoDB** stores the 13 logos (section, sub-type, tone, download counter)
- **Express** serves the API, the preview images and the download route
- **React (Vite)** renders the showcase page

## Requirements
Node 18+ and a running MongoDB (local, or a MongoDB Atlas connection string).

## Setup
```bash
npm run install-all          # installs root, server and client dependencies
# edit server/.env if your MongoDB is not on localhost
npm run seed                 # loads the 13 logos into MongoDB
npm run dev                  # API on :5000, React on http://localhost:5173
```

## Production
```bash
npm run build                # builds the React app into client/dist
npm start                    # Express serves API + built site on http://localhost:5000
```

## API
| Method | Route                      | What it does                                    |
|--------|----------------------------|-------------------------------------------------|
| GET    | /api/logos                 | All logos (`?group=` and `?subtype=` filters)   |
| GET    | /api/logos/sections        | Logos grouped as the page needs them            |
| GET    | /api/logos/:code/preview   | The preview image shown on the page             |
| GET    | /api/logos/:code/download  | Downloads the original 4500×4500 PNG, counts it |

## How the logos are grouped
- **primary**: green, "Beyond the Blueprint" (04, 05, 06)
- **secondary**: white, "Beyond the Blueprint" (01, 02, 03)
- **complementary / primary**: green, "Real Estate Growth Partner" (11, 12, 13)
- **complementary / secondary**: white, "Real Estate Growth Partner" (07, 08, 09)
- **brand**: the gold monogram (10)

## Where the images live
- Preview images (shown on the page): `server/public/logos/preview/` (served at `/assets/logos/preview/logo-XX.png`, also available at `/api/logos/:code/preview`)
- Full-size originals (what the Download button sends): `server/public/logos/original/`
