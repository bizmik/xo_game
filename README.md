# XO Game (Multiplayer Tic-Tac-Toe)

Учебный мультиплеерный проект **Крестики-нолики** с real-time взаимодействием.

Цель проекта:
- изучить WebSocket multiplayer
- сравнить frontend-фреймворки (Vue vs Svelte)
- понять dev-loop с Docker
- выстроить clean backend → frontend контракт

---

## 🧱 Архитектура

- **Backend**: Bun + WebSocket
- **Frontend**:
  - Vue 3 (Vite)
  - Svelte (Vite)
- **Dev environment**: Docker + docker-compose
- **State**: server-authoritative (без БД)


---

## 🚀 Запуск локально (Development)

### Требования
- Docker
- Docker Compose

### Запуск
```bash
docker-compose up --build

Vue client: http://localhost:5173

Svelte client: http://localhost:5174

Backend (WS): ws://localhost:3000

Открой две вкладки / разные клиенты, чтобы начать игру.