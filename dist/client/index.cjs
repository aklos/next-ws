"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var client_exports = {};
__export(client_exports, {
  WebSocketConsumer: () => WebSocketConsumer,
  WebSocketContext: () => WebSocketContext,
  WebSocketProvider: () => WebSocketProvider,
  useWebSocket: () => useWebSocket
});
module.exports = __toCommonJS(client_exports);

// src/client/context.tsx
var import_react = __toESM(require("react"), 1);
var import_react2 = require("react");
var WebSocketContext = (0, import_react2.createContext)(null);
WebSocketContext.displayName = "WebSocketContext";
var WebSocketConsumer = WebSocketContext.Consumer;
function WebSocketProvider(p) {
  const clientRef = (0, import_react.useRef)(null);
  (0, import_react2.useEffect)(() => {
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
  return /* @__PURE__ */ import_react.default.createElement(WebSocketContext.Provider, { value: clientRef.current }, p.children);
}
function useWebSocket() {
  const context = (0, import_react2.useContext)(WebSocketContext);
  if (context === void 0)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return context;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  WebSocketConsumer,
  WebSocketContext,
  WebSocketProvider,
  useWebSocket
});
