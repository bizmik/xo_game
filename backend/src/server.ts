type PlayerSymbol = "X" | "O"
type Client = {
  ws: WebSocket
  name: string
  symbol: PlayerSymbol
}

let players: Client[] = []
let board: (PlayerSymbol | null)[] = Array(9).fill(null)
let currentTurn: PlayerSymbol = "X"
let gameActive = false

function broadcast(data: any) {
  players.forEach(p => p.ws.send(JSON.stringify(data)))
}

function resetGame() {
  board = Array(9).fill(null)
  currentTurn = "X"
  gameActive = true
}

function sendWaiting() {
  broadcast({
    type: "waiting",
    players: players.map(p => ({ name: p.name }))
  })
}

function checkWinner() {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ]

  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return board.includes(null) ? null : "draw"
}

Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) return
    return new Response("WebSocket only", { status: 400 })
  },

  websocket: {
    open(ws) {},

    message(ws, msg) {
      const data = JSON.parse(msg.toString())

      // регистрация игрока
      if (data.type === "join") {
        if (players.length >= 2) return

        const symbol: PlayerSymbol = players.length === 0 ? "X" : "O"
        players.push({ ws, name: data.name, symbol })

        if (players.length === 1) {
            sendWaiting()
        }

        if (players.length === 2) {
            resetGame()
            broadcast({
                type: "start",
                players: players.map(p => ({
                name: p.name,
                symbol: p.symbol
                })),
                board,
                currentTurn
            })
        }

        return
      }

      // ход
      if (data.type === "move" && gameActive) {
        const player = players.find(p => p.ws === ws)
        if (!player || player.symbol !== currentTurn) return
        if (board[data.index]) return

        board[data.index] = player.symbol
        const result = checkWinner()

        if (result) {
          gameActive = false
          broadcast({ type: "end", result, board })
        } else {
          currentTurn = currentTurn === "X" ? "O" : "X"
          broadcast({ type: "update", board, currentTurn })
        }
      }

      if (data.type === "restart") {
        resetGame()
        broadcast({ type: "start", board, currentTurn })
      }
    },

    close(ws) {

        players = players.filter(p => p.ws !== ws)
        gameActive = false

        if (players.length === 1) {
            sendWaiting()
        }
    }
  }
})

console.log("Backend running on ws://localhost:3000")