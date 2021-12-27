const { Op } = require("sequelize")

const { Repository } = require("../../classes")

class ProfileRepository extends Repository {
    constructor(db) {
        super()
        this.setContext('Profile/Balance')
        this.models = db.models
        this.db = db
    }

    getProfileById = async (profileId) => {
        const { Profile } = this.models
        
        const profile = await Profile.findOne({where: {id: profileId}})

        return profile
    }

    getPriceSumUnpaidJobsByClientId = async (clientId) => {
        const { Job, Contract } = this.models
        
        const maxDepositAmount = await Job.sum('price',
            {
                where: {
                    [Op.and]: [
                        {[Op.or]: [
                            { paid: false },
                            { paid: { [Op.is]: null }}
                        ]},
                        {'$Contract.status$': {
                            [Op.notIn]: ['terminated'],
                        }},
                        {[Op.or]: [
                            {'$Contract.ClientId$': clientId}
                        ]}
                    ]
                },
                include: {
                    model: Contract,
                    as: 'Contract',
                    required: true,
                    attributes: []
                }
            }
        )

        return maxDepositAmount
    }

    depositAmountIntoClientBalance = async (clientId, amount) => {
        const userProfile = await this.getProfileById(clientId)
        const updatedProfile = await userProfile.increment({balance: amount})

        return await updatedProfile.reload()
    }
}

module.exports = {
    ProfileRepository
}