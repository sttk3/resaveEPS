res := main(A_Args[1], A_Args[2])
Return res

main(jsxCode, argv) {
  app := getApp()
  if (!app) {
    Throw "Please start Illustrator and try again."
    Return
  }
  res := app.DoJavaScript(jsxCode, arrayToComArray([argv]))
  Return res
}

; ahkの配列からComObjArrayを生成する
arrayToComArray(arr) {
  len := arr.MaxIndex()
  comArray :=  ComObjArray(VT_VARIANT := 12, len)
  for i, value in arr {
    comArray[i - 1] := value
  }
  return comArray
}

getApp() {
  ; Illustratorのウインドウからアプリのパスを取得し，変数appPathに収める
  WinGet, appPath, ProcessPath, ahk_exe Illustrator.exe
  if (appPath == "") {
    Return
  }
  
  ; アプリのパスからバージョンを取得する。16.0.0.682みたいな形式になる
  fs := ComObjCreate("Scripting.FileSystemObject")
  versionArray := StrSplit(fs.GetFileVersion(appPath), ".")
  versionStr := versionArray[1]
  
  ; バージョンごとにCLSIDまたはProgIDを決める
  baseAppId := "Illustrator.Application."
  Switch versionStr
  {
    Case 10:
      appId := baseAppId . "1"
    Case 11:
      appId := baseAppId . "2"
    Case 12:
      appId := baseAppId . "3"
    Case 13:
      appId := "{743F09D0-5A60-472F-93A4-4C761F332103}"
    Case 14:
      appId := baseAppId . "CS4"
    Case 15:
      appId := baseAppId . "CS5"
    Case 16:
      appId := "{63755935-C25A-42DF-87A1-51F144A0C216}"
    Case 17:
      appId := baseAppId . "CC"
    Case 18:
      appId := baseAppId . "CC.2014"
    Case 19:
      appId := baseAppId . "CC.2015"
    Case 20:
      appId := baseAppId . "CC.2015.3"
    Case 21:
      appId := baseAppId . "CC.2017"
    Case 22:
      appId := baseAppId . "CC.2018"
    Case 23:
      appId := baseAppId . "CC.2019"
    Default:
      appId := baseAppId . versionStr
  }
  
  Return ComObjActive(appId)
}