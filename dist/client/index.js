import "../chunk-3RG5ZIWI.js";

// src/client/context.tsx
import React, { useRef } from "react";
import { createContext, useContext, useEffect } from "react";
var WebSocketContext = createContext(null);
WebSocketContext.displayName = "WebSocketContext";
var WebSocketConsumer = WebSocketContext.Consumer;
function WebSocketProvider(p) {
  const clientRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
    const client = new WebSocket(p.url, p.protocols);
    if (p.binaryType) client.binaryType = p.binaryType;
    clientRef.current = client;
    return () => {
      client.close();
      clientRef.current = null;
    };
  }, [p.url, p.protocols, p.binaryType]);
  return /* @__PURE__ */ React.createElement(WebSocketContext.Provider, { value: clientRef.current }, p.children);
}
function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === void 0)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
}
export {
  WebSocketConsumer,
  WebSocketContext,
  WebSocketProvider,
  useWebSocket
};
