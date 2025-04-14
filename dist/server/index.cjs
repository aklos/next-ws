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

// src/server/index.ts
var server_exports = {};
__export(server_exports, {
  getHttpServer: () => getHttpServer,
  getWebSocketServer: () => getWebSocketServer,
  setHttpServer: () => setHttpServer,
  setWebSocketServer: () => setWebSocketServer,
  setupWebSocketServer: () => setupWebSocketServer
});
module.exports = __toCommonJS(server_exports);

// src/server/setup.ts
var logger3 = __toESM(require("next/dist/build/output/log.js"), 1);
var import_ws = require("ws");

// src/server/helpers/persistent.ts
var logger = __toESM(require("next/dist/build/output/log.js"), 1);
function getEnvironmentMeta() {
  const isCustomServer = !process.title.startsWith("next-");
  const isMainProcess = process.env.NEXT_WS_MAIN_PROCESS === "1";
  const isDevelopment = process.env.NODE_ENV === "development";
  return { isCustomServer, isMainProcess, isDevelopment };
}
function mainProcessOnly(fnName) {
  if (process.env.NEXT_WS_SKIP_ENVIRONMENT_CHECK === "1") return;
  const meta = getEnvironmentMeta();
  if (!meta.isMainProcess) {
    throw new Error(
      `[next-ws] Attempt to invoke '${fnName}' outside the main process.
You may be attempting to interact with the WebSocket server outside of a SOCKET handler. This will fail in production, as Next.js employs a worker process for routing, which do not have access to the WebSocket server on the main process.
You can resolve this by using a custom server.`
    );
  } else if (!meta.isCustomServer) {
    logger.warnOnce(
      `[next-ws] Caution: The function '${fnName}' was invoked without a custom server.
This could lead to unintended behaviour, especially if you're attempting to interact with the WebSocket server outside of a SOCKET handler.
Please note, while such configurations might function during development, they will fail in production. This is because Next.js employs a worker process for routing in production, which do not have access to the WebSocket server on the main process.
You can resolve this by using a custom server.`
    );
  }
}
var NextWsHttpServer = Symbol.for("NextWs_HttpServer");
function setHttpServer(server) {
  Reflect.set(globalThis, NextWsHttpServer, server);
}
function getHttpServer() {
  mainProcessOnly("getHttpServer");
  return Reflect.get(globalThis, NextWsHttpServer);
}
function useHttpServer(server) {
  const existing = getHttpServer();
  if (existing) return existing;
  if (server) setHttpServer(server);
  return server;
}
var NextWsWebSocketServer = Symbol.for("NextWs_WebSocketServer");
function setWebSocketServer(wsServer) {
  Reflect.set(globalThis, NextWsWebSocketServer, wsServer);
}
function getWebSocketServer() {
  mainProcessOnly("getWebSocketServer");
  return Reflect.get(globalThis, NextWsWebSocketServer);
}
function useWebSocketServer(wsServer) {
  const existing = getWebSocketServer();
  if (existing) return existing;
  if (wsServer) setWebSocketServer(wsServer);
  return wsServer;
}

