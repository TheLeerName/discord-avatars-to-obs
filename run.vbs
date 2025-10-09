Set shell = CreateObject("Wscript.Shell")
shell.Run "assets\_hidden.bat", 0, False
shell.Run "assets\_visible.bat", 1, False