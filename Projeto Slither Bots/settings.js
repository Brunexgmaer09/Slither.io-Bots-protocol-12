'use strict';
const snakeyRainVersion = "4.5.1"

let uiHidden = false;
let stopBots = true;
let lastKeySR = "";
let wsSnakeyRain = null;
let stateSR = 0;
let ownIDSR = 0;
let attemptsSR = 0;
let pingIntervalSR = 0;
let slitherIpPort = null;
let ownXPos = 0;
let ownYPos = 0;
let scaleObjects = [];
let ntlData = [];
let userTargettedID = 0;
let serverSR = "96.43.143.90";
let firstPort = 8011;
let attempts = 10;
let currentPort = firstPort;
let mouseAngle = null;


let directionalState = {
    "follow": true,
    "unfollow": false,
    "random": false,
    "straight": false,
    "copy": false,
    "tornado": false,
    "rain": false,
    "followMouse": false,
    "unfollowMouse": false,
    "circleCW": false,
    "circleCCW": false,
    "target": false,
    "heart": false,
}

let boostState = {
    "boost": false,
}

let container = null;
let mainContainer = null;
let logoDiv = null;
let botsDiv = null;
let directionalDiv = null;
let boostDiv = null;
let connectBtn = null;

const defaultSettingsSR = [{
        "username": "snakeyuser",
        "password": "wormfood",
        "version": `${snakeyRainVersion}`
    }, {
        "boost": "x",
        "follow": "1",
        "random": "2",
        "straight": "3",
        "copy": "4",
        "mouse": "5",
        "rain": "6",
        "tornado": "7",
        "circle": "F1",
        "target": "F2",
        "heart": "F3",
        "startAndStopBots": "=",
        "togglePlayerCount": "F8",
        "hide": "F9",
        "openSettings": "F10",

    },
    [

        {
            "id": "bot 0",
            "nickname": "SnakeyRain Bot",
            "disabled": false,
            "name": "SnakeyRain",
            "skin": "uu",
            "tag": 12,
            "cosmetic": 11
        }

    ]
]

let settingsSR = null;
let snakeyRainLogin = null;
let snakeyRainKeys = null;
let snakeyRainCharacters = null;

let loadSR = null;
let selectBotsElement = null;
let snakeySettingsDiv = null;
let snakeySettingsBtn = null;
let buttonContainerSR = null;
let settingsMenuSR = null;

setSettings();
createSettingsSR();

function setSettings() {
    let settingsString = localStorage.getItem("snakeyRainSettings");
    if (settingsString) {
        settingsSR = JSON.parse(settingsString);
    } else {
        settingsSR = structuredClone(defaultSettingsSR);
    }
    snakeyRainLogin = settingsSR[0];
    snakeyRainKeys = settingsSR[1];
    snakeyRainCharacters = settingsSR[2];
}

