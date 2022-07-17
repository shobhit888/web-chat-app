class ChatBox extends Component {

    
    static get attrTypes() {
        return {
            hidden: {
                type: "boolean",
                observe: true
            },
        };
    }

    
    static get observedAttributes() {
        return super.getObservedAttrs(ChatBox.attrTypes);
    }

   
    static get tagName() {
        return super.generateTagName(ChatBox.name);
    }

  
    static get style() {
        return (`<style>
                :host {
                    --primaryColor:  #3AD07A;
                    --hoverColor: #edfbf3;
                    display: block;
                    height: 100%;
                    max-height: 100%;
                    flex-grow: 1;
                    position: relative;
                }
                :host([hidden]) .chat-box-inner {
                    visibility: hidden;
                    opacity: 0;
                }
                :host(:not([hidden])) .chat-placeholder {
                    display: none;
                }
                * {
                    box-sizing: border-box;
                    user-select: none;                        
                }
                .chat-box-inner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .chat-box-inner .chat-list-wrapper {
                    position: relative;
                    background: #3ad07a1f url(./static/chat-box-bg.png);
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    min-height: 0;
                    overflow: hidden;
                }
                .chat-box-inner .scrollable {
                    position: relative;
                    overflow: hidden;
                    overflow-y: auto;
                    min-height: 0;
                    padding: 1em 1em 1.5em;
                    display: grid;
                }
                .chat-box-inner .chat-list-wrapper:before ,
                .chat-box-inner .chat-list-wrapper:after {
                    content: '';
                    position: absolute;
                    top: -2px;
                    width: 100%;
                    height: 1px;
                    box-shadow: 0px -2px 10px 3px rgba(0,0,0,0.16);
                    z-index: 1;
                }
                .chat-box-inner .chat-list-wrapper:after {
                    top: unset;
                    bottom: -2px;
                    box-shadow: 0px -2px 10px 1px rgba(0,0,0,0.16);
                }
                .chat-day {
                    margin: 2em 0;
                    text-align: center; 
                }
                .chat-day span{
                    font-size: 14px;
                    padding: .5rem 1.5rem;
                    border-radius: 25px;
                    background: rgba(0,0,0,.2);
                    color: #fff;
                }
                .chat-placeholder {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    padding: 2em;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background-color: #fdfdfd;
                    text-align: center;
                    color: #666;
                }
                .chat-placeholder img {
                    max-width: 500px;
                    margin-bottom: 1rem;
                }
                .chat-placeholder h2{
                    font-size: calc(.51vh + 2vw + .1vmin);
                    white-space: pre-wrap;
                    font-weight: 500;
                }
                .chat-placeholder p {
                    opacity: .7;
                    line-height: 26px;
                    font-size: 16px;
                    font-weight: 300;
                    max-width: 550px;
                    width: 100%;
                }
                #scroll-to-bottom {
                    position: absolute;
                    right: 1.5rem;
                    bottom: 1.5rem;
                    color: var(--primaryColor);
                    background-color: #fff;
                    border: none;
                    outline: none;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    box-shadow: 0 0 8px 2px rgba(0,0,0,0.16);
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 16px;
                    transform: translateY(100px);
                    transition: transform .2s ease-in-out;
                }
                #scroll-to-bottom.show{
                    transform: translateY(0px);                    
                }
                @media screen and (max-width: 564px) {
                    .chat-placeholder {
                        display: none;
                    }
                }
                </style>`)
    }

    static get template() {
        return (`
            <template>
                ${ChatBox.style}
                <div class="chat-box-inner">
                    <active-chat></active-chat>
                    <div class="chat-list-wrapper">
                        <div class="scrollable" id="chat-list"></div>
                        <button id="scroll-to-bottom">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                    <new-message></new-message>
                </div>
                <div class="chat-placeholder">
                    <img src="./static/chat-placeholder.svg" alt="chat-placeholder">
                    <h2>Hi there! \n Select a chat to start messaging.</h2>
                    <p>This app is one of the projects that developed under name 
                    <a href="https://github.com/behnamazimi/simple-web-projects" target="_blank">
                    <strong>practical front-end projects</strong></a> for educational purposes. 
                    This project developed with <strong>Web Components</strong> without any third-party libs.</p>
                </div>
            </template>
            `)
    }

    constructor() {
        super({
            attrTypes: ChatBox.attrTypes,
            template: ChatBox.template
        });

        this._chatList = this.shadowRoot.getElementById("chat-list");
        this._newMessageBox = this.shadowRoot.querySelector("new-message");
        this._scrollToBottomBtn = this.shadowRoot.getElementById("scroll-to-bottom");
        this._activeChatElm = this.shadowRoot.querySelector("active-chat");
    }

    onMount() {
        this.initListeners();
    }

  
    onUnmount() {
        this.removeListeners();
    }

    
    attributeChangedCallback(attrName, oldValue, newValue) {
        if (oldValue === newValue)
            return;

        if (attrName === "readonly")
            this.checkNewMessageBoxVisibility();
    }

    
    set readOnly(value) {
        if (value) {
            this.setAttribute('readonly', '');

        } else {
            this.removeAttribute('readonly');
        }
    }

    get readOnly() {
        return this.hasAttribute('readonly');
    }

    
    setActiveChat(chat) {
        
        if (!chat || !chat.id)
            return;

        this._activeChat = chat;

        
        this.hidden = false;
        this._chatList.innerHTML = '';
        this.lastMessage = null;
   
        this.renderChatBoxHeader();
    }

    get activeChat() {
        return this._activeChat;
    }

   
    set hidden(value) {
        if (value) {
            this.setAttribute("hidden", '');
        } else {
            this.removeAttribute("hidden");
        }
    }

    get hidden() {
        return this.hasAttribute("hidden")
    }

   
    initListeners() {
        
        this.on(APP_EVENTS.USER_SIGN_IN, this._userSignIn.bind(this));
        
        this._newMessageBox.on(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, this._onAuthedMessageReceive.bind(this));

        
        this._chatList.addEventListener("scroll", this.checkScrollToBottomBtnVisibility.bind(this));
        this._scrollToBottomBtn.addEventListener("click", this.scrollToEnd.bind(this));

        this._activeChatElm.on(APP_EVENTS.CHAT_BOX_BACK_CLICKED, this._onBackBtnClicked.bind(this));
    }

    
    removeListeners() {
        this._newMessageBox.off(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, this._onAuthedMessageReceive.bind(this));
        this.off(APP_EVENTS.USER_SIGN_IN, this._userSignIn.bind(this));
        this._scrollToBottomBtn.removeEventListener("click", this.scrollToEnd.bind(this));
        this._chatList.removeEventListener("scroll", this.checkScrollToBottomBtnVisibility.bind(this));
    }

    
    renderMessage({sender, text, audio, time}, forceScrollToEnd = false) {
        
        if (!sender || (!text && !audio) || !time || !(time instanceof Date))
            return;

        const isFromAuthedUser = sender === this._authedUserId;
        const isSameSender = this.lastMessage && this.lastMessage.sender === sender;

        
        const timeToShow = `${time.getHours()}:${time.getMinutes()}`;

        
        const msg = document.createElement("chat-message");

        if (text)
            msg.text = text;

        if (audio)
            msg.audio = audio;

        msg.setAttribute("position", isFromAuthedUser ? "right" : "left");
        msg.setAttribute("sender", sender);
        msg.setTimeObject(time);
        msg.setAttribute("time", timeToShow);
        msg.setAttribute("title", time.toLocaleString());
        msg.isLastInGroup = true;

      
        if (this.lastMessage && isSameSender)
            this.lastMessage.isLastInGroup = false;

        if (!this.lastMessage || this._isMessageForDifferentDay(time)) {
            this._appendDateToChatList(time);
        }

       
        const isLastMessageInView = this._chatList.scrollTop >= this._chatList.scrollHeight - this._chatList.clientHeight;

        
        this.lastMessage = msg;
        this._chatList.appendChild(msg);

        if (isFromAuthedUser)
            this._newMessageBox.clear();

        if (isLastMessageInView || forceScrollToEnd)
            this.scrollToEnd();

     
        this.checkScrollToBottomBtnVisibility();
    }

    
    _userSignIn({detail}) {
        this._authedUserId = detail.id;
    }

   
    _onBackBtnClicked() {
        this.hidden = true;

       
        this.emit(APP_EVENTS.CHAT_BOX_BACK_CLICKED)
    }

   
    _onAuthedMessageReceive({detail}) {
        if (!this.activeChat)
            return;

        detail.toChat = this.activeChat.id;
        detail.sender = this._authedUserId;
        this.renderMessage(detail, true);
        this.emit(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, detail);
    }

    _isMessageForDifferentDay(time) {
        if (!this.lastMessage || !time)
            return false;

        return time.toDateString() !== this.lastMessage.timeObject.toDateString();
    }

   
    _appendDateToChatList(time) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.assert(time, "Message time not passed");

        let dayTitle = `${monthNames[time.getMonth()]} ${time.getDay()}, ${time.getFullYear()}`;
        if (time.toDateString() === new Date().toDateString())
            dayTitle = "Today";

        const dateNode = document.createElement("div");
        dateNode.classList.add("chat-day");
        dateNode.innerHTML = `<span>${dayTitle}</span>`;

        this._chatList.appendChild(dateNode);
    }

    
    checkScrollToBottomBtnVisibility(e) {
        if (this._chatList.scrollTop + 200 < this._chatList.scrollHeight - this._chatList.clientHeight) {
            this._scrollToBottomBtn.classList.add("show")
        } else {
            this._scrollToBottomBtn.classList.remove("show");
        }
    }

    
    scrollToEnd() {
        this._chatList.scrollTo({
            top: this._chatList.scrollHeight,
        })
    }

   
    renderChatBoxHeader() {
        const activeChatNode = this.shadowRoot.querySelector("active-chat");
        this.assert(activeChatNode, "The active-chat node not found in chat-box");

        activeChatNode.setAttribute("id", this._activeChat.id);
        activeChatNode.setAttribute("name", this._activeChat.name);
        activeChatNode.setAttribute("avatar", this._activeChat.avatar || "");
        if (this._activeChat.online)
            activeChatNode.setAttribute("online", '');
        else
            activeChatNode.removeAttribute("online");
    }

    
    checkNewMessageBoxVisibility() {

        
        if (this.readOnly) {
            this._newMessageBox.remove();
        }

    }

}


customElements.define(ChatBox.tagName, ChatBox);
