import { defineStore } from 'pinia'
import * as storage from '../db/storage'

export const COLORS = ['#fde68a', '#fca5a5', '#86efac', '#93c5fd', '#c4b5fd', '#f9a8d4', '#ffffff']
export const FONTS = ['system-ui', 'Georgia, serif', '"Comic Sans MS", cursive', 'Consolas, monospace']

const timers = new Map()

export const useNotesStore = defineStore('notes', {
  state: () => ({ notes: [], loaded: false }),

  getters: {
    maxZ: (s) => s.notes.reduce((m, n) => Math.max(m, n.z_index), 0),
  },

  actions: {
    async load() {
      await storage.init()
      this.notes = await storage.getAll()
      this.loaded = true
    },

    add(x, y) {
      const now = new Date().toISOString()
      const note = {
        id: crypto.randomUUID(),
        content: '',
        x: x ?? 80 + Math.random() * 300,
        y: y ?? 80 + Math.random() * 200,
        width: 240,
        height: 220,
        rotation: Math.round((Math.random() * 4 - 2) * 10) / 10,
        color: COLORS[0],
        font: FONTS[0],
        z_index: this.maxZ + 1,
        created_at: now,
        updated_at: now,
      }
      this.notes.push(note)
      storage.save(note)
      return note.id
    },

    // Update in memory immediately, persist with a 300ms debounce
    update(id, patch) {
      const note = this.notes.find(n => n.id === id)
      if (!note) return
      Object.assign(note, patch, { updated_at: new Date().toISOString() })
      clearTimeout(timers.get(id))
      timers.set(id, setTimeout(() => {
        timers.delete(id)
        storage.save({ ...note })
      }, 300))
    },

    bringToFront(id) {
      const note = this.notes.find(n => n.id === id)
      if (note && note.z_index < this.maxZ) this.update(id, { z_index: this.maxZ + 1 })
    },

    remove(id) {
      clearTimeout(timers.get(id))
      timers.delete(id)
      this.notes = this.notes.filter(n => n.id !== id)
      storage.remove(id)
    },
  },
})