function createSettingsSR() {
    const mutationObserver = new MutationObserver(() => {
        const buttonContainerSR = document.getElementsByClassName("col-md-4")[0];
        buttonContainerSR.childNodes[3].insertAdjacentElement('afterend', snakeySettingsDiv)
        snakeySettingsDiv.appendChild(snakeySettingsBtn);
        mutationObserver.disconnect();
    })
    const loginDiv = document.getElementById("login");

    mutationObserver.observe(loginDiv, {
        childList: true
    });

    snakeySettingsDiv = document.createElement("div");
    snakeySettingsDiv.setAttribute("style", "line-height: 40px;text-align: center;border-radius: 4px;padding:5px 0px 8px; ");
    snakeySettingsBtn = document.createElement("button");
    snakeySettingsBtn.setAttribute("style", "width: 100%;height: 28px;border-radius: 4px; background-image: linear-gradient(5deg, rgba(144, 179, 255), rgba(255,72,255), rgba(255,72,255))!important;");
    snakeySettingsBtn.setAttribute("class", "mysb form-control");
    snakeySettingsBtn.setAttribute("onclick", "openSettingsSR()");
    snakeySettingsBtn.innerText = "Snakey Settings"

    settingsMenuSR = document.createElement("div")
    settingsMenuSR.setAttribute("id", "settings-menu");
    settingsMenuSR.style.display = "none"
    settingsMenuSR.innerHTML = `
    <div id = "srsettings-container" class="srsettings-container" spellcheck="false">
    <div class = "heading">
        <div class ="heading-title" id = "heading-title">SankeyRain Settings</div>
        <div class = "heading-btn-container">
            <button onclick="closeSettingsSR()" class = "heading-btn">Close</button>
            <button onclick="resetSettingsSR()" class = "heading-btn" title="Reset all SnakeyRain settings in settings menu to default.">Restore</button>
            <button onclick="document.getElementById('SRloadfile').click();" id = "load-btn-sr" class = "heading-btn" title="Load a settings file from your computer.">Load</button>                
            <input id="SRloadfile" type="file" accept=".json" style="display: none;">
            <button onclick="backupSettingsSR(this)" class = "heading-btn" title="Download a backup of current settings to your computer.">Backup</button>
            
            <button onclick="saveSettingsSR()" class = "heading-btn" title="Save settings file to local storage.">Save</button>
        </div>
        
    </div>
    <form>
    <div class="user-container">
        <table>
            <tr>
                <td><label for="Username" class="user-label">Username:</label></td>
                <td><input class="user-input" type="text" name="Username" id="SR-username" title="The default username is snakeyuser"  autocomplete="username" /></td>
                <td><label for="Password"  class="user-label" >Password:</label></td>
                <td><input class="pass-input" type="password" name="Password" id="SR-password" title="The default password is wormfood" autocomplete="current-password" /></td>
            </tr>
        </table>
    </div>
    </form>
    <div id="char-container" class="char-container">
        <table style=" table-layout: fixed">
            <tr>
                <td colspan="4"><div class="char-heading" >Characters:</div></td> 
            </tr>
            <tr>
                <td colspan="3" class="select-characters"><select id = "select-bots" class="grid-item select-characters" name="characters" id="characters" style = "font-size: 12px;" title="Each character defines the attributes that the bot will spawn with">
                  </select>
                </td>
                <td class ="disable-input">
                    <input type="checkbox" id="disable-char" name="disable" title="If disable is checked, the attributes will be saved but those bots will not spawn" >
                    <label for="disable-char" class ="disable-label" style = "font-size: 12px;"> disable</label>
                </td>
                
                 
            </tr>
            <tr>
                <td class = "add-btn"><button class = "add-btn" onclick="removeBot()" title="Removes selected bot from bot list.">Remove Bot</button></div></td>
                <td class = "add-btn"><button class = "add-btn" onclick="addNewBot()" title="Adds a bot to the bot list.">Add bot</button></td>
            </tr>
            <tr>
                <td class = "nickname-label" ><label for='botname' class = "name-label" style = "font-size: 12px;">Nickname:</label></td>
                <td class = "nickname-input" colspan="3" maxlength="24"><input type='text' id='nicknameSR' title="The nickname you see in the dropdown menu. Max length is 24." class = "name-input" style = "font-size: 12px;"/></td>
            </tr>
            <tr>
                <td class = "name-label" ><label for='botname' class = "name-label" style = "font-size: 12px;">Name:</label></td>
                <td class = "name-input" colspan="3" maxlength="24"><input type='text' id='botnameSR' title="The name this bot spawns with. Max length is 24, use standard characters only" class = "name-input" style = "font-size: 12px;"/></td>
            </tr>
            <tr>
                <td class = "skin-label"><label for='skin' class = "skin-label" style = "font-size: 12px;">Skin:</label></td>
                <td class = "skin-input" colspan="3">
                    <textarea   rows="4" cols="48"  id='skinSR' style = "font-size: 12px; resize: none;" maxlength="250" title="Use a valid ntl skin code from the skin editor. Max length is 250"></textarea>
                </td>
            </tr>
            <tr>
                <td class = "tag-label"><label for='tag' class = "tag-label" style = "font-size: 12px;" title="Click to view the tag directory">Tag:</label></td>
                <td class = "tag-input"><input type='text' class = "tag-input" id='tagSR' style = "font-size: 12px;" title="Accepts values -1 through 301. Values 60-199 will spawn the ntl tag"/></td>
                <td class = "cosmetic-label"><label for='cosmetic' class = "cosmetic-label" style = "font-size: 12px;" title="Click to view the cosmetic directory">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspCosmetic:</label></td>
                <td class="cosmetic-input"><input type='text' list="cosmetic-values" id='cosmeticSR' class="cosmetic-input" style = "font-size: 12px;" title = "Accepts values 0-31 and 255. Press arrow key for a list."/></td>
                <datalist id="cosmetic-values">
                    <option value="255">none</option>
                    <option value="0">green glasses</option>
                    <option value="1">academic cap</option>
                    <option value="2">pink-star glasses</option>
                    <option value="3">headphones</option>
                    <option value="4">eyebrows</option>
                    <option value="5">spike collar</option>
                    <option value="6">funny glasses</option>
                    <option value="7">red cape</option>
                    <option value="8">crown</option>
                    <option value="9">antlers</option>
                    <option value="10">unicorn horn</option>
                    <option value="11">angel wings</option>
                    <option value="12">bat wings</option>
                    <option value="13">gargoyle wings</option>
                    <option value="14">bear ears</option>
                    <option value="15">bunny ears</option>
                    <option value="16">cat ears</option>
                    <option value="17">dreads wig</option>
                    <option value="18">blonde wig</option>
                    <option value="19">red wig</option>
                    <option value="20">black wig</option>
                    <option value="21">green mohawk</option>
                    <option value="22">cat eye glasses</option>
                    <option value="23">spiral glasses</option>
                    <option value="24">round glasses</option>
                    <option value="25">pink/blue glasses</option>
                    <option value="26">heart glasses</option>
                    <option value="27">monocle</option>
                    <option value="28">earflap cap</option>
                    <option value="29">gold glasses</option>
                    <option value="30">baseball cap</option>
                    <option value="31">yellow hardhat</option>
                </datalist>
            </tr>
        </table>
    </div>
    <div class="keybindings-container">
        <table>
            <tr>
                <td colspan="4"><div class="key-heading">Key Bindings:</div></td> 
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='boost' class = "keybinding-label">Boost:</label></td>
                <td><input type='text' id='boost' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='circle' class = "keybinding-label">Circle:</label></td>
                <td><input type='text' id='circle' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='follow' class = "keybinding-label">Follow:</label></td>
                <td><input type='text' id='follow' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='target' class = "keybinding-label">Target:</label></td>
                <td><input type='text' id='target' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='random' class = "keybinding-label">Random:</label></td>
                <td><input type='text' id='random' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='heart' class = "keybinding-label">Heart:</label></td>
                <td><input type='text' id='heart' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='straight' class = "keybinding-label">Straight:</label></td>
                <td><input type='text' id='straight' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='startstop' class = "keybinding-label">Start/Stop Bots:</label></td>
                <td><input type='text' id='startstop' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='copy' class = "keybinding-label">Copy:</label></td>
                <td><input type='text' id='copy' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='toggle-limit' class = "keybinding-label">Toggle Limit:</label></td>
                <td><input type='text' id='toggle-limit' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='mouse' class = "keybinding-label">Mouse:</label></td>
                <td><input type='text' id='mouse' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='hide-ui' class = "keybinding-label">Hide SnakeyRain:</label></td>
                <td><input type='text' id='hide-ui' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='rain' class = "keybinding-label">Rain:</label></td>
                <td><input type='text' id='rain' class = "keybinding-input"/></td>
                <td class = "keybinding-label"><label for='open-srsettings' class = "keybinding-label">Open Settings:</label></td>
                <td><input type='text' id='open-srsettings' class = "keybinding-input"/></td>
            </tr>
            <tr>
                <td class = "keybinding-label"><label for='tornado' class = "keybinding-label">Tornado:</label></td>
                <td><input size="3" type='text' id='tornado' class = "keybinding-input"/></td>
            </tr>
        </table>
    
</div>
        
</div>`
    document.body.appendChild(settingsMenuSR);
    loadSR = document.getElementById("load-btn-sr");
    selectBotsElement = document.getElementById("select-bots");
}

