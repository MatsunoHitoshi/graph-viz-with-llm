// electron-window.d.ts
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void;
        // Define other ipcRenderer methods you use here
      };
    };
  }
}

export {};
