(function() {
    'use strict';

    // Variáveis globais
    let uiHidden = false;
    let stopBots = true;
    let state = 0;
    let ownID = 0;
    let slitherIpPort = null;
    let ownXPos = 0;
    let ownYPos = 0;
    let bots = [];
    let server = "";
    let origin = null;
    let botCount = 612;
    let connectedCount = 0;
    let isZigZag = false;
    let targetXPos, targetYPos;
    let globalFixedDirection = null;

    // Configurações de UI
    function createUI() {
        let container = document.createElement("div");
        container.setAttribute("id", "snakeyrain-ui");
        document.body.appendChild(container);

        let connectedDiv = document.createElement("div");
        connectedDiv.setAttribute("id", "connected-container");
        container.appendChild(connectedDiv);

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

        let connectButton = document.createElement("button");
        connectButton.setAttribute("id", "connect-button");
        connectButton.setAttribute("class", "databox");
        connectButton.onclick = toggleBots;
        connectedDiv.appendChild(connectButton);

        updateBotDiv(0);
        updateDirUiAndState(1);
        updateBoostDiv(0);
        updateConnectButton("Start Bots");
    }

    function updateBotDiv(count) {
        document.getElementById("bots").innerHTML = `<p>Bots: ${count}</p>`;
    }

    function updateDirUiAndState(directionalByte) {
        let dirState = "";
        switch (directionalByte) {
            case 1: dirState = "Follow"; break;
            case 2: dirState = "Unfollow"; break;
            case 3: dirState = "Random"; break;
            case 4: dirState = "Straight"; break;
            case 5: dirState = "ZigZag"; break;
            // Adicione mais casos conforme necessário
        }
        document.getElementById("directional").innerHTML = `<p style="background-color: rgba(72,255,255,0.5);">${dirState}</p>`;
        setBotBehavior(dirState.toLowerCase());
    }

    function updateBoostDiv(boostStateByte) {
        let color = boostStateByte ? "rgba(72,255,255,0.5)" : "rgba(255, 72, 255,0.5)";
        let text = boostStateByte ? "Boost" : "No Boost";
        document.getElementById("boost").innerHTML = `<p style="background-color: ${color}">${text}</p>`;
        setBotsBoost(Boolean(boostStateByte));
    }

    function updateConnectButton(text) {
        document.getElementById("connect-button").innerText = text;
    }

    // Lógica de bots
    function Bot(id) {
        this.id = id;
        this.connect();
        this.fixedDirection = globalFixedDirection;
        this.isBoosting = false;
        this.shouldRandomize = false;
    }

    Bot.prototype = {
        needPing: false,
        snakeID: null,
        snakeX: 0,
        snakeY: 0,
        headX: 0,
        headY: 0,
        snakeAngle: 0,
        haveSnakeID: false,
        isBoost: false,
        hasConnected: false,

        connect: function() {
            this.ws = new WebSocket(server, {
                headers: {
                    'Origin': origin,
                    'Accept-Encoding': 'gzip, deflate',
                    'Accept-Language': 'en-US,en;q=0.8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'Upgrade',
                    'Host': getHost(server),
                    'Pragma': 'no-cache',
                    'Upgrade': 'websocket',
                    'Sec-WebSocket-Version': '13',
                    'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/localhost Safari/537.36'
                }
            });

            this.ws.binaryType = "arraybuffer";
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onerror = this.onError.bind(this);
        },

        send: function(buf) {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            this.ws.send(buf);
        },

        disconnect: function() {
            if (this.ws) this.ws.close();
            this.haveSnakeID = false;
        },

        onOpen: function() {
            this.send(new Uint8Array([99]));
            this.hasConnected = true;
            connectedCount++;
            updateBotDiv(connectedCount);
        },

        onClose: function() {
            this.needPing = false;
            this.haveSnakeID = false;
            if (this.hasConnected) {
                connectedCount--;
                updateBotDiv(connectedCount);
            }
        },

        onError: function(e) {
            this.needPing = false;
            setTimeout(this.connect.bind(this), 3000);
        },

        onMessage: function(b) {
            var lol = new Uint8Array(b.data);
            var f = String.fromCharCode(lol[2]);
            if (f === "s") {
                this.snakeID = lol[3] << 8 | lol[4];
                this.haveSnakeID = true;
            } else if (f === "g" || f === "n" || f === "G" || f === "N") {
                if ((lol[3] << 8 | lol[4]) === this.snakeID) {
                    this.snakeX = lol[5] << 8 | lol[6];
                    this.snakeY = lol[7] << 8 | lol[8];
                }
            }
        },

        moveTo: function(x, y) {
            var value = this.getValue(this.snakeX, this.snakeY, x, y, this.shouldRandomize);
            this.snakeAngle = value;

            var buf = new Uint8Array([Math.floor(value)]);
            if (this.isBoost) buf = new Uint8Array([Math.floor(value), 254]);

            this.send(buf);
        },

        getValue: function(originX, originY, targetX, targetY, shouldRandomize) {
            if (this.fixedDirection !== null) {
                return this.fixedDirection;
            }
            if (shouldRandomize) {
                return Math.floor(Math.random() * 250);
            }
            var dx = targetX - originX;
            var dy = targetY - originY;
            var theta = Math.atan2(dy, dx);
            theta *= 125 / Math.PI;
            if (theta < 0) theta += 250;
            return theta;
        },

        setZigZagMovement: function(shouldZigZag) {
            isZigZag = shouldZigZag;
            if (isZigZag) {
                this.fixedDirection = null;
                globalFixedDirection = null;
            } else {
                this.fixedDirection = this.snakeAngle;
                globalFixedDirection = this.snakeAngle;
            }
        },

        boostSpeed: function(shouldBoost) {
            this.isBoosting = shouldBoost;
            if (this.isBoosting) {
                this.send(new Uint8Array([254]));
            } else {
                this.send(new Uint8Array([253]));
            }
        }
    };

    function initializeBots() {
        for (let i = 0; i < botCount; i++) {
            bots.push(new Bot(i));
        }
        connectedCount = botCount;
        updateBotDiv(connectedCount);
    }

    function disconnectBots() {
        bots.forEach(bot => bot.disconnect());
        bots = [];
        connectedCount = 0;
        updateBotDiv(0);
    }

    function toggleBots() {
        if (state === 0) {
            initializeBots();
            state = 4;
            stopBots = false;
            updateConnectButton("Stop Bots");
        } else {
            disconnectBots();
            state = 0;
            stopBots = true;
            updateConnectButton("Start Bots");
        }
    }

    function setBotBehavior(behavior) {
        bots.forEach(bot => {
            switch(behavior) {
                case "zigzag":
                    bot.setZigZagMovement(true);
                    break;
                case "straight":
                    bot.setZigZagMovement(false);
                    break;
                case "random":
                    bot.shouldRandomize = true;
                    break;
                default:
                    bot.shouldRandomize = false;
                    bot.setZigZagMovement(false);
            }
        });
    }

    function setBotsBoost(shouldBoost) {
        bots.forEach(bot => bot.boostSpeed(shouldBoost));
    }

    // Interceptação de WebSocket
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const gameSocket = new originalWebSocket(url, protocols);

        if (url.endsWith("/slither")) {
            slitherIpPort = getServerAddress(url);
            gameSocket.addEventListener("message", handleGameMessage);
            gameSocket.addEventListener("close", function() {
                ownID = 0;
                disconnectBots();
            });
        }

        return gameSocket;
    };

    function handleGameMessage(event) {
        const data = new Uint8Array(event.data);
        if (data.length >= 3) {
            switch(data[2]) {
                case 115: // 's' packet
                    if (ownID === 0) {
                        ownID = (data[3] << 8) | data[4];
                    }
                    break;
                case 103: // 'g' packet
                case 110: // 'n' packet
                    if (((data[3] << 8) | data[4]) === ownID) {
                        ownXPos = (data[5] << 8) | data[6];
                        ownYPos = (data[7] << 8) | data[8];
                        updateBotsPosition(ownXPos, ownYPos);
                    }
                    break;
                case 71: // 'G' packet
                case 78: // 'N' packet
                    if (((data[3] << 8) | data[4]) === ownID) {
                        ownXPos += data[5] - 128;
                        ownYPos += data[6] - 128;
                        updateBotsPosition(ownXPos, ownYPos);
                    }
                    break;
            }
        }
    }

    function updateBotsPosition(x, y) {
        if (state === 4 && !stopBots) {
            bots.forEach(bot => bot.moveTo(x, y));
        }
    }

    function getServerAddress(url) {
        return url.split('://')[1].split('/')[0];
    }

    function getHost(a) {
        a = a.replace(/[/slither]/g, '');
        a = a.replace(/[ws]/g, '');
        a = a.replace(/[/]/g, '');
        a = a.substr(1);
        return a;
    }

    // Inicialização
    createUI();

    // Eventos de teclado
    document.addEventListener('keydown', function(event) {
        switch(event.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                // Implemente a lógica de rotação se necessário
                break;
            case 'B':
                toggleBots();
                break;
            case 'Z':
                isZigZag = !isZigZag;
                setBotBehavior(isZigZag ? "zigzag" : "straight");
                break;
            case 'C':
                setBotBehavior("random");
                break;
            case 'V':
                setBotsBoost(!bots[0].isBoosting);
                break;
            // Adicione mais controles de teclado conforme necessário
        }
    });

    // Função para iniciar os bots (pode ser chamada externamente se necessário)
    window.startBots = function(serverAddress, originAddress) {
        server = serverAddress;
        origin = originAddress;
        toggleBots();
    };

})();