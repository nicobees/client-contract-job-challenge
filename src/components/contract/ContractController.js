const { Router } = require("express")
const { Controller } = require("../../classes")

class ContractController extends Controller {
    constructor(middlewares, contractService) {
        super()
        this.setContext('Contracts')
        this.setPath('/contracts')

        this.setRouter(Router())
        this.contractService = contractService

        this.getRouter().get(`${this.getPath()}/:id`, middlewares.getProfile, this.getContractById)
        this.getRouter().get(`${this.getPath()}/`, middlewares.getProfile, this.getOpenContracts)
    }

    /**
     * Get Contract by Id
     * 
     * If the logged Profile is not "owner" of the Contract then return 404 NotFound
     * Both Client and Contractor are considered "owners" of the Contract
     * 
     * @GET
     * @returns contract by id
     */
    getContractById = async (req, res, next) => {
        const {id} = req.params
        
        const contract = await this.contractService.getOwnedContractById(id, req.profile.id)

        if(!contract) return res.status(404).end()

        res.json(contract)
    }

    /**
     * Get all the non-terminated Contracts of the logged Profile
     * 
     * @GET
     * @returns contracts list
     */
    getOpenContracts = async (req, res, next) => {
        const contracts = await this.contractService.getOwnedOpenContracts(req.profile.id)

        res.json(contracts)
    }
}

module.exports = {
    ContractController
}