function saveSettingsSR() {
    saveCurrentUserInputs();
    saveCurrentBotInputs();
    saveCurrentKeybindings();
    saveTempSettingsToLocalStorage();
    setSettings();
    appendChat("#Settings saved.")
    sendClearChars();
    sendCharMessages();
}


function closeSettingsSR() {
    settingsMenuSR.style.display = "none"
}

function backupSettingsSR() {
    saveSettingsSR();
    let downloadNode = document.createElement("a");
    downloadNode.style = "display: none";
    downloadNode.download = "SnakeyRain-settings.json";
    downloadNode.href = "data:text/plain;charset=ascii," + encodeURIComponent(JSON.stringify(settingsSR));
    document.body.appendChild(downloadNode);
    downloadNode.click();
    document.body.removeChild(downloadNode);
}

function openSettingsSR() {
    setVersion();
    setUsername();
    setPassword();
    setKeyBindInputs();
    setBotsToSelectMenu();
    setSelectedBotAttributeInputs();
    addSelectEvLis();
    addUpdateSelectMenuEL();
    settingsMenuSR.style.display = ""
}

function resetSettingsSR() {
    if (window.confirm("Are you sure you want to restore all SnakeyRain settings to default?")) {
        settingsSR = structuredClone(defaultSettingsSR);
        setVersion();
        setUsername();
        setPassword();
        setKeyBindInputs();
        setBotsToSelectMenu();
        const selectBots = document.getElementById("select-bots");
        const firstOptionValue = selectBots.firstChild.value;
        selectBots.value = firstOptionValue;
        setSelectedBotAttributeInputs();
    }
}

function setVersion() {
    let headingDiv = document.getElementById("heading-title");
    headingDiv.innerText = `SnakeyRain v${snakeyRainVersion} Settings`
}

function setUsername() {
    document.getElementById("SR-username").value = settingsSR[0].username;
}

function setPassword() {
    document.getElementById("SR-password").value = settingsSR[0].password;
}


function addNewBot() {
    if (settingsSR[2].length === 20) {
        if(!window.playing)alert("Max number of bot characters is 20.")
        return
    }
    let selectMenuLength = document.getElementById("select-bots").options.length

    let botID = "";
    for (let i = 0; i < 20; i++) {
        botID = `bot ${i}`
        const matchingObject = settingsSR[2].find(({
            id
        }) => id === botID);
        if (!matchingObject) break;
        if (matchingObject && i === 19) {
            console.error("No available bot character IDs.")
            return
        }
    }
    settingsSR[2].push({
        "id": botID,
        "nickname": `SnakeyRain Bot ${selectMenuLength + 1}`,
        "disabled": false,
        "name": "SnakeyRain",
        "skin": "uuuuuuuauuuuuuaauuuuuaaauuuuaaaauuuaaaaauuaaaaaauaaaaaaauuaaaaaauuuaaaaauuuuaaaauuuuuaaauuuuuuaa",
        "tag": 12,
        "cosmetic": 11
    })
    setBotsToSelectMenu();
}

function removeBot() {
    if (settingsSR[2].length <= 1) {
        if(!window.playing)alert("Must have at least one bot.")
        return
    }
    let botID = document.getElementById("select-bots").value;
    let newBot = document.getElementById(botID).previousSibling;
    if (!newBot) {
        newBot = document.getElementById(botID).nextSibling;
    }
    let newBotID = newBot.value;
    let botIndex = settingsSR[2].findIndex((element) => element.id === botID)
    settingsSR[2].splice(botIndex, 1);
    setBotsToSelectMenu();
    document.getElementById("select-bots").value = newBotID;
    setSelectedBotAttributeInputs();
}

function saveCurrentBotInputs() {
    let id = document.getElementById("select-bots").value;
    let botIndex = settingsSR[2].findIndex((element) => element.id === id)
    settingsSR[2][botIndex].disabled = document.getElementById("disable-char").checked;
    settingsSR[2][botIndex].nickname = document.getElementById("nicknameSR").value;
    settingsSR[2][botIndex].name = document.getElementById("botnameSR").value;
    settingsSR[2][botIndex].skin = document.getElementById("skinSR").value;
    settingsSR[2][botIndex].tag = document.getElementById("tagSR").value;
    settingsSR[2][botIndex].cosmetic = document.getElementById("cosmeticSR").value;
}

function saveCurrentUserInputs() {
    settingsSR[0].username = document.getElementById("SR-username").value;
    settingsSR[0].password = document.getElementById("SR-password").value;
    settingsSR[0].version = snakeyRainVersion;
}

