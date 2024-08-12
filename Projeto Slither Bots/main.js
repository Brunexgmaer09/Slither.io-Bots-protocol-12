(function () {
    'use strict';
    let uiHidden = false;
    let stopBots = true;
    let lastKey = "";
    let ws = null;
    let state = 0;
    let ownID = 0;
    let attempts = 0;
    let pingInterval = 0;
    let slitherIpPort = null;
    let ownXPos = 0;
    let ownYPos = 0;
    let scaleObjects = [];
    let ntlData = [];
    let userTargettedID = 0;
    let server = "96.43.143.90";
    let firstPort = 8001;
    let currentPort = firstPort;

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
    }

    let boostState = {
        "boost": false,
    }

    function createUI() {
        let container = document.createElement("div");
        container.setAttribute("id", "snakeyrain-ui");
        document.body.appendChild(container);

        let connectedDiv = document.createElement("div");
        connectedDiv.setAttribute("id", "connected-container");
        container.appendChild(connectedDiv);

        let logoDiv = document.createElement("div");
        logoDiv.setAttribute("id", "logo");
        logoDiv.setAttribute("class", "snakeylogo");
        connectedDiv.appendChild(logoDiv);

        let botsDiv = document.createElement("div");
        botsDiv.setAttribute("id", "bots");
        botsDiv.setAttribute("class", "databox");
        connectedDiv.appendChild(botsDiv);

        let directionalDiv = document.createElement("div");
        directionalDiv.setAttribute("id", "directional");
        directionalDiv.setAttribute("class", "databox");
        connectedDiv.appendChild(directionalDiv);

        let boostDiv = document.createElement("div");
        boostDiv.setAttribute("id", "boost");
        boostDiv.setAttribute("class", "databox");
        connectedDiv.appendChild(boostDiv);

        let connectDiv = document.createElement("button");
        connectDiv.setAttribute("id", "connect-button");
        connectDiv.setAttribute("class", "databox");
        connectDiv.onclick = () => {
            document.getElementById("connect-button").disabled = true;
            setTimeout(function () {
                document.getElementById("connect-button").disabled = false;
            }, 1000);
            if (!ws) {
                connectToBotServer(currentPort);
            } else {
                disconnectFromBotServer();
            }

        };
        connectedDiv.appendChild(connectDiv);
    }

    function updateBotDiv(botCount) {
        document.getElementById("bots").innerHTML = `<p>Bots: ${botCount}</p>`;
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
        }
        document.getElementById("directional").innerHTML = `<p style="background-color: rgba(72,255,255,0.5);">${dirState}</p>`;
    }

    function updateDirDivText(text) {
        document.getElementById("directional").innerHTML = `<p style="background-color: rgba(72,255,255,0.5);">${text}</p>`;
    }

    function updateBoostDiv(boostStateByte) {
        let color = "";
        let text = "";

        if (boostStateByte == 0) {
            color = "rgba(255, 72, 255,0.5)";
            text = "No Boost"
        } else {
            color = "rgba(72,255,255,0.5)";
            text = "Boost";
        }
        document.getElementById("boost").innerHTML = `<p style="background-color: ${color}">${text}</p>`;
    }

    function updateConnectButton(text) {
        document.getElementById("connect-button").innerText = `${text}`;
    }


    createUI();
    updateBotDiv(0);
    updateDirUiAndState(1);
    updateBoostDiv(0);
    updateConnectButton("Login");

    function connectToBotServer(port) {
        if (attempts > 10) {
            appendChat(`# No servers available. Try again later.`);
            updateConnectButton("Login");
            ws = null;
            attempts = 0;
            state = 0;
            currentPort = firstPort;
            return;
        }
        ws = new WebSocket(`ws://${server}:${port}/`);
        ws.binaryType = "arraybuffer";
        state = 1;
        attempts++;

        ws.onopen = function () {
            state = 2;
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
            pingInterval = setInterval(pingServer, 1000);
        }
        ws.onmessage = function (event) {
            const data = new Uint8Array(event.data);
            if (data[1] == 2 && state == 2) {
                state = 3;

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



            } else if (data[1] == 3 && state == 3) {
                state = 4;
                updateConnectButton("Logout");
                if (Object.keys(snakeyRainCharacters).length) {
                    sendClearChars();
                    sendCharMessages();
                }
            } else if (data[1] == 4) {
                state = 3;
                ws.close();
            } else if (data[1] == 110 && state == 4) {
                let dataview = new DataView(data.buffer);

                const botCount = dataview.getFloat64(2)

                updateBotDiv(botCount);
            } else if (data[1] == 100) {
                const directionalByte = data[2];
                updateDirUiAndState(directionalByte);
            } else if (data[1] == 101 && state == 4) {
                const boostByte = data[2];
                updateBoostDiv(boostByte);
                boostState.boost = Boolean(boostByte);
            } else if (data[1] == 121 && state == 4) {
                stopBots = false;
            } else if (data[1] == 122 && state == 4) {
                stopBots = true;
            } else if (data[1] == 123 && state == 4) {
                data[2] ? playerCount = true : playerCount = false;
            } else if (state == 4 && data[1] == 255) {
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
            //    ws.close();
            //}
        }

        ws.onclose = function () {
            clearTimeout(this.pingTimeout);
            clearInterval(pingInterval);
            resetClientVariables();

            if (state == 1 || state == 2 && attempts <= 10) {
                currentPort = firstPort + attempts;
                connectToBotServer(currentPort);
            } else {
                appendChat("# Disconnected");
                updateConnectButton("Login");
                ws = null;
                attempts = 0;
                state = 0;
                currentPort = firstPort;
            }
        }
    }

    function disconnectFromBotServer() {
        ws.close();

    }

    function resetClientVariables() {

        updateBotDiv(0);
        stopBots = true;
        pingInterval = null;
        ownXPos = 0;
        ownYPos = 0;
    }

    function sendCharMessages() {
        let characters = [];
        Object.keys(snakeyRainCharacters).forEach(function (key) {
            characters.push(snakeyRainCharacters[key]);
        });
        let numOfChars = characters.length;
        characters.forEach(function (character) {
            const charKeyArray = character.split(":");
            const name = snakeyRainNames[charKeyArray[0]];
            const skin = snakeyRainSkins[charKeyArray[1]];
            const tag = "" + snakeyRainTags[charKeyArray[2]];
            const cosmetic = snakeyRainCosmetics[charKeyArray[3]];

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
        if (ws && ws.readyState === 1) {
            ws.send(message);
        }
    }

    function disconnect() {
        reconnect = false;
        if (ws) ws.close();
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

    const snakeyRainWebsocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
        const gameSocket = new snakeyRainWebsocket(url, protocols);

        if (url.endsWith("/slither")) {
            slitherIpPort = getServerAddress(url);
            gameSocket.addEventListener("message", function (event) {
                const data = new Uint8Array(event.data);
                if (2 <= data.length) {
                    if (data[2] == 115 && ownID == 0) { //s packet
                        ownID = (((data[3] & 0xff) << 8) | (data[4] & 0xff));
                    } else if (data[2] == 103 || data[2] == 110) { //absolute position packet g and n
                        if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownID) {
                            ownXPos = (((data[5] & 0xff) << 8) | (data[6] & 0xff));
                            ownYPos = (((data[7] & 0xff) << 8) | (data[8] & 0xff));
                            handlePositionMessage(ownXPos, ownYPos);
                        }
                    } else if (data[2] == 71 || data[2] == 78) { //relative position packet G and N
                        if ((((data[3] & 0xff) << 8) | (data[4] & 0xff)) == ownID) {
                            ownXPos = data[5] - 128 + ownXPos;
                            ownYPos = data[6] - 128 + ownYPos;
                            handlePositionMessage(ownXPos, ownYPos);
                        }
                    } else if (data[2] == 97) {
                        scaleObjects = Object.keys(window).filter(k => window[k] === 1.157142857142857);
                    }
                }
            });
            gameSocket.addEventListener("close", function (event) {
                ownID = 0;
            });
        }

        return gameSocket;
    }

    let playerCount = true;
    //Key Bindings
    document.addEventListener('keydown', function (e) {
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
        if (activeElement !== chatBox && activeElement !== nicknameDiv && activeElement !== serverDiv && lastKey !== "Backspace" && lastKey !== "q") {
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
                case `${snakeyRainKeys.startAndStopBots}`:
                    e.preventDefault();
                    e.stopPropagation();
                    if (!stopBots) {
                        sendMessage(new Uint8Array([0, 122, 0]));
                    } else {
                        sendStartMessage(slitherIpPort);
                    }
                    break;
                case `${snakeyRainKeys.updateSkins}`:
                    e.preventDefault();
                    e.stopPropagation();
                    sendClearChars();
                    sendCharMessages();
                    break;

                case `${snakeyRainKeys.hide}`:
                    e.preventDefault();
                    e.stopPropagation();
                    if (!uiHidden) {
                        document.getElementById("connected-container").style.display = "none"
                        uiHidden = true;
                    } else {
                        document.getElementById("connected-container").style.display = ""
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
            }
        }

        lastKey = e.key;

    });

    document.addEventListener('mousedown', function (e) {
        var chatBox = document.getElementById("ichat");
        var nicknameDiv = document.getElementById("nick");
        var serverDiv = document.getElementById("ip-server");
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
                        if (ownID) {
                            for (let i = 0; i < ntlData.length; i++) {
                                if (ntlData[i].sid == ownID && ntlData[i].tar) {
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

    const handleMouseMove = throttle(e => {
        if (directionalState.followMouse == true) {
            sendMouseData(e, 0);
        } else if (directionalState.copy == true) {
            sendMouseData(e, 1);
        }

    }, 100)

    document.addEventListener("mousemove", e => {
        handleMouseMove(e);
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

    function sendMouseData(e, type) {
        let gsc = 1.157142857142857
        for (i = 0; i < scaleObjects.length; i++) {
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

})();