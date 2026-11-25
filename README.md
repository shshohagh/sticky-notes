# Sticky Notes (Tauri + Vue) — Windows 11

A local corkboard of sticky notes. No server, no account; data lives in SQLite on your laptop
(`%APPDATA%\com.saidul.stickynotes\sticky.db`).

## Features (Phase 1)
- New note: `N` key, the `+` button, or double-click the board
- Drag by the top bar, resize from left/right/bottom edges
- Click to edit, Markdown rendering, `Esc` or click outside to finish
- ☰ menu: color, font, rotation · ✕ delete
- Auto-save (300 ms debounce)

## One-time setup on Windows 11
1. **Node.js LTS**: https://nodejs.org
2. **Visual Studio Build Tools 2022**: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   → select the **"Desktop development with C++"** workload
3. **Rust**: https://rustup.rs → run `rustup-init.exe` and accept the defaults (MSVC toolchain)
4. WebView2 is already installed on Windows 11.

Then open a new terminal (so the PATH is updated) and check:
```
node -v
cargo -V
```

## Run
```
cd sticky-notes
npm install
npm run tauri dev      # first run compiles Rust crates, takes 3–5 minutes
```

UI only, in the browser (uses localStorage, no Rust needed): `npm run dev` → http://localhost:1420

## Build an installer
```
npm run tauri build
```
Output:
- `src-tauri\target\release\bundle\nsis\Sticky Notes_0.1.0_x64-setup.exe`
- `src-tauri\target\release\bundle\msi\Sticky Notes_0.1.0_x64_en-US.msi`

## Project structure
```
src/
  App.vue                 board, N shortcut, double-click
  components/NoteCard.vue one note: drag/resize (interact.js), markdown, menu
  stores/notes.js         Pinia store, debounced save
  db/storage.js           SQLite (Tauri) or localStorage (browser)
src-tauri/
  src/lib.rs              SQL plugin + migration (notes table)
  tauri.conf.json         window, bundle (nsis/msi)
  capabilities/default.json  permissions
```

## Next phases
- Phase 2: board themes, settings panel
- Phase 3: global shortcut (Ctrl+Shift+N), tray icon, autostart, JSON export/import
- Phase 4: search, multiple boards, checklists, reminders
