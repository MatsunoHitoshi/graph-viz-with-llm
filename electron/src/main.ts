import { is } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain } from "electron";
import { getPort } from "get-port-please";
import { startServer } from "next/dist/server/lib/start-server";
import { join } from "path";

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "preload.ts"),
      nodeIntegration: true,
    },
  });

  mainWindow.on("ready-to-show", () => mainWindow.show());

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

// import { app, BrowserWindow } from "electron";
// import serve from "electron-serve";
// import path from "path";

// const appServe = app.isPackaged
//   ? serve({
//       directory: path.join(__dirname, "../out"),
//     })
//   : null;

// const createWindow = () => {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     title: "ArsTraverse",
//     webPreferences: {
//       nodeIntegration: true,
//       contextIsolation: false,
//     },
//   });

//   if (app.isPackaged && appServe) {
//     void appServe(win).then(() => {
//       void win.loadURL("app://-");
//     });
//   } else {
//     void win.loadURL("http://localhost:3000");
//     win.webContents.openDevTools();
//     win.webContents.on("did-fail-load", (e, code, desc) => {
//       void win.webContents.reloadIgnoringCache();
//     });
//   }
// };

// app.on("ready", () => {
//   createWindow();
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