function saveCurrentKeybindings() {
    settingsSR[1].boost = document.getElementById("boost").value;
    settingsSR[1].follow = document.getElementById("follow").value;
    settingsSR[1].random = document.getElementById("random").value;
    settingsSR[1].straight = document.getElementById("straight").value;
    settingsSR[1].copy = document.getElementById("copy").value;
    settingsSR[1].mouse = document.getElementById("mouse").value;
    settingsSR[1].rain = document.getElementById("rain").value;
    settingsSR[1].tornado = document.getElementById("tornado").value;
    settingsSR[1].circle = document.getElementById("circle").value;
    settingsSR[1].target = document.getElementById("target").value;
    settingsSR[1].heart = document.getElementById("heart").value;
    settingsSR[1].startAndStopBots = document.getElementById("startstop").value;
    settingsSR[1].togglePlayerCount = document.getElementById("toggle-limit").value;
    settingsSR[1].hide = document.getElementById("hide-ui").value;
    settingsSR[1].openSettings = document.getElementById("open-srsettings").value;
}

function saveTempSettingsToLocalStorage() {
    localStorage.removeItem("snakeyRainSettings");
    localStorage.setItem('snakeyRainSettings', JSON.stringify(settingsSR));
}

function addUpdateSelectMenuEL() {
    document.getElementById("char-container").addEventListener("change", function () {
        saveCurrentBotInputs();
        setBotsToSelectMenu();
        setSelectedBotAttributeInputs();
    })
}

function setSelectedBotAttributeInputs() {
    let selectedBotID = document.getElementById("select-bots").value;
    let botObject = settingsSR[2].find((element) => element.id === selectedBotID)
    document.getElementById("disable-char").checked = botObject.disabled;
    document.getElementById("nicknameSR").value = botObject.nickname;
    document.getElementById("botnameSR").value = botObject.name;
    document.getElementById("skinSR").value = botObject.skin;
    document.getElementById("tagSR").value = botObject.tag;
    document.getElementById("cosmeticSR").value = botObject.cosmetic;
}

function setBotsToSelectMenu() {
    let selectBots = document.getElementById("select-bots");
    let selectBotsValue = selectBots.value;
    selectBots.innerHTML = "";
    for (let i = 0; i < settingsSR[2].length; i++) {
        var optionElement = document.createElement('option');
        optionElement.setAttribute("id", settingsSR[2][i].id)
        optionElement.value = settingsSR[2][i].id;
        optionElement.innerHTML = settingsSR[2][i].nickname;
        selectBots.appendChild(optionElement);
    }
    if (selectBotsValue) selectBots.value = selectBotsValue;
}

function addSelectEvLis() {
    selectBotsElement.addEventListener('change', function (e) {
        setSelectedBotAttributeInputs();
    })
}

function setKeyBindInputs() {
    document.getElementById("boost").value = settingsSR[1].boost;
    document.getElementById("follow").value = settingsSR[1].follow;
    document.getElementById("random").value = settingsSR[1].random;
    document.getElementById("straight").value = settingsSR[1].straight;
    document.getElementById("copy").value = settingsSR[1].copy;
    document.getElementById("mouse").value = settingsSR[1].mouse;
    document.getElementById("rain").value = settingsSR[1].rain;
    document.getElementById("tornado").value = settingsSR[1].tornado;
    document.getElementById("circle").value = settingsSR[1].circle;
    document.getElementById("target").value = settingsSR[1].target;
    document.getElementById("heart").value = settingsSR[1].heart;
    document.getElementById("startstop").value = settingsSR[1].startAndStopBots;
    document.getElementById("toggle-limit").value = settingsSR[1].togglePlayerCount;
    document.getElementById("hide-ui").value = settingsSR[1].hide;
    document.getElementById("open-srsettings").value = settingsSR[1].openSettings;
}

function createUI() {
    container = document.createElement("div");
    container.setAttribute("id", "snakeyrain-ui");
    document.body.appendChild(container);

    mainContainer = document.createElement("div");
    mainContainer.setAttribute("id", "main-container");
    container.appendChild(mainContainer);

    logoDiv = document.createElement("div");
    logoDiv.setAttribute("id", "logo");
    logoDiv.setAttribute("class", "snakeylogo");
    mainContainer.appendChild(logoDiv);

    botsDiv = document.createElement("div");
    botsDiv.setAttribute("id", "bots");
    botsDiv.setAttribute("class", "databox");
    mainContainer.appendChild(botsDiv);

    directionalDiv = document.createElement("div");
    directionalDiv.setAttribute("id", "directional");
    directionalDiv.setAttribute("class", "databox");
    mainContainer.appendChild(directionalDiv);

    boostDiv = document.createElement("div");
    boostDiv.setAttribute("id", "boost");
    boostDiv.setAttribute("class", "databox");
    mainContainer.appendChild(boostDiv);

    connectBtn = document.createElement("button");
    connectBtn.setAttribute("id", "connect-button");
    connectBtn.setAttribute("class", "databox");
    connectBtn.onclick = () => {
        connectBtn.disabled = true;
        setTimeout(function () {
            connectBtn.disabled = false;
        }, 1000);
        if (!wsSnakeyRain) {
            connectToBotServer(currentPort);
        } else {
            disconnectFromBotServer();
        }

    };
    mainContainer.appendChild(connectBtn);
}

function updateBotDiv(botCount) {
    botsDiv.innerHTML = `<p>Bots: ${botCount}</p>`;
}



