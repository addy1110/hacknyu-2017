class Dispatcher {
    constructor(){
        this.handlers = {};
    }

    register(context, handler) {
        this.handlers[context] = handler;
    }

    handleMessage(message, reply, actions) {

    }

    handlerPostback(postbackMessage, reply, actions) {

    }
}