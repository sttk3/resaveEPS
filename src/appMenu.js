const { app, Menu } = require('electron') ;

function set() {
  const fileSubMenu = [
    {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }
  ] ;
  
  // Windows特有の処理
  if(process.platform === 'win32') {
    fileSubMenu.push(
      {
        label: `Quit ${app.name}`,
        accelerator: 'CmdOrCtrl+Q',
        role: 'quit'
      }
    ) ;
  }
  
  // テンプレートの定義
  const template = [
    {
      label: 'File',
      submenu: fileSubMenu
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: (item, focusedWindow) => {focusedWindow && focusedWindow.reload() ;}
        }
      ]
    }
  ] ;

  // macOS特有の処理
  if(process.platform === 'darwin') {
    // テンプレート先頭にメインメニューを追加
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ],
    }) ;
    
    // テンプレート末尾にウィンドウメニューを追加
    template.push({
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' }
      ]
    }) ;
  } else {
    template
  }

  // テンプレートからMenuオブジェクトを作成
  const appMenu = Menu.buildFromTemplate(template) ;

  // 作成したMenuオブジェクトをアプリケーションに設定
  Menu.setApplicationMenu(appMenu) ;
}

module.exports = {
  set
} ;