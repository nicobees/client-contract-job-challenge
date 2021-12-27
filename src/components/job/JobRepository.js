const { Op } = require("sequelize")

const { Repository } = require("../../classes/Repository.class")
const { JobPayError } = require("../../common/exceptions")

class JobRepository extends Repository {
    constructor(db) {
        super()
        this.setContext('Jobs')
        this.models = db.models
        this.db = db
    }

    getUnpaidJobs = async (ownerId, constractStatusList, contractStatusExcluded) => {
        const {Job, Contract} = this.models

        const whereCondition = [
            {[Op.or]: [
                { paid: false },
                { paid: { [Op.is]: null }}
            ]},
            {[Op.or]: [
                {'$Contract.ClientId$': ownerId},
                {'$Contract.ContractorId$': ownerId}
            ]}
        ]

        if(constractStatusList && constractStatusList.length) {
            if(contractStatusExcluded) {
                whereCondition.push(
                    {
                        ['$Contract.status$']: {
                            [Op.notIn]: [...constractStatusList]
                        }
                    }
                )
            } else {
                whereCondition.push(
                    {
                        ['$Contract.status$']: {
                            [Op.in]: [...constractStatusList]
                        }
                    }
                )
            }
        }
        
        const jobs = await Job.findAll(
            {
                where: whereCondition,
                include: {
                    model: Contract,
                    as: 'Contract',
                    required: true,
                    attributes: []
                }
            }
        )

        return jobs
    }

    getUnpaidClientJobById = async (jobId, clientId, constractStatusList, contractStatusExcluded) => {
        const {Job, Contract, Profile} = this.models

        const whereCondition = [
            {id: jobId},
            {[Op.or]: [
                { paid: false },
                { paid: { [Op.is]: null }}
            ]},
            {[Op.or]: [
                {'$Contract.ClientId$': clientId}
            ]}
        ]

        if(constractStatusList && constractStatusList.length) {
            if(contractStatusExcluded) {
                whereCondition.push(
                    {
                        ['$Contract.status$']: {
                            [Op.notIn]: [...constractStatusList]
                        }
                    }
                )
            } else {
                whereCondition.push(
                    {
                        ['$Contract.status$']: {
                            [Op.in]: [...constractStatusList]
                        }
                    }
                )
            }
        }
        
        const job = await Job.findOne(
            {
                where: { [Op.and]: whereCondition },
                include: {
                    model: Contract,
                    as: 'Contract',
                    required: true,
                    include: [
                        {
                            model: Profile,
                            as: 'Contractor',
                            required: true
                        },
                        {
                            model: Profile,
                            as: 'Client',
                            required: true
                        }
                    ],
                    attributes: ['id']
                }
            }
        )

        return job
    }

    payJob = async (job) => {
        try {
            const result = await this.db.transaction(async (t) => {
                await job.Contract.Client.decrement({
                    balance: job.price
                }, { transaction: t })
        
                await job.Contract.Contractor.increment({
                    balance: job.price
                }, { transaction: t })
        
                const updatedJob = await job.update({
                    paid: true,
                    paymentDate: Date.now()
                }, { transaction: t })

                return updatedJob
            });

            /* !!! fix this: don't want to reload the entire data, but I was unable to construct the response
            * using already updated data of Client and Contractor because of a circular dependency error
            */
            const fullJobUpdated = await result.reload()

            return fullJobUpdated
        } catch (error) {
            throw new JobPayError(`Error in paying Job with id ${job.id}. Transaction aborted.`)
        }
    }
}

module.exports = {
    JobRepository
}