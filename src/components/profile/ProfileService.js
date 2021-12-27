const { Service } = require("../../classes/Service.class")
const { BalanceDepositOverMaxLimit } = require("../../common/exceptions")

class ProfileService extends Service {
    profileRepository

    constructor(profileRepository) {
        super()
        this.setContext('Profile/Balance')
        this.profileRepository = profileRepository
    }

    getProfileById = async (profileId) => {
        return await this.profileRepository.getProfileById(profileId)
    }

    depositIntoClientBalance = async (clientId, amount) => {
        const sumPriceOfUnpaidJobs = await this.profileRepository.getPriceSumUnpaidJobsByClientId(clientId)
        const maxDepositAmount = sumPriceOfUnpaidJobs * 0.25
        
        if(amount > maxDepositAmount) {
            throw new BalanceDepositOverMaxLimit(`Deposit is more than the maximum allowed ${maxDepositAmount} for Client with id ${clientId}`)
        }

        const updatedProfile = await this.profileRepository.depositAmountIntoClientBalance(clientId, amount)

        return updatedProfile
    }
}

module.exports = {
    ProfileService
}