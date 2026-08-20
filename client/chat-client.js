// chat-client.js - NimuChat 前端客户端（零依赖）
// 用法:
//   const chat = new NimuChat('ws://localhost:3001', { userId: 'user1' });
//   chat.connect();
//   chat.on('message', (msg) => console.log(msg));
//   chat.send('conv_1', '你好');

(function (global) {
  "use strict";

  class NimuChat {
    /**
     * @param {string} url       WebSocket 服务地址，如 ws://localhost:3001
     * @param {object} options   { userId, autoReconnect, reconnectDelay }
     */
    constructor(url, options = {}) {
      this.url = url;
      this.userId = options.userId || null;
      this.autoReconnect = options.autoReconnect !== false;
      this.reconnectDelay = options.reconnectDelay || 3000;

      this.ws = null;
      this.convId = null;
      this.listeners = {};
      this._shouldReconnect = false;
    }

    // ---- 事件 ----
    on(event, fn) {
      (this.listeners[event] = this.listeners[event] || []).push(fn);
      return this;
    }
    _emit(event, payload) {
      (this.listeners[event] || []).forEach((fn) => fn(payload));
    }

    // ---- 连接 ----
    connect() {
      this._shouldReconnect = this.autoReconnect;
      this._open();
    }
    _open() {
      const ws = new WebSocket(this.url);
      this.ws = ws;

      ws.onopen = () => {
        this._emit("open");
        // 自动认证
        if (this.userId) this._send({ type: "auth", userId: this.userId });
      };

      ws.onmessage = (e) => {
        let msg;
        try { msg = JSON.parse(e.data); } catch (err) { return; }
        this._handle(msg);
      };

      ws.onclose = () => {
        this._emit("close");
        if (this._shouldReconnect) {
          setTimeout(() => this._open(), this.reconnectDelay);
        }
      };

      ws.onerror = (e) => this._emit("error", e);
    }

    _handle(msg) {
      switch (msg.type) {
        case "auth_ok":
          this._emit("auth", msg);
          break;
        case "subscribed":
          this._emit("subscribed", msg);
          break;
        case "message":
          this._emit("message", msg.message);
          break;
        case "history":
          this._emit("history", msg.messages);
          break;
        case "error":
          this._emit("error", msg);
          break;
      }
    }

    _send(obj) {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(obj));
      }
    }

    // ---- 公开 API ----
    subscribe(conversationId) {
      this.convId = conversationId;
      this._send({ type: "subscribe", conversationId });
    }
    send(conversationId, content) {
      this._send({ type: "message", conversationId, content });
    }
    history(conversationId) {
      this._send({ type: "history", conversationId });
    }
    disconnect() {
      this._shouldReconnect = false;
      if (this.ws) this.ws.close();
    }
  }

  global.NimuChat = NimuChat;
})(typeof window !== "undefined" ? window : globalThis);