function updateDirUiAndState(directionalByte) {
    let dirState = "";
    switch (directionalByte) {
        case 1:
            dirState = "Follow";
            updateDirState("follow");
            break
        case 2:
            dirState = "Unfollow";
            updateDirState("unfollow");
            break
        case 3:
            dirState = "Random";
            updateDirState("random");
            break
        case 4:
            dirState = "Straight";
            updateDirState("straight");
            break
        case 5:
            dirState = "Copy";
            updateDirState("copy");
            break
        case 6:
            dirState = "Follow Mouse";
            updateDirState("followMouse");
            break
        case 7:
            dirState = "Unfollow Mouse";
            updateDirState("unfollowMouse");
            break
        case 8:
            dirState = "Rain";
            updateDirState("rain");
            break
        case 9:
            dirState = "Tornado";
            updateDirState("tornado");
            break
        case 10:
            dirState = "Circle CW"
            updateDirState("circleCW");
            break
        case 11:
            dirState = "Circle CCW"
            updateDirState("circleCCW");
            break
        case 12:
            dirState = "Target"
            updateDirState("target");
            break
        case 13:
            dirState = "Heart"
            updateDirState("heart");
            break
    }
    directionalDiv.innerHTML = `<p style="background-color: rgba(72,255,255,0.6);">${dirState}</p>`;
}

function updateDirDivText(text) {
    directionalDiv.innerHTML = `<p style="background-color: rgba(72,255,255,0.6);">${text}</p>`;
}

function updateBoostDiv(boostStateByte) {
    let color = "";
    let text = "";

    if (boostStateByte == 0) {
        color = "rgba(255, 72, 255,0.6)";
        text = "No Boost"
    } else {
        color = "rgba(72,255,255,0.6)";
        text = "Boost";
    }
    boostDiv.innerHTML = `<p style="background-color: ${color}">${text}</p>`;
}

function updateConnectButton(text) {
    connectBtn.innerText = `${text}`;
}


createUI();
updateBotDiv(0);
updateDirUiAndState(1);
updateBoostDiv(0);
updateConnectButton("Login");

function connectToBotServer(port) {
    if (attemptsSR > attempts) {
        appendChat(`# No servers available. Try again later.`);
        updateConnectButton("Login");
        wsSnakeyRain = null;
        attemptsSR = 0;
        stateSR = 0;
        currentPort = firstPort;
        return;
    }
    wsSnakeyRain = new WebSocket(`ws://${serverSR}:${port}/`);
    wsSnakeyRain.binaryType = "arraybuffer";
    stateSR = 1;
    attemptsSR++;

    wsSnakeyRain.onopen = function () {
        stateSR = 2;
        const message = new Uint8Array(4 + snakeyRainLogin.username.length + snakeyRainLogin.password.length);
        message[0] = 0;
        message[1] = 2;
        message[2] = snakeyRainLogin.username.length;
        for (let i = 0; i < snakeyRainLogin.username.length; i++) {
            message[i + 3] = snakeyRainLogin.username.charCodeAt(i);
        }
        message[3 + snakeyRainLogin.username.length] = snakeyRainLogin.password.length;
        for (let i = 0; i < snakeyRainLogin.password.length; i++) {
            message[i + 4 + snakeyRainLogin.username.length] = snakeyRainLogin.password.charCodeAt(i);
        }

        sendMessage(message);
        pingIntervalSR = setInterval(pingServer, 1000);
    }
    wsSnakeyRain.onmessage = function (event) {
        const data = new Uint8Array(event.data);
        if (data[1] == 2 && stateSR == 2) {
            stateSR = 3;

            // const test1 = sha256(settings.pass + "valid");
            // let test2 = "";
            // for (let i = 4; i < data.length; i++) {
            //     test2 += String.fromCharCode(data[i]);
            // }
            // // test our hash against the server. kinda insecure without https but should at least 
            // // prevent a fake server from receiving our password, right?
            // if (test1 == test2) {
            //     updateStatus(true, "Logging in...");
            //     const login = settings.user + sha256(settings.pass);
            //     const message = new Uint8Array(settings.user.length + 67);
            //     message[0] = 0;
            //     message[1] = 1;
            //     message[2] = settings.user.length;
            //     for (let i = 0; i < login.length; i++) {
            //         message[i + 3] = login.charCodeAt(i);
            //     }
            const message = new Uint8Array([0, 3, 0]);
            sendMessage(message);



        } else if (data[1] == 3 && stateSR == 3) {
            stateSR = 4;
            updateConnectButton("Logout");
            if (snakeyRainCharacters.length) {
                sendClearChars();
                sendCharMessages();
            }
        } else if (data[1] == 4) {
            stateSR = 3;
            wsSnakeyRain.close();
        } else if (data[1] == 110 && stateSR == 4) {
            let dataview = new DataView(data.buffer);

            const botCount = dataview.getFloat64(2)

            updateBotDiv(botCount);
        } else if (data[1] == 100) {
            const directionalByte = data[2];
            updateDirUiAndState(directionalByte);
        } else if (data[1] == 101 && stateSR == 4) {
            const boostByte = data[2];
            updateBoostDiv(boostByte);
            boostState.boost = Boolean(boostByte);
        } else if (data[1] == 121 && stateSR == 4) {
            stopBots = false;
        } else if (data[1] == 122 && stateSR == 4) {
            stopBots = true;
        } else if (data[1] == 123 && stateSR == 4) {
            data[2] ? playerCount = true : playerCount = false;
        } else if (stateSR == 4 && data[1] == 255) {
            //heartbeat();
        } else if (data[1] == 109) {
            const c = data[2];
            let msg = "";
            for (let i = 3; i < data.length; i++) {
                msg += String.fromCharCode(data[i]);
            }
            const color = c ? "#ffff45" : "#02d1d1"; //if true yellow else cyan
            appendChat("# " + msg, color);
        } else if (data[1] == 119) {
            let msg = "";
            for (let i = 2; i < data.length; i++) {
                msg += String.fromCharCode(data[i]);
            }
            updateDirDivText(msg);
        }

        //else {
        //    wsSnakeyRain.close();
        //}
    }

    wsSnakeyRain.onclose = function () {
        clearTimeout(this.pingTimeout);
        clearInterval(pingIntervalSR);
        resetClientVariables();

        if (stateSR == 1 || stateSR == 2 && attemptsSR <= attempts) {
            currentPort = firstPort + attemptsSR;
            connectToBotServer(currentPort);
        } else {
            appendChat("# Disconnected");
            updateConnectButton("Login");
            wsSnakeyRain = null;
            attemptsSR = 0;
            stateSR = 0;
            currentPort = firstPort;
        }
    }
}

