<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useNotesStore } from './stores/notes'
import NoteCard from './components/NoteCard.vue'

const store = useNotesStore()

function onKey(e) {
  const tag = e.target.tagName
  if (tag === 'TEXTAREA' || tag === 'INPUT' || e.target.isContentEditable) return
  if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    store.add()
  }
}

function onBoardDblClick(e) {
  if (e.target.classList.contains('board')) store.add(e.clientX - 120, e.clientY - 20)
}

onMounted(async () => {
  await store.load()
  if (store.notes.length === 0) {
    const id = store.add(120, 100)
    store.update(id, {
      content: '## Welcome!\n\n- Press **N** for a new note\n- Double-click the board too\n- Drag by the top bar\n- Resize from edges/corners\n- Click text to edit (Markdown)',
    })
  }
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="board" @dblclick="onBoardDblClick">
    <NoteCard v-for="note in store.notes" :key="note.id" :note="note" />
    <button class="fab" title="New note (N)" @click="store.add()">+</button>
  </div>
</template>
