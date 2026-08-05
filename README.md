# Ladder-Duel
## HOW TO RUN
### Step 1: Open the Game in Ubuntu System
```
# in Ubuntu (wsl)
ubuntu
cd ~/reactclass/Ladder-Duel
npm run dev
```

### Step 2 : Open Powershell 
Open Powersell as Administrator:
``` 
# in Windows System(Powershell)
cd \\wsl.localhost\Ubuntu\root\reactclass\Ladder-Duel
powershell -ExecutionPolicy Bypass -File .\scripts\Enable-WslMirroredFirewall.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\Enable-WslLanProxy.ps1

# when you want to close the game:
powershell -ExecutionPolicy Bypass -File .\scripts\Disable-WslLanProxy.ps1
```

     