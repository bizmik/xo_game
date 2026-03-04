<script>
  let name = ""
  let connected = false
  let status = "idle" // idle | waiting | playing | finished

  let players = []
  let board = []
  let currentTurn = null
  let result = null

  let ws

  function connect() {
    ws = new WebSocket("ws://localhost:3000")

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", name }))
      connected = true
    }

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)

      if (data.type === "waiting") {
        status = "waiting"
        players = data.players
      }

      if (data.type === "start") {
        status = "playing"
        players = data.players
        board = data.board
        currentTurn = data.currentTurn
        result = null
      }

      if (data.type === "update") {
        board = data.board
        currentTurn = data.currentTurn
      }

      if (data.type === "end") {
        status = "finished"
        board = data.board
        result = data.result
      }
    }
  }

  function move(i) {
    if (status !== "playing") return
    ws.send(JSON.stringify({ type: "move", index: i }))
  }

  function restart() {
    ws.send(JSON.stringify({ type: "restart" }))
  }
</script>

{#if !connected}
  <h2>Enter your name</h2>
  <input bind:value={name} />
  <button on:click={connect} disabled={!name}>Join</button>

{:else if status === "waiting"}
  <h2>⏳ Waiting for second player...</h2>
  <ul>
    {#each players as p}
      <li>{p.name}</li>
    {/each}
  </ul>

{:else}
  <h3>Players:</h3>
  <ul>
    {#each players as p}
      <li>{p.name} ({p.symbol})</li>
    {/each}
  </ul>

  {#if status === "finished"}
    <h2>
      {result === "draw" ? "🤝 Draw!" : `🏆 Winner: ${result}`}
    </h2>
    <button on:click={restart}>Play again</button>
  {:else}
    <p>Turn: {currentTurn}</p>
  {/if}

  <div class="board">
    {#each board as cell, i}
      <button
        on:click={() => move(i)}
        disabled={cell || status !== "playing"}
      >
        {cell}
      </button>
    {/each}
  </div>
{/if}

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 80px);
    gap: 10px;
    margin-top: 10px;
  }

  button {
    height: 80px;
    font-size: 2rem;
  }
</style>