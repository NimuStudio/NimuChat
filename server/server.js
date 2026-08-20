// server.js - NimuChat 聊天服务（零依赖，原生 ws 可选；也可用 npm i ws）
// 用法: node server.js  →  监听 3001 端口
// 如果 ws 未安装: npm i ws

const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3001;

// 内存存储：会话与消息（演示用；生产建议接数据库）
const conversations = new Map(); // convId -> { messages: [], subscribers: Set<ws> }
let msgSeq = 0;

function getConv(convId) {
  if (!conversations.has(convId)) {
    conversations.set(convId, { messages: [], subscribers: new Set() });
  }
  return conversations.get(convId);
}

// 向会话的所有订阅者广播
function broadcast(convId, payload) {
  const conv = getConv(convId);
  const data = JSON.stringify(payload);
  conv.subscribers.forEach((ws) => {
    if (ws.readyState === 1) ws.send(data);
  });
}

const server = http.createServer((req, res) => {
  // 简单健康检查
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, service: "NimuChat", time: new Date().toISOString() }));
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.userId = null;   // 用户标识（由 auth 消息设置）
  ws.convId = null;   // 当前订阅的会话

  ws.on("message", (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", message: "无效的 JSON" }));
      return;
    }

    switch (msg.type) {
      case "auth":
        // 鉴权：token 验证（演示版直接信任 token 里的 userId）
        // 生产环境请替换为 JWT 验证
        if (!msg.userId) {
          ws.send(JSON.stringify({ type: "error", message: "缺少 userId" }));
          return;
        }
        ws.userId = msg.userId;
        ws.send(JSON.stringify({ type: "auth_ok", userId: msg.userId }));
        break;

      case "subscribe":
        // 订阅会话：加入该会话的消息广播组
        if (!msg.conversationId) {
          ws.send(JSON.stringify({ type: "error", message: "缺少 conversationId" }));
          return;
        }
        if (ws.convId) {
          getConv(ws.convId).subscribers.delete(ws);
        }
        ws.convId = msg.conversationId;
        getConv(ws.convId).subscribers.add(ws);
        ws.send(JSON.stringify({ type: "subscribed", conversation_id: msg.conversationId }));
        break;

      case "message":
        // 发送消息：校验内容与会话
        if (!msg.conversationId || !msg.content) {
          ws.send(JSON.stringify({ type: "error", message: "缺少 conversationId 或 content" }));
          return;
        }
        if (!ws.convId) {
          ws.send(JSON.stringify({ type: "error", message: "请先 subscribe" }));
          return;
        }
        const message = {
          id: ++msgSeq,
          conversation_id: msg.conversationId,
          sender_id: ws.userId,
          content: String(msg.content).slice(0, 2000),
          timestamp: new Date().toISOString(),
        };
        const conv = getConv(msg.conversationId);
        conv.messages.push(message);
        broadcast(msg.conversationId, { type: "message", message });
        break;

      case "history":
        // 拉取历史消息
        if (!msg.conversationId) {
          ws.send(JSON.stringify({ type: "error", message: "缺少 conversationId" }));
          return;
        }
        const histConv = getConv(msg.conversationId);
        ws.send(JSON.stringify({ type: "history", conversation_id: msg.conversationId, messages: histConv.messages }));
        break;
    }
  });

  ws.on("close", () => {
    if (ws.convId) getConv(ws.convId).subscribers.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`NimuChat server running at ws://localhost:${PORT}`);
});
