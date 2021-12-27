const { BaseClass } = require("./BaseClass.class")

class Repository extends BaseClass {
    constructor () {
        super()
        this.setTier('Repository')
    }
}

module.exports = {
    Repository
}