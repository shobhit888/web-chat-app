
class Component extends HTMLElement {

    constructor({attrTypes, template, shadowMode = "open"}) {
        super();

        this.attrTypes = attrTypes;
        this._template = template;
        this._shadowMode = shadowMode;

        this.makeShadow();
    }

    
    connectedCallback() {
        
        this.checkAttrs();
        
        if (this.onMount && typeof this.onMount === "function")
            this.onMount();
    }

    
    disconnectedCallback() {
       
        if (this.onUnmount && typeof this.onUnmount === "function")
            this.onUnmount();
    }

    
    parseAttrType(value, target) {
        if (value === void 0 || value === null)
            return value;

        switch (target) {
            case "n":
            case "number":
                value = value.indexOf(".") ? parseFloat(value) : parseInt(value);
                break;

            case "o":
            case "object":
                value = JSON.parse(value);
                break;

            case "b":
            case "bool":
            case "boolean":
                value = Boolean(value);
                break;

            default:
                value = value.toString()
        }

        return value;
    }

    
    checkAttrs() {
        if (!this.attrTypes)
            return;

        for (let [attr, details] of Object.entries(this.attrTypes)) {

            let value = this.parseAttrType(this.getAttribute(attr), details.type);

            
            if (value !== null)
                this.setAttribute(attr, value || "");

            if (details.required)
                this.assert(!!value,
                    `"${attr}" attr is knows as required but not passed to component.`);

            if (value !== null && details.type) {
                this.assert(typeof value === details.type,
                    `The type of "${attr}" attr must be ${details.type}.`);
            }

        }
    }

  
    assert(condition, error) {
        if (!condition)
            console.error(`Warning: ${error}`)
    }

   
    parseTemplate() {
        let parser = new DOMParser();
        const doc = parser.parseFromString(this._template, 'text/html');

        return doc.querySelector("template").content.cloneNode(true);
    }

   
    makeShadow() {
       
        const template = this.parseTemplate();

      
        this.attachShadow({mode: this._shadowMode}).appendChild(template);
    }

   
    emit(event, detail) {
        this.dispatchEvent(new CustomEvent(event, {detail}));
    }

   
    on(event, callback) {
        this.shadowRoot.host.addEventListener(event, callback.bind(this))
    }

   
    off(event, callback) {
        this.shadowRoot.host.removeEventListener(event, callback.bind(this))
    }

    get disabled() {
        return this.hasAttribute('disabled');
    }

    
    set disabled(val) {
        const isDisabled = Boolean(val);
        if (isDisabled)
            this.setAttribute('disabled', '');
        else
            this.removeAttribute('disabled');
    }

   
    static generateTagName(className) {
        return className.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

   
    static getObservedAttrs(attrTypes = {}) {
        return Object.entries(attrTypes || {})
            .filter(([_, details]) => details.observe)
            .map(([attr, _]) => attr);
    }

}