function disconnectFromBotServer() {
    wsSnakeyRain.close();

}

function resetClientVariables() {

    updateBotDiv(0);
    stopBots = true;
    pingIntervalSR = null;
    ownXPos = 0;
    ownYPos = 0;
}

function sendCharMessages() {
    let numOfChars = snakeyRainCharacters.length;
    snakeyRainCharacters.forEach(function (character) {
        if (character.disabled) return
        const name = character.name;
        const skin = character.skin;
        const tag = "" + character.tag;
        const cosmetic = character.cosmetic;

        let nameArray = [];
        for (let i = 0; i < name.length; i++) {
            nameArray.push(name.charCodeAt(i));
            if (i == 23) break
        }
        let skinArray = [];
        for (let i = 0; i < skin.length; i++) {
            skinArray.push(skin.charCodeAt(i));
            if (i == 249) break
        }
        let tagArray = [];
        for (let i = 0; i < tag.length; i++) {
            tagArray.push(tag.charCodeAt(i));
            if (i == 23) break
        }

        const charMessage = new Uint8Array([0, 51, numOfChars, name.length, ...nameArray, skin.length, ...skinArray, tag.length, ...tagArray, cosmetic]);
        sendMessage(charMessage);
    });
}

function sendClearChars() {
    sendMessage(new Uint8Array([0, 50, 0]))
}


function sendMessage(message) {
    if (wsSnakeyRain && wsSnakeyRain.readyState === 1) {
        wsSnakeyRain.send(message);
    }
}

function disconnect() {
    reconnect = false;
    if (wsSnakeyRain) wsSnakeyRain.close();
}

function sendStartMessage(slitherIpPort) {
    if (!slitherIpPort) {
        appendChat("# Join a server before starting bots")
        return;
    }
    let ipPortArray = [];
    for (let i = 0; i < slitherIpPort.length; i++) {
        ipPortArray.push(slitherIpPort.charCodeAt(i));
    }
    const message = new Uint8Array([0, 121, ...ipPortArray])
    sendMessage(message);
}

function sendPosition(xPos, yPos) {
    const array = new Uint8Array(6);
    const dataview = new DataView(array.buffer);
    dataview.setInt8(1, 71);
    dataview.setInt16(2, xPos);
    dataview.setInt16(4, yPos);
    sendMessage(array.buffer);
}

function sendOTPosition(xPos, yPos) {
    const array = new Uint8Array(6);
    const dataview = new DataView(array.buffer);
    dataview.setInt8(1, 74);
    dataview.setInt16(2, xPos);
    dataview.setInt16(4, yPos);
    sendMessage(array.buffer);
}

function sendTargetIdAndPos(id, x, y) {
    const array = new Uint8Array(8);
    const dataview = new DataView(array.buffer);
    dataview.setInt8(1, 73);
    dataview.setInt16(2, id);
    dataview.setInt16(4, x);
    dataview.setInt16(6, y);
    sendMessage(array.buffer);
}

function pingServer() {
    const message = new Uint8Array([0, 255]);
    sendMessage(message);
}

let length = 0;

const snakeyRainWebsocket = window.WebSocket;
window.WebSocket = function (url, protocols) {
    const gameSocket = new snakeyRainWebsocket(url, protocols);

    if (url.endsWith("/slither")) {
        slitherIpPort = getServerAddress(url);
        gameSocket.addEventListener("message", function (event) {
            const data = new Uint8Array(event.data);
            if (2 <= data.length) {
                if (data[2] == 115 && ownIDSR == 0) { //s packet
                    ownIDSR = (((data[3] & 0xff) << 8) | (data[4] & 0xff));
                } else if (data[2] == 103) { //absolute position packet g
                    if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownIDSR) {
                        ownXPos = (((data[5] & 0xff) << 8) | (data[6] & 0xff));
                        ownYPos = (((data[7] & 0xff) << 8) | (data[8] & 0xff));
                        handlePositionMessage(ownXPos, ownYPos);
                    }
                } else if (data[2] == 110) { //absolute position packet n
                    if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownIDSR) {
                        ownXPos = (((data[5] & 0xff) << 8) | (data[6] & 0xff));
                        ownYPos = (((data[7] & 0xff) << 8) | (data[8] & 0xff));
                        handlePositionMessage(ownXPos, ownYPos);
                    }
                } else if (data[2] == 71) { //relative position packet G
                    if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownIDSR) {
                        ownXPos = data[5] - 128 + ownXPos;
                        ownYPos = data[6] - 128 + ownYPos;
                        handlePositionMessage(ownXPos, ownYPos);
                    }
                } else if (data[2] == 78) { //relative position packet N
                    if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownIDSR) {
                        ownXPos = data[5] - 128 + ownXPos;
                        ownYPos = data[6] - 128 + ownYPos;
                        handlePositionMessage(ownXPos, ownYPos);
                    }
                } else if (data[2] == 114) { //r, remove snake part
                    if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownIDSR) {}
                } else if (data[2] == 97) {
                    scaleObjects = Object.keys(window).filter(k => window[k] === 1.157142857142857);
                }
            }
        });
        gameSocket.addEventListener("close", function (event) {
            ownIDSR = 0;
        });
    }

    return gameSocket;
}

let playerCount = true;
//Key Bindings

window.addEventListener("mousedown", function(event){
    if (settingsMenuSR.style.display === "") event.stopPropagation();
}, true);

