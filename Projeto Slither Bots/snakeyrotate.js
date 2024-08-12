// ==UserScript==
// @name         snakey rotate
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Snakey rotating left or right
// @author       Aylina
// @match        http://slither.io/
// @icon         https://www.google.com/s2/favicons?domain=slither.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let snakeRotating = false;
    let botActive = false;
    let lastKey;
    let ws;
    let spawned = false;
    let snakeId = 0;

    const BotHudDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    const BotHudHTMLSetter = BotHudDescriptor.set;
    BotHudDescriptor.set = function (value) {
        if(value.length){
            if(snakeRotating){
                handleNtlKeyBug(); // just making sure...
                snakeRotating = false;
            }
            botActive = true;
        }
        else botActive = false;

        BotHudHTMLSetter.call(this, value);
    };

    document.addEventListener('keydown', function(event) {
        if((event.key === "ArrowLeft" || event.key === "ArrowRight") && spawned){
            const keyEvt = new KeyboardEvent('keyup', {
                key: lastKey,
            });

            window.onkeyup(keyEvt);

            var input = document.getElementById("ichat");

            if(input && input !== document.activeElement && !botActive){
                snakeRotating = !snakeRotating;
                lastKey = event.key;

                appendChat("# Snakey rotation " + (snakeRotating ? "enabled" : "disabled"), "rgba(30,144,255,1)");
            }
        }
    });

    document.addEventListener('keyup', function(event) {
        if(event.key === "ArrowLeft" || event.key === "ArrowRight"){
            if(snakeRotating) event.stopPropagation();
        }
    });

    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols){
        const sock = new originalWebSocket(url, protocols);

        if(url.endsWith("/slither")){
            const div = document.getElementById("timebot-hud");
            if(div){
                Object.defineProperty(div, "innerText", BotHudDescriptor);
            }

            ws = sock;

            const send = ws.send.bind(ws);
            ws.send = function(data){
                const buf = toUint8Array(data); // Uint8Array? ArrayBuffer? make up your mind.
                if((spawned && buf[0] <= 250 && snakeRotating) ||
                   (spawned && buf[0] == 252 && !snakeRotating) ||
                   (spawned && buf[0] == 253 && snakeRotating)){
                    return;
                }

                send(data);
            }

            ws.addEventListener("message", function(event){
                const byteArray = new Uint8Array(event.data);
                const dataView = new DataView(byteArray.buffer);
                const messageLength = dataView.byteLength;

                if (messageLength > 2) {
                    const messageType = String.fromCharCode(dataView.getUint8(2));

                    if(messageType == "s"){
                        if(!spawned){
                            if(snakeRotating){
                                handleNtlKeyBug(); // definitely needed here.
                                snakeRotating = false;
                                botActive = false;
                            }

                        }
                        spawned = true;
                    }
                }
            });

            ws.addEventListener("close", function(event){
                spawned = false;
            });
        }

        return sock;
    }

    function handleNtlKeyBug(){
        const keyDownEvt = new KeyboardEvent('keyup', {
            key: lastKey,
        });

        const keyUpEvt = new KeyboardEvent('keyup', {
            key: lastKey,
        });

        window.onkeyup(keyDownEvt);
        window.onkeyup(keyUpEvt);
    }

    function toUint8Array(data){
        if(data instanceof ArrayBuffer){
            return new Uint8Array(data);
        }
        return data;
    }

    function appendChat(text, color){
        const div = document.getElementById("chat");

        if(div){
            const span = document.createElement("span");
            span.innerHTML = text;
            span.style.color = color;
            const br = document.createElement("br");

            div.appendChild(span);
            div.appendChild(br);
            div.scrollTop = div.scrollHeight;
        }
    }
})();