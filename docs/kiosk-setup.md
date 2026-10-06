# Kiosk / Lockdown Setup (Safe Exam Browser)

This document explains how to install Safe Exam Browser (SEB), open the AntiCheat exam with the `.seb` config file, and what the lockdown blocks.

**Owner:** Kiosk/Lockdown Dev
**Config file:** `docs/anticheat.seb`

---

## 1. What this does

SEB locks the student's computer into the exam. With our config, students cannot:

- open other browsers (Chrome, Edge)
- visit other websites (including ChatGPT)
- open Word, Notepad, or PDF viewers
- Alt+Tab or switch to other apps
- copy/paste or right-click

The React app adds a second layer (violation counter: "Warning X of 5") for anything that slips through.

---

## 2. Requirements

- Windows PC
- Safe Exam Browser 3.10.2 or newer (download from https://safeexambrowser.org)
- The frontend and backend running (see the main `README.md`)

---

## 3. Install SEB

1. Download **Safe Exam Browser for Windows** from safeexambrowser.org.
2. Run the installer and finish the setup.
3. Do not run the installer again afterwards. If you see "Modify Setup" / "Uninstall", SEB is already installed. Click **Close**.

---

## 4. Run the exam in SEB

1. Start the backend (`herd link`, check `http://backend.test` loads).
2. Start the frontend:
   ```
   cd frontend
   npm run dev
   ```
3. Double-click `docs/anticheat.seb`.
4. SEB opens full screen and loads the exam page.

**To quit SEB:** press `Ctrl+Q` and enter the quit password.

> The quit password is shared with the team in the group chat. Do not write real passwords in this file.

---

## 5. Current config settings

| Setting | Value |
|---|---|
| Start URL | `http://localhost:5180` *(change to the shared/LAN URL for the live demo)* |
| Use SEB settings file for | Starting an exam |
| Encryption | None |
| Allow user to quit SEB | Yes (with password) |

### Lockdown settings (fill in as you apply them)

| Tab | Setting | Status |
|---|---|---|
| Browser | Right-click disabled | [ ] |
| Browser | Dev tools disabled | [ ] |
| Browser | Spell check disabled | [ ] |
| Network | URL filter on, only allow frontend + `backend.test` | [ ] |
| Security | Create new desktop | [ ] |
| Security | Clipboard disabled | [ ] |
| Security | Printing disabled | [ ] |
| Applications | Prohibited processes added (see below) | [ ] |
| Hooked Keys | Alt+Tab, Win key, Esc blocked | [ ] |

### Prohibited processes

`WINWORD.EXE`, `notepad.exe`, `chrome.exe`, `msedge.exe`, `AcroRd32.exe`

---

## 6. Editing the config

1. Open **SEB Configuration Tool** from the Start menu.
2. Click **Config File → Open Settings…** and choose `docs/anticheat.seb`.
3. Change the settings, then click **Save Settings**.
4. Test by double-clicking the `.seb` file.
5. Commit and push to `dev`:
   ```
   git pull
   git add docs/anticheat.seb
   git commit -m "Update SEB config"
   git push
   ```

Keep a backup of a working `.seb` before experimenting.

---

## 7. Live demo notes

- `localhost` and `backend.test` only work on the computer that runs them.
- For the demo, host the app somewhere reachable or use the LAN IP (example: `http://192.168.x.x:5173`).
- Put that exact URL in the **Start URL** and the **URL filter** allow list, then save the `.seb` file again.
- Run the frontend with `npm run dev -- --host` so other computers can reach it.

---

## 8. Test results (Oct 8)

Try each of these from inside SEB and record the result.

| Test | Expected | Result |
|---|---|---|
| Alt+Tab | Blocked | |
| Windows key | Blocked | |
| Open Chrome | Blocked | |
| Open Word | Blocked | |
| Open Notepad | Blocked | |
| Open a PDF | Blocked | |
| Visit chatgpt.com | Blocked | |
| Copy / paste | Blocked | |
| Right-click | Blocked | |
| Quit with Ctrl+Q + password | Works | |

---

## 9. Known limits

- SEB only protects the computer it runs on. A student using a second device (phone) is not blocked.
- If the exam is opened in a normal browser instead of SEB, the backend should reject it (check for `SEB` in the user agent or the SEB request hash header).
- Fill in anything else found during testing here.

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| Blank page in SEB | Make sure `npm run dev` is running and the Start URL matches |
| Page blocked in SEB | Add the URL to the URL filter allow list |
| Cannot exit SEB | Press `Ctrl+Q` and enter the quit password. Last resort: `Ctrl+Alt+Del` and sign out |
| Config won't open | Open the SEB Configuration Tool first, then use **Open Settings…** |
