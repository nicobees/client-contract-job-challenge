const { BaseClass } = require("./BaseClass.class")

class Service extends BaseClass {
    constructor () {
        super()
        this.setTier('Service')
    }
}

module.exports = {
    Service
}