// Storage layer: SQLite when running inside Tauri, localStorage in a plain browser (npm run dev).
import Database from '@tauri-apps/plugin-sql'

const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
const LS_KEY = 'sticky-notes'
let db = null

const COLUMNS = ['id', 'content', 'x', 'y', 'width', 'height', 'rotation', 'color', 'font', 'z_index', 'created_at', 'updated_at']

function lsRead() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function lsWrite(notes) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(notes)) } catch { /* ignore */ }
}

export async function init() {
  if (isTauri) db = await Database.load('sqlite:sticky.db')
}

export async function getAll() {
  if (db) return await db.select('SELECT * FROM notes ORDER BY z_index ASC')
  return lsRead().sort((a, b) => a.z_index - b.z_index)
}

export async function save(note) {
  if (db) {
    const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(', ')
    const updates = COLUMNS.filter(c => c !== 'id' && c !== 'created_at').map(c => `${c} = excluded.${c}`).join(', ')
    await db.execute(
      `INSERT INTO notes (${COLUMNS.join(', ')}) VALUES (${placeholders})
       ON CONFLICT(id) DO UPDATE SET ${updates}`,
      COLUMNS.map(c => note[c])
    )
    return
  }
  const notes = lsRead()
  const i = notes.findIndex(n => n.id === note.id)
  if (i >= 0) notes[i] = { ...note }
  else notes.push({ ...note })
  lsWrite(notes)
}

export async function remove(id) {
  if (db) {
    await db.execute('DELETE FROM notes WHERE id = $1', [id])
    return
  }
  lsWrite(lsRead().filter(n => n.id !== id))
}
