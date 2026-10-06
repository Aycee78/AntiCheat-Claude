# 🛡️ AntiCheat

Secure online exams: a **Laravel + React** quiz system paired with **Safe Exam Browser (SEB)**, so students can't open other apps (browsers, ChatGPT, Word, Notes, PDF viewers) during an assessment.

---

## 🧰 Tech Stack

| Layer              | Tool                                     | Folder      |
| ------------------ | ---------------------------------------- | ----------- |
| 🐘 Backend API     | Laravel (PHP)                            | `backend/`  |
| ⚛️ Frontend UI     | React + Vite + React Router              | `frontend/` |
| 🗄️ Database        | MySQL                                    | local       |
| 🔒 Lockdown        | Safe Exam Browser (config file, no code) | `.seb` file |
| 🌿 Version control | Git + GitHub                             | -           |

```
AntiCheat/
├── backend/    Laravel: API, DB, migrations
└── frontend/   React: exam form, admin dashboard
```

---

## ✅ Prerequisites

| Tool          | Why                                       | Check            |
| ------------- | ----------------------------------------- | ---------------- |
| Laravel Herd  | PHP + local web server (enable its MySQL) | `herd --version` |
| Composer      | PHP packages                              | `composer -V`    |
| Node.js + npm | React packages                            | `node -v`        |
| Git           | Version control                           | `git --version`  |
| VS Code       | Editor (recommended)                      | -                |

---

## 🚀 Quick Start

### 1️⃣ Clone

| Step          | Command                                               |
| ------------- | ----------------------------------------------------- |
| Clone         | `git clone https://github.com/migeltan/AntiCheat.git` |
| Enter         | `cd AntiCheat`                                        |
| Switch branch | `git checkout dev`                                    |

### 2️⃣ Backend (`backend/`)

| Step | Command / Action                                 | Result                                      |
| ---- | ------------------------------------------------ | ------------------------------------------- |
| 1    | `cd backend`                                     | -                                           |
| 2    | `composer install`                               | Installs PHP packages (`vendor/`)           |
| 3    | Copy `.env.example` → `.env`                     | Already set for MySQL. Add your DB password |
| 4    | Create an empty MySQL database named `anticheat` | DB ready                                    |
| 5    | `php artisan key:generate`                       | Sets `APP_KEY`                              |
| 6    | `php artisan migrate`                            | Creates tables                              |
| 7    | `herd link`                                      | Site at `http://backend.test`               |
| 8    | Open `http://backend.test/api/ping`              | Should show `"status": "ok"` ✅             |

> No Herd? Run `php artisan serve` instead. Backend will be at `http://localhost:8000`.

**How to copy `.env.example` → `.env`:**

| Terminal               | Command                       |
| ---------------------- | ----------------------------- |
| Windows CMD            | `copy .env.example .env`      |
| PowerShell             | `Copy-Item .env.example .env` |
| Mac / Linux / Git Bash | `cp .env.example .env`        |

### 3️⃣ Frontend (`frontend/`)

| Step | Command / Action             | Result                                             |
| ---- | ---------------------------- | -------------------------------------------------- |
| 1    | `cd frontend`                | -                                                  |
| 2    | `npm install`                | Installs React packages                            |
| 3    | Copy `.env.example` → `.env` | Sets `VITE_API_URL`                                |
| 4    | `npm run dev`                | Starts Vite on port **5180**                       |
| 5    | Open `http://localhost:5180` | Home page with a green **Backend online** badge ✅ |

---

## 🏠 See the Home Page

| What                                  | URL                                              | File                          |
| ------------------------------------- | ------------------------------------------------ | ----------------------------- |
| ⚛️ **React home page (the real one)** | `http://localhost:5180`                          | `frontend/src/pages/Home.jsx` |
| 🐘 Backend info (JSON only)           | `http://backend.test` or `http://localhost:8000` | `backend/routes/web.php`      |
| ❤️ Health check                       | `http://backend.test/api/ping`                   | `backend/routes/api.php`      |

