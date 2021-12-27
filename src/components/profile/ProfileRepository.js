const { Repository } = require("../../classes/Repository.class")

class ProfileRepository extends Repository {
    constructor(db) {
        super()
        this.setContext('Profile')
        this.models = db.models
    }

    getProfileById = async (profileId) => {
        const {Profile} = this.models
        
        const profile = await Profile.findOne({where: {id: profileId || 0}})

        return profile
    }
}

module.exports = {
    ProfileRepository
}