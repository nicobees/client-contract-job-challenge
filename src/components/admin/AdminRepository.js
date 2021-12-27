const { Op } = require("sequelize")

const { Repository } = require("../../classes")

class AdminRepository extends Repository {
    constructor(db) {
        super()
        this.setContext('Admin')
        this.models = db.models
        this.db = db
    }

    findPaidOfProfessionsInDateRange = async (startDate, endDate) => {
        const { Job, Contract, Profile } = this.models
        
        const jobsProfessions = await Job.findAll(
            {
                attributes: [
                    'Contract.Contractor.profession', 
                    [this.db.fn('sum', this.db.col('price')), 'sumPrice']
                ],
                raw: true,
                where: {
                    [Op.and]: [
                        { paid: true },
                        {
                            paymentDate: {
                                [Op.gte]: startDate,
                                [Op.lte]: endDate
                            }
                        }
                    ]
                },
                include: {
                    model: Contract,
                    as: 'Contract',
                    required: true,
                    attributes: [],
                    include: {
                        model: Profile,
                        as: 'Contractor',
                        required: true,
                        attributes: []
                    }
                },
                group: ['Contract.Contractor.profession']
            }
        )

        return jobsProfessions
    }

    getMostPayingClientsInDateRange = async (startDate, endDate, limit) => {
        const { Job, Contract, Profile } = this.models
        
        const clientTotalPayments = await Job.findAll(
            {
                attributes: [
                    'Contract.Client.id',
                    'Contract.Client.firstName',
                    'Contract.Client.lastName',
                    [this.db.fn('sum', this.db.col('price')), 'paid']
                ],
                raw: true,
                where: {
                    [Op.and]: [
                        { paid: true },
                        {
                            paymentDate: {
                                [Op.gte]: startDate,
                                [Op.lte]: endDate
                            }
                        }
                    ]
                },
                include: {
                    model: Contract,
                    as: 'Contract',
                    required: true,
                    attributes: [],
                    include: {
                        model: Profile,
                        as: 'Client',
                        required: true,
                        attributes: []
                    }
                },
                group: ['Contract.Client.id'],
                order: [
                    [this.db.col('paid'), 'DESC']
                ],
                limit: limit
            }
        )

        return clientTotalPayments
    }
}

module.exports = {
    AdminRepository
}