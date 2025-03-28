import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
    },
    // kiosk: true,
    // fullscreen: true,
    // frame: false,

    // resizable: false,
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

  globalShortcut.register("ctrl+q", function () {
    mainWindow.close();
    app.quit();
  });

  const loadURL = async () => {
    if (is.dev) {
      void mainWindow.loadURL("http://localhost:3000");
    } else {
      try {
        const port = await startNextJSServer();
        console.log("Next.js server started on port:", port);
        void mainWindow.loadURL(`http://localhost:${port}`);
      } catch (error) {
        console.error("Error starting Next.js server:", error);
      }
    }
  };

  void loadURL();
  return mainWindow;
};

const startNextJSServer = async () => {
  try {
    const nextJSPort = await getPort({ portRange: [30_011, 50_000] });
    const webDir = join(app.getAppPath(), "app");

    await startServer({
      dir: webDir,
      isDev: false,
      hostname: "localhost",
      port: nextJSPort,
      customServer: true,
      allowRetry: false,
      keepAliveTimeout: 5000,
      minimalMode: true,
    });

    return nextJSPort;
  } catch (error) {
    console.error("Error starting Next.js server:", error);
    throw error;
  }
};

void app.whenReady().then(() => {
  createWindow();

  ipcMain.on("ping", () => console.log("pong"));
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
