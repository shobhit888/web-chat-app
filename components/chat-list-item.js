class ChatListItem extends Component {

    
    static get attrTypes() {
        return {
            id: {
                type: "string",
                required: true,
            },
            name: {
                type: "string",
                required: true,
                observe: true
            },
            desc: {
                type: "string",
                observe: true
            },
            avatar: {
                type: "string",
                observe: true
            },
            lastseen: {
                type: "string",
                observe: true
            },
            unreadcount: {
                type: "number",
                observe: true
            },
            online: {
                type: "boolean",
                observe: true
            },
        };
    }

    
    static get observedAttributes() {
        return super.getObservedAttrs(ChatListItem.attrTypes);
    }

    
    static get tagName() {
        return super.generateTagName(ChatListItem.name);
    }

    
    static get style() {
        return (`<style>
                    :host {
                        --primaryColor:  #3AD07A;
                        --hoverColor: #edfbf3;
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        padding: .75em .5rem;
                        position: relative;
                        cursor: pointer;
                    }
                    :host([hidden]) {
                        display: none;
                    }
                    * {
                        box-sizing: border-box;
                        user-select: none;                        
                    }
                    :host(:hover) {
                        background: var(--hoverColor);
                    }
                    :host([selected]) {
                        box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.1);
                        position: relative;
                        z-index: 1;
                    }
                    .avatar-container {
                        flex: 0 0 3em;
                        width: 3em;
                        height: 3em;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        margin-right: 1em;
                        background: #efefef;
                        font-weight: bold;
                        font-size: 1em;
                        position: relative;
                        border-radius: 50%;                        
                    }
                    .avatar-container img {
                        max-width: 100%;
                        border-radius: 50%;                        
                        position: relative;
                        z-index: 1;
                    }
                    .avatar-container .char-avatar {
                        position: absolute;
                        z-index: 0;
                    }
                    .online-badge {
                        position: absolute;
                        right: 4px;
                        bottom: 0;
                        width: 12px;
                        height: 12px;
                        background: var(--primaryColor);
                        display: inline-block;
                        border-radius: 50%;
                        border: 2px solid #fff;
                        visibility: hidden;
                        opacity: 0;
                        z-index: 2;
                    }
                     :host([online]) .online-badge {
                        visibility: visible;
                        opacity: 1;
                    }                    
                    .item-details {
                        flex: 0 1 100%;
                        position: relative;
                    }
                    #name {
                        margin: 0 0 .3em 0;
                        font-size: 1em;
                    }
                    #desc {
                        margin: 0;
                        font-size: .8em;
                        opacity: .4;
                        max-width: 80%;
                        overflow: hidden;
                        display: block;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .item-meta {
                        position: absolute;
                        right: 0;
                        top: 0;
                        display: flex;
                        flex-direction: column-reverse;
                        justify-content: center;
                        align-items: flex-end;
                    }
                    #lastseen {
                        font-size: .7em;
                        opacity: .5;
                        margin-top: .65em;
                    }
                    #unreadcount {
                        background: var(--primaryColor);
                        width: 18px;
                        height: 18px;
                        border-radius: 50%;
                        text-align: center;
                        color: #fff;
                        font-size: .7em;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        visibility: hidden;
                        opacity: 0;
                        overflow: hidden;
                        text-overflow: clip;
                    }
                    :host([unread]) #unreadcount {
                        visibility: visible;
                        opacity: 1;
                    }
                </style>`)
    }

   
    static get template() {
        return (`
            <template>
                ${ChatListItem.style}
                <div class="avatar-container">
                    <span class="online-badge"></span>
                    <img src="" id="avatar">
                    <span class="char-avatar"></span>
                </div>
                <div class="item-details">
                        <h3 id="name"></h3>
                        <p id="desc"></p>
                        <div class="item-meta">
                            <span id="lastseen"></span>
                            <span id="unreadcount"></span>
                        </div>
                    </div>
            </template>
            `)
    }

    constructor() {
        super({
            attrTypes: ChatListItem.attrTypes,
            template: ChatListItem.template
        });

        
        this.render();
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

        
        this.render();
    }

  
    set selected(value) {
        if (value) {
            this.setAttribute('selected', '');

        } else {
            this.removeAttribute('selected');
        }
    }

    get selected() {
        return this.hasAttribute('selected');
    }

    
    incrementUnreadCount() {
        let count = 0;
        if (this.getAttribute("unreadcount"))
            count = parseInt(this.getAttribute("unreadcount"));

        this.setAttribute('unreadcount', count + 1);
    }

   
    markAllAsRead() {
        this.setAttribute('unreadcount', '0');
    }

    
    set unread(value) {
        if (value)
            this.setAttribute('unread', '');
        else
            this.removeAttribute('unread');
    }

    get unread() {
        return this.hasAttribute('unread');
    }

    
    set online(value) {
        if (value)
            this.setAttribute('online', '');
        else
            this.removeAttribute('online');
    }

    get online() {
        return this.hasAttribute('online');
    }

   
    initListeners() {
        this.on("click", this._onClick)
    }

    
    removeListeners() {
        this.off("click", this._onClick)
    }

  
    _onClick(e) {
        e.preventDefault();
        if (this.disabled) {
            return;
        }

        
        this.emit(APP_EVENTS.CHAT_CLICKED, {id: this.getAttribute("id")});
        this.selected = true;
        
        this.markAllAsRead();
    }

   
    render() {

        
        if (!("id" in this.attributes)) {
            this.remove()
        }

        if (!this.getAttribute("avatar")) {
            
            const name = (this.getAttribute("name") || "").toUpperCase();
            this.shadowRoot.querySelector(".char-avatar").innerText = name.substr(0, 1);
        }

        for (let attr of this.attributes) {
            const target = this.shadowRoot.getElementById(attr.name);
            if (target)
                target.innerText = attr.value;

            switch (attr.name) {
                case "avatar":
                    target.src = attr.value;
                    break;

                case "unreadcount":
                    this.unread = parseInt(attr.value) > 0;
                    break;

            }

        }
    }

}


customElements.define(ChatListItem.tagName, ChatListItem);
