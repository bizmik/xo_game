<script setup>
import { ref } from "vue"

const name = ref("")
const connected = ref(false)
const status = ref("idle") // idle | waiting | playing | finished

const players = ref([])
const board = ref([])
const currentTurn = ref(null)
const result = ref(null)

let ws

function connect() {
  ws = new WebSocket("ws://localhost:3000")

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join", name: name.value }))
    connected.value = true
  }

  ws.onmessage = e => {
    const data = JSON.parse(e.data)

    if (data.type === "waiting") {
      status.value = "waiting"
      players.value = data.players
    }

    if (data.type === "start") {
      status.value = "playing"
      players.value = data.players
      board.value = data.board
      currentTurn.value = data.currentTurn
      result.value = null
    }

    if (data.type === "update") {
      board.value = data.board
      currentTurn.value = data.currentTurn
    }

    if (data.type === "end") {
      status.value = "finished"
      board.value = data.board
      result.value = data.result
    }
  }
}

function move(i) {
  if (status.value !== "playing") return
  ws.send(JSON.stringify({ type: "move", index: i }))
}

function restart() {
  ws.send(JSON.stringify({ type: "restart" }))
}
</script>

<template>
  <!-- JOIN -->
  <div v-if="!connected">
    <h2>Enter your name</h2>
    <input v-model="name" />
    <button @click="connect" :disabled="!name">Join</button>
  </div>

  <!-- WAITING -->
  <div v-else-if="status === 'waiting'">
    <h2>⏳ Waiting for second player...</h2>
    <p>Connected players:</p>
    <ul>
      <li v-for="p in players" :key="p.name">{{ p.name }}</li>
    </ul>
  </div>

  <!-- PLAYING / FINISHED -->
  <div v-else>
    <h3>Players:</h3>
    <ul>
      <li v-for="p in players" :key="p.name">
        {{ p.name }} ({{ p.symbol }})
      </li>
    </ul>

    <div v-if="status === 'finished'">
      <h2>
        {{ result === "draw" ? "🤝 Draw!" : `🏆 Winner: ${result}` }}
      </h2>
      <button @click="restart">Play again</button>
    </div>

    <p v-else>Turn: {{ currentTurn }}</p>

    <div class="board">
      <button
        v-for="(c,i) in board"
        :key="i"
        @click="move(i)"
        :disabled="c || status !== 'playing'"
      >
        {{ c }}
      </button>
    </div>
  </div>
</template>
<style>
* {
  margin: 0;
  padding: 0;
  justify-content: center;
  
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 80px);
  gap: 5px;
}
button {
  height: 80px;
  font-size: 2rem;
}

</style>