window.APP_EVENTS = {
    PROFILE_BTN_CLICK: "profile-btn-click",
    CHAT_CLICKED: "chat-clicked",
    CHAT_SELECTED: "chat-selected",
    AUTHED_USER_NEW_MESSAGE: "authed-user-new-message",
    USER_SIGN_IN: "user-sign-in",
    SEARCH_IN_CHATS: "search-in-chats",
    NEW_MESSAGE_RECEIVE: "new-message-receive",
    CHAT_BOX_BACK_CLICKED: "chat-box-back-clicked",
    DESELECT_SELECTED_CHAT: "deselect-selected-chat",
};


class ChatApp {

    constructor(appId) {
        this.assert(appId, "app container id not passed.");
        this._app = document.getElementById(appId);
        
        this.assert(this._app, `Container with id "${appId}" not found. `);

        this._authedUser = null;
        this._chats = [];
        this._messages = [];
        this._componenets = {};

        
        this.assignComponents();

        
        this.initListeners();

        
        this.sendChatsToList();
    }

    
    assignComponents() {
        this._componenets.authedUser = document.querySelector("authed-user");
        this._componenets.appBranch = document.querySelector("app-brand");
        this._componenets.chatsList = document.querySelector("chats-list");
        this._componenets.chatBox = document.querySelector("chat-box");
    }

   
    initListeners() {
        this._componenets.appBranch.on(APP_EVENTS.PROFILE_BTN_CLICK, this._onProfileBtnClick.bind(this));
        this._componenets.chatsList.on(APP_EVENTS.CHAT_SELECTED, this._onChatSelected.bind(this));
        this._componenets.chatBox.on(APP_EVENTS.AUTHED_USER_NEW_MESSAGE, this._onAuthedUserNewMessages.bind(this));
        this._componenets.chatBox.on(APP_EVENTS.CHAT_BOX_BACK_CLICKED, this._onChatBoxBack.bind(this));
    }

   
    signin(user) {
        
        this.assert(user && user.id, "Invalid user object");
        this._authedUser = user;

       
        this._componenets.authedUser.setUser(this._authedUser);
        this._componenets.authedUser.hidden = true;
        this._componenets.chatBox.emit(APP_EVENTS.USER_SIGN_IN, {id: user.id});
    }

    
    newMessage(msg) {
        
        this.assert(msg && msg.time && msg.sender && msg.text && msg.toChat,
            `Invalid message object.`);

        
        this._messages.push(msg);

        if (this.activeChat && msg.sender === this.activeChat.id) {
            this._componenets.chatBox.renderMessage(msg);
        }
        
        this._componenets.chatsList.emit(APP_EVENTS.NEW_MESSAGE_RECEIVE, msg);
    }

    get authedUser() {
        return this._authedUser;
    }

    
    _onProfileBtnClick() {

        this._componenets.authedUser.hidden = !this._componenets.authedUser.hidden
    }

  ]
    _onChatSelected({detail}) {
        
        const chatMessaged = this._messages.filter(m => m.sender === detail.id || m.toChat === detail.id);

        
        this.activeChat = this._chats.find(c => c.id === detail.id);

        
        if (this._componenets.chatBox.activeChat && this._componenets.chatBox.activeChat.id === this.activeChat.id) {
            this._componenets.chatBox.scrollToEnd();
            return;
        }

        
        this.activeChat.elm.markAllAsRead();
        
        this._componenets.chatBox.setActiveChat(this.activeChat);

        
        chatMessaged.map(msg => {
            this._componenets.chatBox.renderMessage(msg)
        })
    }

   
    _onAuthedUserNewMessages({detail}) {
        
        this._messages.push({...detail, sender: this.authedUser.id})
    }

    _onChatBoxBack() {
        this._componenets.chatsList.emit(APP_EVENTS.DESELECT_SELECTED_CHAT);
    }

   
    sendChatsToList() {
        if (!this._chats)
            return;

        this._componenets.chatsList.setChats(this._chats)
    }

    
    addChat(chat) {
        // check the validity of chat object
        this.assert(chat && chat.id, `Invalid chat object.`);

        // update chats array
        this._chats.push(chat);

        this.sendChatsToList();
    }

    
    assert(condition, error) {
        if (!condition)
            throw new Error(`${error}`)
    }
}
