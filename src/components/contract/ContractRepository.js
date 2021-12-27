const { Op } = require("sequelize")

const { Repository } = require("../../classes/Repository.class")

class ContractRepository extends Repository {
    constructor(db) {
        super()
        this.setContext('Contract')
        this.models = db.models
    }

    getOwnedContractById = async (contractId, ownerId) => {
        const {Contract} = this.models
        
        const contract = await Contract.findOne(
            {
                where: {
                    id: contractId,
                    [Op.or]: [
                        {ClientId: ownerId},
                        {ContractorId: ownerId}
                    ]
                }
            }
        )
        
        return contract
    }

    getOwnedContracts = async (ownerId, statusList, statusExcluded) => {
        const {Contract} = this.models
        const whereCondition = {
            [Op.or]: [
                {ClientId: ownerId},
                {ContractorId: ownerId}
            ]
        }

        if(statusList && statusList.length) {
            if(statusExcluded) {
                whereCondition.status = {
                    [Op.notIn]: [...statusList]
                }
            } else {
                whereCondition.status = {
                    [Op.in]: [...statusList]
                }
            }
        }
        
        const contracts = await Contract.findAll(
            {
                where: whereCondition
            }
        )
        
        return contracts
    }
}

module.exports = {
    ContractRepository
}