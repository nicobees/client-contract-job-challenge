const { BaseClass } = require("./BaseClass.class")

class Controller extends BaseClass {
    path
    router

    constructor () {
        super()
        this.setTier('Controller')
    }

    setPath(path) {
        this.path = path
    }

    getPath() {
        return this.path
    }

    setRouter(router) {
        this.router = router
    }

    getRouter() {
        return this.router
    }
}

module.exports = {
    Controller
}