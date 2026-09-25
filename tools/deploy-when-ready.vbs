' Runs deploy-when-ready.mjs with no visible window. Used by the Windows scheduled task
' "Portfolio deploy when ready" (hourly; the script deletes the task once the live site is current).
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "C:\Users\shaol\Projects\resume-website"
sh.Run """C:\Program Files\nodejs\node.exe"" ""C:\Users\shaol\Projects\resume-website\tools\deploy-when-ready.mjs""", 0, False
