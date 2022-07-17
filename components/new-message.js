class NewMessage extends Component {

  
    static get attrTypes() {
        return {};
    }


    static get observedAttributes() {
        return super.getObservedAttrs(NewMessage.attrTypes);
    }

    
    static get tagName() {
        return super.generateTagName(NewMessage.name);
    }

    
    static get style() {
        return (`<style>
                :host {
                    --primaryColor: #3AD07A;
                    --hoverColor: #edfbf3;
                    display: flex;
                }
                :host([hidden]) {
                    display: none;
                }
                * {
                    box-sizing: border-box;
                    user-select: none;                        
                }
                .input-wrapper {
                    width: 100%;
                    padding: .5em;
                }
                .input-wrapper textarea {
                    max-height: 200px;
                    min-height: 32px;
                    width: 100%;
                    max-width: 100%;
                    border: 1px solid #efefef;
                    padding: .5rem;
                    font-family: 'Lato', sans-serif;
                    font-size: 16px;
                    border-radius: 4px;
                    transition: all .2s;
                    color: #444;
                }
                .input-wrapper textarea:focus {
                    outline: none;
                    box-shadow: 0 0 3px 1px #3ad07a;
                }
                .input-wrapper textarea::placeholder {
                    opacity: .5;
                }
                .send-btn {
                    position: relative;
                    background: transparent;
                    border: none;
                    outline: none;
                    cursor: pointer;
                    color: var(--primaryColor);
                    width: 50px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .send-btn:not(.recording):focus,
                .send-btn:not(.recording):hover {
                    cursor: pointer;
                    background: #f2f2f2;
                    border-radius: 4px;
                }
                .send-btn:before,
                .send-btn:after {
                    content: "";
                    display: block;
                    width: 0px;
                    height: 0px;
                    background: rgba(58,208,122,0.2);
                    border-radius: 50%;
                    position: absolute;
                    z-index: -1;
                    opacity: 0;
                }     
                .send-btn:after {
                    background: rgba(58,208,122,0.25);
                }
                .send-btn.recording:before {
                    display: block;
                    animation: ripple 1s infinite ease-out forwards;
                }
                .send-btn.recording:after {
                    display: block;
                    animation: ripple 1s -.25s infinite ease-out forwards;
                }
                .actions-wrapper {
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    padding: .5em .5em .5em 0;
                }
                #text-send-btn {
                    display: none;
                }
                @keyframes ripple {
                    0% {
                       width: 0px;
                       height: 0px; 
                       opacity: 0;
                    } 
                    60% {
                       width: 60px;
                       height: 60px;
                       opacity: 1; 
                    }
                    100% {
                       width: 80px;
                       height: 80px;
                       opacity: 0; 
                    }
                }
                </style>`)
    }

    
    static get template() {
        return (`
            <template>
                ${NewMessage.style}
                <div class="input-wrapper">
                    <textarea name="new_message" id="new-message-input"
                        placeholder="write message here (Ctrl+Enter to send)"
                        tabindex="1"
                        rows="2"></textarea>
                </div>
                <div class="actions-wrapper">
                    <button class="send-btn" id="text-send-btn" tabindex="2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                    <button class="send-btn" id="sound-record-btn" tabindex="2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </button>
                </div>
            </template>
            `)
    }

    constructor() {
        super({
            attrTypes: NewMessage.attrTypes,
            template: NewMessage.template
        });

        this._textSendButton = this.shadowRoot.getElementById("text-send-btn");
        this._soundRecordBtn = this.shadowRoot.getElementById("sound-record-btn");
        this._textarea = this.shadowRoot.getElementById("new-message-input");

        
        this.setMicBtnVisibility(Recorder.isMicAvailable());

        this._recorder = new Recorder();
    }

    
    setMicBtnVisibility(showMic) {
        this._soundRecordBtn.style.display = showMic ? "flex" : "none";
        this._textSendButton.style.display = showMic ? "none" : "flex";
    }

    
    onMount() {
        this.initListeners();
    }

    
    onUnmount() {
        this.removeListeners();
    }

   
    initListeners() {
        this.addEventListener("keydown", this._onKeyPress.bind(this));
        this._textarea.addEventListener("input", this._onType.bind(this));
        this._textSendButton.addEventListener("click", this._onTextSend.bind(this));
        this._soundRecordBtn.addEventListener("mousedown", this._onRecordStart.bind(this));
        this._soundRecordBtn.addEventListener("touchstart", this._onRecordStart.bind(this));
        this._soundRecordBtn.addEventListener("mouseup", this._onRecordStop.bind(this));
        this._soundRecordBtn.addEventListener("touchend", this._onRecordStop.bind(this));
    }

   
    removeListeners() {
        this.removeEventListener("keydown", this._onKeyPress.bind(this));
        this._textarea.removeEventListener("input", this._onType.bind(this));
        this._textSendButton.removeEventListener("click", this._onTextSend.bind(this));
        this._soundRecordBtn.removeEventListener("mousedown", this._onRecordStart.bind(this));
        this._soundRecordBtn.removeEventListener("touchstart", this._onRecordStart.bind(this));
        this._soundRecordBtn.removeEventListener("mouseup", this._onRecordStop.bind(this));
        this._soundRecordBtn.removeEventListener("touchend", this._onRecordStop.bind(this));

    }

    _onKeyPress(e) {
        if (e.ctrlKey && e.key.toLowerCase() === "enter") {
            this._onTextSend();
        }
    }

    
    _onType(e) {
        this.setMicBtnVisibility(!e.target.value);
    }

    _onTextSend() {

        if (!this._textarea.value) {
            this._textarea.focus();
            return;
        }

        this.emit(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, {
            text: this._textarea.value.trim(),
            time: new Date(),
        })
    }

  
    _onRecordStart() {
       
        this._soundRecordBtn.classList.add("recording");
        this._recorder.start();
    }

   
    async _onRecordStop() {
        
        this._soundRecordBtn.classList.remove("recording");

       
        let audio = await this._recorder.stop();
        this.emit(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, {
            audio,
            time: new Date(),
        })
    }

    
    get message() {
        return this._textarea.value;
    }

    
    clear() {
        this._textarea.value = "";
        this._textarea.focus();

        
        this.setMicBtnVisibility(Recorder.isMicAvailable())
    }

}

customElements.define(NewMessage.tagName, NewMessage);
