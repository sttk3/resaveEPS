const { app, BrowserWindow, dialog, ipcMain, Notification } = require('electron') ;
const { spawnSync, execFileSync } = require('child_process') ;
const fs = require('fs') ;
const path = require('path') ;
const appMenu = require('./appMenu.js') ;

// 二重起動の禁止
const gotTheLock = app.requestSingleInstanceLock() ;
if(!gotTheLock) {
  app.quit() ;
}

let global_argv = [] ;
let win, dropTimer ;
function createWindow() {
  win = new BrowserWindow({
    width: 500, 
    height: 300,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    }
  }) ;
  win.loadURL(`file://${__dirname}/index.html`) ;
  
  //win.webContents.openDevTools() ;
  
  win.webContents.on('did-finish-load', () => {
    win.show() ;
    win.focus() ;
  }) ;
  
  win.on('closed', () => {
    win = null ;
  }) ;
}

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit() ;
  }
}) ;
  
app.on('activate', () => {
  if(win === null) {
    createWindow() ;
  }
}) ;

app.on('ready', () => {
  appMenu.set() ;
  createWindow() ;
}) ;

app.on('will-finish-launching', () => {
  /*
    winでアプリアイコンにファイルがドロップされたときの処理。
    process.argvから自身のパスを除外して対象ファイルの配列とし，次の段階に進む
  */
  if(process.platform === 'win32') {
    global_argv = process.argv.slice(1) ;
    if(global_argv.length) {
      dropItemsOnApp() ;
    }
  }
  
  /*
    macでアプリアイコンにファイルがドロップされたときは，1つひとつのファイルごとにopen-fileイベントが発生する。
    同梱スクリプトへの外注には不都合なので，一定時間待って次のファイルがドロップされたらひとまとまりの配列とする。
    供給が途切れたら次の段階に進む
  */
  app.on('open-file', (event, filePath) => {
    event.preventDefault() ;
    if(dropTimer) {clearTimeout(dropTimer) ;}
    global_argv.push(filePath) ;
    dropTimer = setTimeout(dropItemsOnApp, 300) ;
  }) ;
}) ;

/**
  * ウィンドウにドロップされたファイルに対し処理を実行する
  * @param {Array} pathArray ファイルパスのArray
  * @return {}
*/
ipcMain.on('drop', (event, pathArray) => {
  const targetItems = selectTargetItems(pathArray) ;
  if(targetItems.length) {
    execScript(targetItems) ;
  }
}) ;

/**
  * アプリアイコンにドロップされたファイルに対し処理を実行する。
  * ウィンドウにドロップされたときの処理を呼び出す手もあるが，ウィンドウが使用可能になるまで時間がかかるので，
  * 別にしておいたほうが待ち時間が少なくて済む
  * @return {}
*/
function dropItemsOnApp() {
  const targetItems = selectTargetItems(global_argv) ;
  global_argv = [] ;
  if(targetItems.length) {
    execScript(targetItems) ;
  }
  app.quit() ;
}

/**
  * 指定したファイルに対しスクリプトを実行する
  * @param {Array} targetItems ファイルパスのArray
  * @return {}
*/
function execScript(targetItems) {
  const argv = targetItems.join('\n') ;
  const resourcePath = path.join(__dirname, '..', 'scripts') ;
  const hostScriptPath = path.join(resourcePath, 'hostscript.jsx') ;
  const hostScriptCode = fs.readFileSync(hostScriptPath) ;
  
  // スクリプトを実行する
  let commandName, commandArray, stdout, stderror ;
  if(process.platform === 'win32') {
    commandName = 'exec.exe' ;
    const exeFile = path.join(resourcePath, commandName) ;
    commandArray = [hostScriptCode, argv] ;
    
    try {
      stdout = execFileSync(exeFile, commandArray) ;
      stderror = '' ;
    } catch(e) {
      stderror = e.toString() ;
    }
  } else {
    commandName = 'osascript' ;
    commandArray = ['-e', fs.readFileSync(path.join(resourcePath, 'exec.applescript')), hostScriptCode, argv] ;
    
    const spawn = spawnSync(commandName, commandArray) ;
    stderror = spawn.stderr.toString() ;
    stdout = spawn.stdout ;
  }
  if(stderror !== '') {
    dialog.showErrorBox('ダイアログ', stderror) ;
  }
  
  return stdout.toString() ;
}

/**
  * 拡張子ai/epsのファイルのみ集めた新しい配列を返す
  * @param {Array} arr 対象のArray
  * @return {Array}
*/
function selectTargetItems(arr) {
  const patternAi = /\.(?:eps|ai)$/i ;
  return arr.filter((aItem) => {return patternAi.test(aItem) ;}) ;
}

/**
  * 通知する。アプリが通知できるようになるまで待つ，ユーザーが通知を読める程度に
  * アプリ終了を遅らせるなど，工夫が必要なので使い所が難しい
  * @param {String} body 本文
  * @param {String} [title] 題。省略時はアプリ名
  * @return {}
*/
function displayNotification(body, title = app.name) {
  const notification = new Notification({body, title, silent: true}) ;
  notification.show() ;
}