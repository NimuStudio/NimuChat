<div align="center">

<img src="assets/yuri-avatar.png" width="96" height="96" alt="柠木工作室 · Nimu Studio" style="border-radius:50%" />

# ⚡ NimuChat

**轻量 WebSocket 即时通讯组件 · 实时消息收发 · 零构建 · 前端+后端完整可跑**

[![GitHub stars](https://img.shields.io/github/stars/NimuStudio/NimuChat?style=flat-square&label=Stars&color=6b9589)](https://github.com/NimuStudio/NimuChat)
[![License](https://img.shields.io/github/license/NimuStudio/NimuChat?style=flat-square&label=License&color=6b9589)](https://github.com/NimuStudio/NimuChat/blob/main/LICENSE)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real%20Time-4a7a6e?style=flat-square)](https://github.com/NimuStudio/NimuChat)
[![Dependencies](https://img.shields.io/badge/dependencies-1%20(ws)-f7f5f0?style=flat-square&labelColor=2c2416&color=6b9589)](https://github.com/NimuStudio/NimuChat)

</div>

---

## 是什么

NimuChat 是一个**极简的即时通讯（IM）技术组件**：一个 Node.js WebSocket 服务 + 一个零依赖前端客户端。

- 核心能力：**连接 → 认证 → 订阅会话 → 实时收发消息 → 断线重连**
- 没有任何业务耦合（没有客服、站点、套餐等），只做**通讯本身**
- 前端 `chat-client.js` 零依赖，任意项目直接引入

## 特性

- ⚡ **WebSocket 实时双向通信**（消息毫秒级送达）
- 🔌 **一行接入**：`new NimuChat(url, { userId })` 即用
- 🔄 **自动断线重连**
- 🗂 **会话订阅**：多个客户端可订阅同一会话互聊
- 📜 **历史消息拉取**
- 🚫 **零依赖**（后端仅需 `ws` 一个包，前端纯原生）
- 📦 **前后端完整可跑**（demo 开箱即验）

## 快速开始

```bash
# 1. 进入 server 目录安装依赖
cd server
npm i ws

# 2. 启动服务
node server.js
# → NimuChat server running at ws://localhost:3001

# 3. 打开演示（另开终端）
cd ../client
# 任意静态服务器
python -m http.server 8080
# 浏览器打开 http://localhost:8080/demo.html
```

演示页是两个窗口（用户 A / 用户 B），连到同一会话实时互聊，刷新后历史仍在（内存存储）。

## 消息协议

所有消息为 JSON，通过 WebSocket 文本帧传输。

### 客户端 → 服务端

| type | 字段 | 说明 |
|---|---|---|
| `auth` | `userId` | 认证（演示版直接信任 userId；生产请替换为 JWT） |
| `subscribe` | `conversationId` | 订阅会话，加入该会话的消息广播组 |
| `message` | `conversationId`, `content` | 发送消息（先 subscribe） |
| `history` | `conversationId` | 拉取该会话历史消息 |

### 服务端 → 客户端

| type | 字段 | 说明 |
|---|---|---|
| `auth_ok` | `userId` | 认证成功 |
| `subscribed` | `conversation_id` | 订阅成功 |
| `message` | `message: {id, conversation_id, sender_id, content, timestamp}` | 新消息（广播给该会话所有订阅者） |
| `history` | `conversation_id, messages[]` | 历史消息 |
| `error` | `message` | 错误信息 |

## 前端 API

```js
const chat = new NimuChat("ws://localhost:3001", {
  userId: "user_1",
  autoReconnect: true,   // 默认 true
  reconnectDelay: 3000,  // 重连间隔 ms
});

// 事件
chat.on("open", () => {});
chat.on("auth", (res) => { chat.subscribe("conv_1"); });
chat.on("message", (msg) => console.log(msg.content));
chat.on("history", (msgs) => msgs.forEach(console.log));
chat.on("error", (err) => console.error(err));

// 方法
chat.connect();              // 连接（自动认证 + 自动重连）
chat.subscribe("conv_1");    // 订阅会话
chat.send("conv_1", "你好"); // 发送消息
chat.history("conv_1");      // 拉取历史
chat.disconnect();           // 断开（停止重连）
```

## 目录结构

```
NimuChat/
├── server/
│   ├── server.js       WebSocket 聊天服务（内存存储，可替换为数据库）
│   └── package.json    （依赖仅 ws）
├── client/
│   ├── chat-client.js  前端客户端（零依赖）
│   └── demo.html       双窗口实时聊天演示
├── README.md / README.en.md
└── LICENSE
```

## 生产化建议

- 认证：`auth` 消息换成 JWT 校验（服务端验证 token 得到真实 userId）
- 存储：内存 Map 换成 Redis / SQLite / 数据库，支持持久化与多实例
- 扩展：水平扩展时用 Redis Pub/Sub 做跨节点广播
- 限流：消息频率限制、内容长度校验（已做 2000 字符截断）

## 讨论

💬 有问题或想交流？欢迎来 [GitHub Discussions](https://github.com/NimuStudio/NimuChat/discussions) 聊聊。

加入 **Nimu Studio 用户交流群**：QQ 群 `1097466590`（或加作者 QQ `2998827169`），一起交流、反馈、催更。

## 配套组件

- 🎨 需要漂亮的聊天界面？搭配 [**Nimu Glass UI**](https://github.com/NimuStudio/Nimu-glass-ui)（三主题玻璃拟态 UI 体系，含聊天界面组件）——NimuChat 管通讯，Nimu Glass UI 管颜值。

## 支持者

感谢以下支持者让这个项目持续下去 ❤️

| 支持者 | 赞助档位 | 日期 |
|---|---|---|
| 等你来 ⭐ | 支持者 ¥18 | — |

> 想支持这个项目？☕ [去爱发电请我喝杯咖啡](https://ifdian.net/a/NimuStudio)。**¥18 支持者档**支持者的名字（GitHub 用户名或昵称）会永久列入上表。
>
> 如果你已赞助，但想用另一个名字展示，发一条留言告诉我即可。

## 支持

喜欢这个项目？☕ [去爱发电请我喝杯咖啡](https://ifdian.net/a/NimuStudio)

## 许可证

[MIT](LICENSE)
