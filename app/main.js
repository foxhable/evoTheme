const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDev = require('electron-is-dev')
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transport.file.level = 'info'


const { access, appendFile, mkdir, readFile, writeFile } = require('fs/promises')
const { constants } = require('fs')
const path = require('path')
const { homedir } = require('os')

const homeDir = homedir()
const appDocsPath = path.join(homeDir, 'Documents', 'evoRand')
const appDataFilePath = path.join(homeDir, 'Documents', 'evoRand', 'data.json')

if (require('electron-squirrel-startup')) return app.quit();

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    backgroundColor: '#222222',
    // frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'))
  mainWindow.removeMenu()
}

app.on('ready', () => {
  if (!isDev) autoUpdater.checkForUpdates()
  createWindow
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('getData', (e) => {
  access(appDataFilePath, constants.F_OK)
    .catch(err => mkdir(appDocsPath))
    .then(() => {
      return access(appDataFilePath, constants.F_OK)
    })
    .catch(err => {
      const standartData = { "nCompleted": [], "completed": [] }
      return appendFile(appDataFilePath, JSON.stringify(standartData))
    })
    .then(() => {
      return readFile(appDataFilePath, { encoding: 'utf-8' })
    })
    .then(data => e.returnValue = JSON.parse(data))
})

ipcMain.on('saveData', (e, data) => {
  writeFile(appDataFilePath, data)
    .catch((err) => console.log(err))
    .then(() => { return e.returnValue = 'data Saved' })
})

autoUpdater.on('checking-for-update', () => {
  console.log('check for updates')
})

autoUpdater.on('update-available', (info) => {
  console.log('update available')
  console.log(info)
})

autoUpdater.on('update-not-available', (info) => { 
  console.log('update not available')
})

autoUpdater.on('download-progress', (progress) => { 
  console.log('Progress', progress)
})

autoUpdater.on('update-downloaded', (info) => { 
  console.log('Update downloaded')
  autoUpdater.quitAndInstall()
})

autoUpdater.on('error', (error) => {
  console.log(error)
})