<div align="center">

<img src="assets/yuri-avatar.png" width="96" height="96" alt="Nimu Studio" style="border-radius:50%" />

# ⚡ NimuChat

**Lightweight WebSocket IM component · real-time messaging · zero build · frontend + backend runnable**

[![GitHub stars](https://img.shields.io/github/stars/NimuStudio/NimuChat?style=flat-square&label=Stars&color=6b9589)](https://github.com/NimuStudio/NimuChat)
[![License](https://img.shields.io/github/license/NimuStudio/NimuChat?style=flat-square&label=License&color=6b9589)](https://github.com/NimuStudio/NimuChat/blob/main/LICENSE)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real%20Time-4a7a6e?style=flat-square)](https://github.com/NimuStudio/NimuChat)
[![Dependencies](https://img.shields.io/badge/dependencies-1%20(ws)-f7f5f0?style=flat-square&labelColor=2c2416&color=6b9589)](https://github.com/NimuStudio/NimuChat)

</div>

---

## What is it

NimuChat is a **minimal instant-messaging (IM) component**: a Node.js WebSocket server + a zero-dependency frontend client.

- Core capabilities: **connect → auth → subscribe to a conversation → send/receive messages in real time → auto-reconnect**
- No business coupling (no customer service, sites, plans, etc.) — just **messaging itself**
- `chat-client.js` has zero dependencies, drop it into any project.

## Features

- ⚡ **WebSocket real-time two-way messaging** (millisecond delivery)
- 🔌 **One-line integration**: `new NimuChat(url, { userId })`
- 🔄 **Automatic reconnect**
- 🗂 **Conversation subscription**: multiple clients can join the same conversation
- 📜 **History fetching**
- 🚫 **Zero dependencies** (backend needs only `ws`; frontend is vanilla JS)
- 📦 **Runnable end-to-end** (demo works out of the box)

## Quick Start

```bash
# 1. install dependency in server dir
cd server
npm i ws

# 2. start the server
node server.js
# → NimuChat server running at ws://localhost:3001

# 3. open the demo (another terminal)
cd ../client
# any static server
python -m http.server 8080
# open http://localhost:8080/demo.html in browser
```

The demo page has two windows (User A / User B) chatting in real time on the same conversation; history survives refresh (in-memory storage).

## Message Protocol

All messages are JSON over WebSocket text frames.

### Client → Server

| type | fields | description |
|---|---|---|
| `auth` | `userId` | auth (demo trusts userId; replace with JWT in production) |
| `subscribe` | `conversationId` | subscribe to a conversation |
| `message` | `conversationId`, `content` | send a message (subscribe first) |
| `history` | `conversationId` | fetch conversation history |

### Server → Client

| type | fields | description |
|---|---|---|
| `auth_ok` | `userId` | auth succeeded |
| `subscribed` | `conversation_id` | subscribed |
| `message` | `message: {id, conversation_id, sender_id, content, timestamp}` | new message (broadcast to all subscribers) |
| `history` | `conversation_id, messages[]` | history messages |
| `error` | `message` | error info |

## Client API

```js
const chat = new NimuChat("ws://localhost:3001", {
  userId: "user_1",
  autoReconnect: true,   // default true
  reconnectDelay: 3000,  // ms
});

// events
chat.on("open", () => {});
chat.on("auth", (res) => { chat.subscribe("conv_1"); });
chat.on("message", (msg) => console.log(msg.content));
chat.on("history", (msgs) => msgs.forEach(console.log));
chat.on("error", (err) => console.error(err));

// methods
chat.connect();              // connect (auto-auth + auto-reconnect)
chat.subscribe("conv_1");    // subscribe to a conversation
chat.send("conv_1", "hello");// send a message
chat.history("conv_1");      // fetch history
chat.disconnect();           // disconnect (stop reconnecting)
```

## Structure

```
NimuChat/
├── server/
│   ├── server.js       WebSocket chat server (in-memory storage)
│   └── package.json    (dependency: ws only)
├── client/
│   ├── chat-client.js  frontend client (zero dependency)
│   └── demo.html       two-window real-time chat demo
├── README.md / README.en.md
└── LICENSE
```

## Production Notes

- Auth: validate JWT in the `auth` message to get the real userId
- Storage: replace the in-memory Map with Redis / SQLite / DB for persistence & multi-instance
- Scaling: use Redis Pub/Sub for cross-node broadcast
- Rate limiting: message frequency limits (content is already truncated to 2000 chars)

## Discussions

💬 Questions or want to chat? Join [GitHub Discussions](https://github.com/NimuStudio/NimuChat/discussions).

Join the **Nimu Studio user group**: QQ group `1097466590` (or add the author on QQ `2998827169`) to chat, give feedback and follow updates.

## Related

- 🎨 Need a beautiful chat UI? Pair with [**Nimu Glass UI**](https://github.com/NimuStudio/Nimu-glass-ui) (3-theme glassmorphism UI system incl. chat components) — NimuChat handles messaging, Nimu Glass UI handles looks.

## Sponsors

Thanks to the following supporters for keeping this project going ❤️

| Supporter | Tier | Date |
|---|---|---|
| Waiting for you ⭐ | Supporter ¥18 | — |

> Want to support? ☕ [Buy me a coffee on Afdian](https://ifdian.net/a/NimuStudio). Supporters of the **¥18 tier** get their name (GitHub username or nickname) listed here permanently.

## Support

Like this project? ☕ [Buy me a coffee on Afdian](https://ifdian.net/a/NimuStudio)

## License

[MIT](LICENSE)