// src/server/helpers/route.ts
var import_node_url = require("url");
var logger2 = __toESM(require("next/dist/build/output/log.js"), 1);
function createRouteRegex(routePattern) {
  const escapedPattern = routePattern.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const paramRegex = escapedPattern.replace(/\\\[([a-zA-Z0-9_]+)\\\]/g, "(?<$1>[^/]+)").replace(/\\\[(?:\\\.){3}([a-zA-Z0-9_]+)\\\]/g, "(?<rest_$1>.+)");
  return new RegExp(`^${paramRegex}$`);
}
function getRouteParams(routePattern, routePath) {
  const routeRegex = createRouteRegex(routePattern);
  const match = routePath.match(routeRegex);
  if (!match) return null;
  if (!match.groups) return {};
  const params = {};
  for (let [k, v] of Object.entries(match.groups)) {
    if (k.startsWith("rest_")) {
      k = k.slice(5);
      v = v.split("/");
    }
    Reflect.set(params, k, v);
  }
  return params;
}
function resolvePathToRoute(nextServer, requestPath) {
  const basePath = nextServer.serverOptions.conf.basePath;
  const routes = {
    // @ts-expect-error - appPathRoutes is protected
    ...nextServer.appPathRoutes,
    // @ts-expect-error - getAppPathRoutes is protected
    ...nextServer.getAppPathRoutes()
  };
  for (const [routePath, [filePath]] of Object.entries(routes)) {
    const realPath = `${basePath}${routePath}`;
    const routeParams = getRouteParams(realPath, requestPath);
    if (routeParams) return { filePath, routeParams };
  }
  return null;
}
async function importRouteModule(nextServer, filePath) {
  try {
    if ("hotReloader" in nextServer) {
      await nextServer.hotReloader?.ensurePage({
        page: filePath,
        clientOnly: false
      });
    } else if ("ensurePage" in nextServer) {
      await nextServer.ensurePage({ page: filePath, clientOnly: false });
    } else {
      logger2.warnOnce(
        "[next-ws] unable to ensure page, you may need to open the route in your browser first so Next.js compiles it"
      );
    }
  } catch {
  }
  const buildPagePath = nextServer.getPagePath(filePath);
  const module2 = await importModule(buildPagePath);
  if (module2?.default instanceof Promise) {
    const resolvedDefault = await module2.default;
    return {
      ...module2,
      default: resolvedDefault
    };
  }
  return module2;
}
async function importModule(modulePath) {
  const moduleUrl = (0, import_node_url.pathToFileURL)(modulePath).toString();
  try {
    return import(moduleUrl);
  } catch (requireError) {
    try {
      return require(modulePath);
    } catch (requireError2) {
      console.error(`Both import and require failed for ${modulePath}`);
      throw requireError2;
    }
  }
}
function getSocketHandler(routeModule) {
  return routeModule?.default?.routeModule?.userland?.SOCKET ?? routeModule?.routeModule?.userland?.SOCKET ?? routeModule?.default?.handlers?.SOCKET ?? routeModule?.handlers?.SOCKET;
}

// src/server/setup.ts
function setupWebSocketServer(nextServer) {
  process.env.NEXT_WS_MAIN_PROCESS = String(1);
  process.env.NEXT_WS_SKIP_ENVIRONMENT_CHECK = String(1);
  const httpServer = useHttpServer(nextServer.serverOptions?.httpServer);
  const wsServer = useWebSocketServer(new import_ws.WebSocketServer({ noServer: true }));
  process.env.NEXT_WS_SKIP_ENVIRONMENT_CHECK = String(0);
  if (!httpServer)
    return logger3.error("[next-ws] was not able to find the HTTP server");
  if (!wsServer)
    return logger3.error("[next-ws] was not able to find the WebSocket server");
  logger3.ready("[next-ws] has started the WebSocket server");
  httpServer.on("upgrade", async (request, socket, head) => {
    const url = new URL(request.url ?? "", "ws://next");
    const pathname = url.pathname;
    if (pathname.includes("/_next")) return;
    const routeInfo = resolvePathToRoute(nextServer, pathname);
    if (!routeInfo) {
      logger3.error(`[next-ws] could not find module for page ${pathname}`);
      return socket.destroy();
    }
    const routeModule = await importRouteModule(nextServer, routeInfo.filePath);
    if (!routeModule) {
      logger3.error(`[next-ws] could not find module for page ${pathname}`);
      return socket.destroy();
    }
    const socketHandler = getSocketHandler(routeModule);
    if (!socketHandler || typeof socketHandler !== "function") {
      logger3.error(`[next-ws] ${pathname} does not export a SOCKET handler`);
      return socket.destroy();
    }
    return wsServer.handleUpgrade(request, socket, head, async (c, r) => {
      const routeContext = { params: routeInfo.routeParams };
      const handleClose = await socketHandler(c, r, wsServer, routeContext);
      if (typeof handleClose === "function")
        c.once("close", () => handleClose());
    });
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getHttpServer,
  getWebSocketServer,
  setHttpServer,
  setWebSocketServer,
  setupWebSocketServer
});
