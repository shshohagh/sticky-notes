<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import interact from 'interactjs'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useNotesStore, COLORS, FONTS } from '../stores/notes'

const props = defineProps({ note: { type: Object, required: true } })
const store = useNotesStore()

const el = ref(null)
const textarea = ref(null)
const editing = ref(false)
const menuOpen = ref(false)

const html = computed(() =>
  props.note.content.trim()
    ? DOMPurify.sanitize(marked.parse(props.note.content, { breaks: true }))
    : '<p class="placeholder">Click to write…</p>'
)

const style = computed(() => ({
  transform: `translate(${props.note.x}px, ${props.note.y}px) rotate(${props.note.rotation}deg)`,
  width: props.note.width + 'px',
  height: props.note.height + 'px',
  background: props.note.color,
  fontFamily: props.note.font,
  zIndex: props.note.z_index,
}))

async function startEdit() {
  editing.value = true
  await nextTick()
  textarea.value?.focus()
}

function onInput(e) {
  store.update(props.note.id, { content: e.target.value })
}

function rotate(delta) {
  const r = Math.max(-15, Math.min(15, props.note.rotation + delta))
  store.update(props.note.id, { rotation: Math.round(r * 10) / 10 })
}

let interactable
onMounted(() => {
  interactable = interact(el.value)
    .draggable({
      allowFrom: '.note-bar',
      ignoreFrom: 'button',
      listeners: {
        move(e) {
          store.update(props.note.id, { x: props.note.x + e.dx, y: props.note.y + e.dy })
        },
      },
    })
    .resizable({
      edges: { left: true, right: true, bottom: true, top: false },
      modifiers: [interact.modifiers.restrictSize({ min: { width: 160, height: 120 } })],
      listeners: {
        move(e) {
          store.update(props.note.id, {
            x: props.note.x + e.deltaRect.left,
            width: e.rect.width,
            height: e.rect.height,
          })
        },
      },
    })
})
onBeforeUnmount(() => interactable?.unset())
</script>

<template>
  <div ref="el" class="note" :style="style" @mousedown="store.bringToFront(note.id)">
    <div class="note-bar">
      <button class="icon" title="Options" @click="menuOpen = !menuOpen">☰</button>
      <button class="icon" title="Delete" @click="store.remove(note.id)">✕</button>
    </div>

    <div v-if="menuOpen" class="menu" @mouseleave="menuOpen = false">
      <div class="swatches">
        <button
          v-for="c in COLORS" :key="c" class="swatch" :style="{ background: c }"
          :class="{ active: c === note.color }" @click="store.update(note.id, { color: c })"
        />
      </div>
      <select :value="note.font" @change="store.update(note.id, { font: $event.target.value })">
        <option v-for="f in FONTS" :key="f" :value="f">{{ f.split(',')[0].replace(/"/g, '') }}</option>
      </select>
      <div class="rotate">
        <button @click="rotate(-2)">⟲</button>
        <span>{{ note.rotation }}°</span>
        <button @click="rotate(2)">⟳</button>
      </div>
    </div>

    <textarea
      v-if="editing" ref="textarea" class="note-body editor"
      :value="note.content" @input="onInput" @blur="editing = false"
      @keydown.esc="editing = false"
    />
    <div v-else class="note-body markdown" @click="startEdit" v-html="html" />
  </div>
</template>
