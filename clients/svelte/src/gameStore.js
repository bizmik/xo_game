import { writable } from "svelte/store"

export const game = writable({
  connected: false,
  status: "idle", // idle | waiting | playing | finished
  players: [],
  board: [],
  currentTurn: null,
  result: null,
  ws: null
})