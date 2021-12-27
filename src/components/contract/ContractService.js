const { Service } = require("../../classes")

class ContractService extends Service {
    contractRepository

    constructor(contractRepository) {
        super()
        this.setContext('Contracts')
        this.contractRepository = contractRepository
    }

    getOwnedContractById = async (contractId, ownerId) => {
        return await this.contractRepository.getOwnedContractById(contractId, ownerId)
    }
    
    getOwnedOpenContracts = async (ownerId) => {
        return await this.contractRepository.getOwnedContracts(ownerId, ['terminated'], true)
    }
}

module.exports = {
    ContractService
}