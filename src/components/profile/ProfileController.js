const { Router } = require("express")
const { Controller } = require("../../classes")
const { BalanceDepositOverMaxLimit } = require("../../common/exceptions")

class ProfileController extends Controller {
    constructor(middlewares, profileService) {
        super()
        this.setContext('Profile/Balance')
        this.setPath('/balances')

        this.setRouter(Router())
        this.profileService = profileService

        this.getRouter().post(`${this.getPath()}/deposit/:userId`, middlewares.getProfile, this.depositOnClient)
    }

    /**
     * Deposit into the balance of the current logged Profile, with specified limits (< 25% of the total Jobs to be paid at the moment of deposit)
     * 
     * @POST
     * @returns job updated
     */
    depositOnClient = async (req, res, next) => {
        try {
            const {userId} = req.params
            const {deposit} = req.body
            
            const updatedProfile = await this.profileService.depositIntoClientBalance(userId, deposit)

            res.json(updatedProfile)
        } catch(e) {
            if(e instanceof BalanceDepositOverMaxLimit) {
                res.status(400).json({result: false, message: e.message})
                return
            }
            throw e
        }
    }
}

module.exports = {
    ProfileController
}