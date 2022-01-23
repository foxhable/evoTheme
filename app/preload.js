const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  data: {
    get: async function() {
      return ipcRenderer.sendSync('getData')
    },

    save: (data) => {
      ipcRenderer.sendSync('saveData', data)
    }
  }
})