document.addEventListener('keydown', function (e) {
    if (settingsMenuSR.style.display === "" && e.key !== snakeyRainKeys.openSettings) {
        e.stopPropagation();
        return
    }
    const chatBox = document.getElementById("ichat");
    const nicknameDiv = document.getElementById("nick");
    const serverDiv = document.getElementById("ip-server");
    const activeElement = document.activeElement;


    //allows enter key to exit chat
    if (e.key === "Enter") {
        if (chatBox.value.length === 0 && activeElement === chatBox) {
            chatBox.blur();
            e.stopPropagation();
        }
    }

    

    if (activeElement !== chatBox && activeElement !== nicknameDiv && activeElement !== serverDiv &&  lastKeySR !== "q" && lastKeySR !== "Backspace") {
        let message;
        switch (e.key) {
            case `${snakeyRainKeys.boost}`:
                e.preventDefault();
                e.stopPropagation();
                if (boostState.boost) {
                    message = new Uint8Array([0, 101, 0]);
                    sendMessage(message);
                } else {
                    message = new Uint8Array([0, 101, 1]);
                    sendMessage(message);
                }
                break;
            case `${snakeyRainKeys.follow}`:
                e.preventDefault();
                e.stopPropagation();
                if (!directionalState.follow) {
                    message = new Uint8Array([0, 100, 1]);
                    sendMessage(message);
                } else {
                    message = new Uint8Array([0, 100, 2]);
                    sendMessage(message);
                }
                break;
            case `${snakeyRainKeys.random}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 3]);
                sendMessage(message);
                break;
            case `${snakeyRainKeys.straight}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 4]);
                sendMessage(message);
                break;
            case `${snakeyRainKeys.copy}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 5]);
                sendMessage(message);
                break;
            case `${snakeyRainKeys.mouse}`:
                e.preventDefault();
                e.stopPropagation();
                if (!directionalState.followMouse) {
                    message = new Uint8Array([0, 100, 6]);
                    sendMessage(message);
                } else {
                    message = new Uint8Array([0, 100, 7]);
                    sendMessage(message);
                }
                break;
            case `${snakeyRainKeys.rain}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 8]);
                sendMessage(message);
                break;
            case `${snakeyRainKeys.tornado}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 9]);
                sendMessage(message);
                sendOTPosition(ownXPos, ownYPos);
                break;
            case `${snakeyRainKeys.circle}`:
                e.preventDefault();
                e.stopPropagation();
                if (!directionalState.circleCW) {
                    message = new Uint8Array([0, 100, 10]);
                    sendMessage(message);
                } else {
                    message = new Uint8Array([0, 100, 11]);
                    sendMessage(message);
                }
                break;
            case `${snakeyRainKeys.target}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 12]);
                sendMessage(message);
                sendTargetIdAndPos(userTargettedID, ownXPos, ownYPos);
                break;
            case `${snakeyRainKeys.heart}`:
                e.preventDefault();
                e.stopPropagation();
                message = new Uint8Array([0, 100, 13]);
                sendMessage(message);
                break;
            case `${snakeyRainKeys.startAndStopBots}`:
                e.preventDefault();
                e.stopPropagation();
                if (!stopBots) {
                    sendMessage(new Uint8Array([0, 122, 0]));
                } else {
                    sendStartMessage(slitherIpPort);
                }
                break;
            case `${snakeyRainKeys.hide}`:
                e.preventDefault();
                e.stopPropagation();
                if (!uiHidden) {
                    mainContainer.style.display = "none"
                    uiHidden = true;
                } else {
                    mainContainer.style.display = ""
                    uiHidden = false;
                }
                break;
            case `${snakeyRainKeys.togglePlayerCount}`:
                e.preventDefault();
                e.stopPropagation();
                if (playerCount) {
                    message = new Uint8Array([0, 123, 0]);
                    sendMessage(message);
                } else {
                    message = new Uint8Array([0, 123, 1]);
                    sendMessage(message);
                }
                break;
            case `${snakeyRainKeys.openSettings}`:
                e.preventDefault();
                e.stopPropagation();

                if (settingsMenuSR.style.display === "none") {
                    openSettingsSR();
                } else {
                    closeSettingsSR();
                }
                break;
        }
    }

    lastKeySR = e.key;

});

let writing = false;
let mouseInterval = null;


document.addEventListener('mousedown', function (e) {
    var chatBox = document.getElementById("ichat");
    var nicknameDiv = document.getElementById("nick");
    var serverDiv = document.getElementById("ip-server");
    var nicknameDiv = document.getElementById("nicknameSR");
    let element = document.activeElement;
    //right mouse down to start boost if not already boosting
    if (e.button == 2 && boostState.boost === false && element !== chatBox && element !== nicknameDiv && element !== serverDiv) {
        e.preventDefault();
        e.stopPropagation();
        let message = new Uint8Array([0, 101, 1]);
        sendMessage(message);
    }
});

document.addEventListener('mouseup', function (e) {
    var chatBox = document.getElementById("ichat");
    var nicknameDiv = document.getElementById("nick");
    var serverDiv = document.getElementById("ip-server");
    let element = document.activeElement;
    //right mouse up to stop boost if already boosting
    if (e.button == 2 & boostState.boost == true && element !== chatBox && element !== nicknameDiv && element !== serverDiv) {
        e.preventDefault();
        e.stopPropagation();
        let message = new Uint8Array([0, 101, 0]);
        sendMessage(message);
    }
});