**Badge colors on the home page:**

| Badge              | Meaning                          | Fix                                     |
| ------------------ | -------------------------------- | --------------------------------------- |
| 🟢 Backend online  | React can reach Laravel          | -                                       |
| 🔴 Backend offline | Laravel not running or wrong URL | Check `VITE_API_URL` in `frontend/.env` |
| 🟡 Checking…       | Still loading                    | Wait a second                           |

---

## 🗺️ Pages & Routes

**Frontend (React)**

| Path     | Page            | File                            | Status         |
| -------- | --------------- | ------------------------------- | -------------- |
| `/`      | Home            | `src/pages/Home.jsx`            | ✅ Done        |
| `/exam`  | Exam form       | `src/pages/Exam.jsx`            | 🚧 Placeholder |
| `/admin` | Admin dashboard | `src/pages/Admin/Dashboard.jsx` | 🚧 Placeholder |
| `*`      | 404             | `src/pages/NotFound.jsx`        | ✅ Done        |

**Backend (Laravel API)**

| Method | Endpoint     | Purpose                         | Status     |
| ------ | ------------ | ------------------------------- | ---------- |
| GET    | `/api/ping`  | Health check                    | ✅ Done    |
| -      | more to come | Exam, submission, violation log | 🚧 Planned |

**Add a new page:** create `src/pages/MyPage.jsx`, then add `<Route path="/my-page" element={<MyPage />} />` in `src/App.jsx`.
**Add a new API route:** add it in `backend/routes/api.php`. Call it from React with `api('/my-route')` from `src/lib/api.js`.

---

## ⚙️ Environment Variables

| File            | Variable                      | Value                                                                     |
| --------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `backend/.env`  | `DB_DATABASE`                 | `anticheat`                                                               |
| `backend/.env`  | `DB_USERNAME` / `DB_PASSWORD` | Your MySQL login                                                          |
| `frontend/.env` | `VITE_API_URL`                | `http://backend.test` (Herd) or `http://localhost:8000` (`artisan serve`) |

> Restart `npm run dev` after editing `frontend/.env`.

---

## 🔁 Daily Run

| Terminal | Command                           | Skip if                      |
| -------- | --------------------------------- | ---------------------------- |
| 1        | `cd backend && php artisan serve` | Using Herd (already running) |
| 2        | `cd frontend && npm run dev`      | -                            |

Then open `http://localhost:5180`.

---

## 🌿 Git Workflow

| Rule                 | Details                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Branches             | `main` = stable/demo-ready, `dev` = everyone works here (no per-person `feature/*` branches) |
| Before every push    | `git pull` first                                                                             |
| Conflicts            | Resolve them. Never force-push                                                               |
| Commits              | Small and often. Don't let local changes pile up for days                                    |
| Merge `dev` → `main` | Only at checkpoints (Sept 29 and before final submission), once `dev` is confirmed working   |

---

## 👥 Roles & Folder Ownership

| Role                       | Owns                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| 🐘 Backend/Data Lead       | `backend/app/Models`, `backend/database/migrations`, `backend/routes/api.php`, violation-log endpoint |
| 📝 Form/Frontend Dev       | `frontend/src/components/Form`, `frontend/src/pages` (form UI, timer, submission flow)                |
| 📊 Admin Dashboard + UI/UX | `frontend/src/pages/Admin`, `frontend/src/styles`, shared layout/components                           |
| 🔒 Kiosk/Lockdown Dev      | `.seb` config file, `docs/kiosk-setup.md`, focus-detection layer                                      |
| ✅ QA/Integration + Docs   | `README.md`, test checklist, merging `dev` into `main`                                                |

---

## 🔒 Safe Exam Browser (SEB)

| Step | Who       | What                                                                                                                                 |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Everyone  | Download SEB (Windows/Mac) from the official site                                                                                    |
| 2    | Kiosk dev | Create a `.seb` file: whitelist the frontend URL (`http://localhost:5180`), block other browsers, disable alt-tab, disable clipboard |
| 3    | Kiosk dev | Share the `.seb` file. Double-click launches SEB straight into the exam                                                              |
| 4    | Team      | For the demo, host backend + frontend on a stable URL (or same local network)                                                        |

