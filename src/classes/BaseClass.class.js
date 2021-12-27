class BaseClass {
    context
    tier

    setContext(context) {
        this.context = context
    }

    getContext(context) {
        return this.context
    }

    setTier(tier) {
        this.tier = tier
    }

    getTier() {
        return this.tier
    }
}

module.exports = {
    BaseClass
}