XMLHttpRequest.prototype.originalOpen123 = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, uri, async, user, pass) {
    if (uri.substring(0, 46) == "https://ntl-slither.com/slither/ntlplay-mt.php") {
        this.addEventListener("readystatechange", function (event) {
            if (this.readyState === XMLHttpRequest.DONE) {
                try {
                    ntlData = JSON.parse(this.responseText);
                    if (ownIDSR) {
                        for (let i = 0; i < ntlData.length; i++) {
                            if (ntlData[i].sid == ownIDSR && ntlData[i].tar) {
                                userTargettedID = trimNtlTargetId(ntlData[i].tar);
                            }
                        }
                    }
                } catch {

                }
            }
        }, false);
        this.originalOpen123(method, uri, async, user, pass);
        return;
    }
    this.originalOpen123(method, uri, async, user, pass);
}

function throttle(cb, delay = 1000) {
    let shouldWait = false
    let waitingArgs
    const timeoutFunc = () => {
        if (waitingArgs == null) {
            shouldWait = false
        } else {
            cb(...waitingArgs)
            waitingArgs = null
            setTimeout(timeoutFunc, delay)
        }
    }

    return (...args) => {
        if (shouldWait) {
            waitingArgs = args
            return
        }

        cb(...args)
        shouldWait = true
        setTimeout(timeoutFunc, delay)
    }
}

let lastMouseevent = null;

const handleMouseMove = throttle(e => {
    if (directionalState.followMouse == true) {
        sendMouseData(e, 0);
    } else if (directionalState.copy == true) {
        sendMouseData(e, 1);
    }

}, 100)


document.addEventListener("mousemove", e => {
    handleMouseMove(e);
    lastMouseevent = e;
})

const handlePositionMessage = throttle((ownXPos, ownYPos) => {
    if (directionalState.follow || directionalState.followMouse || directionalState.tornado) sendPosition(ownXPos, ownYPos);

}, 30)

document.addEventListener('click', (e) => {
    if (e.target.closest("span.plist")) {
        const playerFps = e.target.closest("span.plist").lastChild.lastChild.textContent;
        for (let i = 0; i < ntlData.length; i++) {
            if (ntlData[i].dt == playerFps) {
                const message = new Uint8Array([0, 100, 12]);
                sendMessage(message);
                let targetNtlData = ntlData[i];
                sendTargetIdAndPos(targetNtlData.sid, Math.round(targetNtlData.valx), Math.round(targetNtlData.valy));
                break;
            }
        }
    }
});

function trimNtlTargetId(value) {
    if (value) {
        let targetIDSplit = value.split('_')[1];
        return targetIDSplit;
    } else return 0
}

function getMouseAngle(e) {
    const canvas = document.getElementsByTagName("canvas")[2];
    const rect = canvas.getBoundingClientRect();
    const xMouseCoordinate = e.clientX - rect.left;
    const yMouseCoordinate = e.clientY - rect.top;
    const rectWidth = rect.width;
    const rectHeight = rect.height;
    return calcMouseAngle(xMouseCoordinate, yMouseCoordinate, rectHeight, rectWidth)

}

function calcMouseAngle(xMouseCoordinate, yMouseCoordinate, rectHeight, rectWidth) {
    const xCenter = rectWidth / 2;
    const yCenter = rectHeight / 2;
    const dx = Math.abs(xMouseCoordinate - xCenter);
    const dy = Math.abs(yMouseCoordinate - yCenter);
    let theta = 0;

    if (xMouseCoordinate >= xCenter && yMouseCoordinate >= yCenter) {
        theta = Math.atan(dy / dx);
    } else if (xMouseCoordinate <= xCenter && yMouseCoordinate >= yCenter) {
        theta = Math.atan(dx / dy) + Math.PI * 0.5;
    } else if (xMouseCoordinate <= xCenter && yMouseCoordinate <= yCenter) {
        theta = Math.atan(dy / dx) + Math.PI;
    } else if (xMouseCoordinate >= xCenter && yMouseCoordinate <= yCenter) {
        theta = Math.atan(dx / dy) + (3 * Math.PI) / 2;
    }

    const thetaSlither = Math.round(theta * (125 / Math.PI));

    return thetaSlither;
}

function sendMouseData(e, type) {
    let gsc = 1.157142857142857
    for (let i = 0; i < scaleObjects.length; i++) {
        if (window[scaleObjects[i]] != 1.157142857142857) {
            gsc = window[scaleObjects[i]]
            break
        }
    }
    const canvas = document.getElementsByTagName("canvas")[2];
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const xMouseCoordinate = e.clientX - rect.left;
    const yMouseCoordinate = e.clientY - rect.top;
    const rectWidth = rect.width;
    const rectHeight = rect.height;

    const array = new Uint8Array(59);
    const dataview = new DataView(array.buffer);
    dataview.setInt8(1, 72);
    if (type == 1) {
        dataview.setInt8(2, 1); // 1 is copy
    } else {
        dataview.setInt8(2, 0); //0 is follow
    }

    dataview.setFloat64(3, xMouseCoordinate);
    dataview.setFloat64(11, yMouseCoordinate);
    dataview.setFloat64(19, rectWidth);
    dataview.setFloat64(27, rectHeight);
    dataview.setFloat64(35, canvasWidth);
    dataview.setFloat64(43, canvasHeight);
    dataview.setFloat64(51, gsc);
    sendMessage(array.buffer);
}

function updateDirState(newDS) {
    Object.keys(directionalState).forEach(v => directionalState[v] = false);
    directionalState[newDS] = true;
}

function getServerAddress(url) {
    const urlObj = new URL(url);
    const ip = urlObj.hostname;
    const port = urlObj.port;
    return ip + ":" + port;
}

function appendChat(text, color = "#02d1d1") {
    const div = document.getElementById("chat");

    if (div) {
        const span = document.createElement("span");
        span.textContent = text;
        span.style.color = color;
        const br = document.createElement("br");

        div.appendChild(span);
        div.appendChild(br);
        div.scrollTop = div.scrollHeight;
    }
}