---

## 🛠️ Troubleshooting

| Problem                         | Fix                                                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge says **Backend offline**  | Open `/api/ping` in the browser. If it fails, run `herd link` or `php artisan serve`. Then match `VITE_API_URL`                                                        |
| `404` on `/api/ping`            | Make sure `backend/bootstrap/app.php` has the `api:` line                                                                                                              |
| `vendor/autoload.php` not found | Run `composer install` in `backend/`                                                                                                                                   |
| Env change not working          | Restart `npm run dev`                                                                                                                                                  |
| `Port 5180 is already in use`   | Another app uses that port. Stop it, or change `server.port` in `frontend/vite.config.js`                                                                              |
| Blank page or wrong tab title   | An old service worker from another project on the same port. Use a different port, or F12 → Application → Service workers → Unregister, then Storage → Clear site data |
| `SQLSTATE` / DB error           | Check MySQL is running and the `anticheat` DB exists                                                                                                                   |
| `No application encryption key` | Run `php artisan key:generate`                                                                                                                                         |
| Blank page after `git pull`     | Run `npm install` and `composer install`                                                                                                                               |

---

## 📅 Timeline

| Dates           | Phase                                                               |
| --------------- | ------------------------------------------------------------------- |
| Sept 26–29      | Planning / suggested system features                                |
| Sept 29 – Oct 9 | Programming (Sept 29 checkpoint: `dev` runs locally with no errors) |
| Oct 9–10        | System testing                                                      |
| Oct 11–12       | Submission of final system                                          |

## Backend API (`/api`)

No authentication yet. All endpoints accept and return JSON (send `Accept: application/json`).

**Student flow**

| Method | Path                          | Body / notes                                                                                                                                   |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/exams/code/{code}`          | Validate an exam code                                                                                                                          |
| POST   | `/exams/code/{code}/sessions` | `student_name`, `student_number`. Starts or resumes a session                                                                                  |
| GET    | `/sessions/{id}`              | Session + exam (`expires_at` is the server-side deadline)                                                                                      |
| GET    | `/sessions/{id}/questions`    | Questions for the form                                                                                                                         |
| PUT    | `/sessions/{id}/answers`      | Autosave: `answers: [{question_id, value}]` (value is a string, or an array for checkboxes)                                                    |
| POST   | `/sessions/{id}/violations`   | `type`: `tab_switch`, `window_blur`, `app_detected`, `other`; optional `details`. Returns `violation_count`, `max_violations`, `limit_reached` |
| POST   | `/sessions/{id}/submit`       | `reason`: `manual` (default), `time_up`, `max_violations`                                                                                      |

**Admin flow**

| Method | Path                        | Notes                                                                                                                                                               |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/exams`                    | List exams                                                                                                                                                          |
| POST   | `/exams`                    | `title`, `duration_minutes`, optional `max_violations`, `status`, `form_url`. Generates `exam_code`                                                                 |
| POST   | `/exams/{id}/questions`     | Import: `questions: [{type, prompt, options?, required?}]`. Types: `multiple_choice`, `checkboxes`, `short_answer`, `paragraph`. Blocked once students have started |
| GET    | `/exams/{id}/questions`     | View questions                                                                                                                                                      |
| GET    | `/exams/{id}/sessions`      | Submissions                                                                                                                                                         |
| GET    | `/exams/{id}/violations`    | Full violation log (includes student name/number)                                                                                                                   |
| GET    | `/exams/{id}/summary`       | Dashboard data: totals, violations by type/severity, per-student rows                                                                                               |
| GET    | `/sessions/{id}/violations` | One student's violations                                                                                                                                            |
| GET    | `/sessions/{id}/answers`    | One student's saved answers                                                                                                                                         |

After cloning: `php artisan migrate --seed` creates a "Demo Exam" with 4 questions.
