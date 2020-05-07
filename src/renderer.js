const ipcRenderer = window.ipcRenderer ;

document.ondragover = 
document.ondragenter = 
document.ondrop = 
document.ondropleave = (event) => {
    event.preventDefault() ;
    switch(event.type) {
      case 'dragover':
        event.dataTransfer.dropEffect = 'copy' ;
      case 'dragenter':
      case 'dropleave':
        return ;
        break ;
    }
    
    // ドロップされたファイルのパスを取得してArrayにする
    const pathArray = [] ;
    for(let aItem of event.dataTransfer.files) {
      pathArray.push(aItem.path) ;
    }
    
    // main processに送る
    ipcRenderer.send('drop', pathArray) ;
} ;