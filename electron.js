import  {app, BrowserWindow} from 'electron'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })
  win.maximize()
  win.loadFile('dist-electron/index.html')

}

app.whenReady().then(() => {
  createWindow()
})