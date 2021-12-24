const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require("sequelize");

const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/* @Component: Contract */
/**
 * Get Contract by Id
 * 
 * If the logged Profile is not "owner" of the Contract then return 404 NotFound
 * Both Client and Contractor are considered "owners" of the Contract
 * 
 * @GET
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    const {id} = req.params

    /* @Repository */
    const contract = await Contract.findOne(
        {
            where: {
                id: id,
                [Op.or]: [
                    {ClientId: req.profile.id},
                    {ContractorId: req.profile.id}
                ]
            }
        }
    )
    /**************/

    if(!contract) return res.status(404).end()
    res.json(contract)
})

/**
 * Get all the non-terminated Contracts of the logged Profile
 * 
 * @GET
 * @returns contracts list
 */
 app.get('/contracts/', getProfile ,async (req, res) =>{
    const {Contract} = req.app.get('models')
    
    /* @Repository */
    const contracts = await Contract.findAll(
        {
            where: {
                status: {
                    [Op.notIn]: ['terminated'],
                },
                [Op.or]: [
                    {ClientId: req.profile.id},
                    {ContractorId: req.profile.id}
                ]
            }
        }
    )
    /**************/
    res.json(contracts)
})

/* @Component: Job */
/**
 * Get all unpaid Jobs for only the "active" contracts of the logged Profile
 * 
 * @GET
 * @returns jobs list
 */
 app.get('/jobs/unpaid', getProfile, async (req, res) =>{
    const {Contract, Job} = req.app.get('models')
    
    /* @Repository */
    const jobs = await Job.findAll(
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
                        {'$Contract.ClientId$': req.profile.id},
                        {'$Contract.ContractorId$': req.profile.id}
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
    /**************/
    res.json(jobs)
})

/* @Component: Job */
/**
 * Pay for the specified Jog: the Job price will be moved from the Client balance to the Contractor balance
 * 
 * @POST
 * @returns job updated
 */
 app.post('/jobs/:job_id/pay', getProfile, async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const {job_id} = req.params

    // 1) Get Job data: only if the Job is unpaid and only if logged Profile is Client of the Contract of the specified Job, otherwise return 404 (open point)
    
    /* @Service */
    /* !!! IMPORTANT: the logic at step 1 is already been implemented in GET /jobs/unpaid API, reuse this in future improvement to write DRY code */

    /* @Repository */
    const job = await Job.findOne(
        {
            where: {
                id: job_id,
                [Op.and]: [
                    {[Op.or]: [
                        { paid: false },
                        { paid: { [Op.is]: null }}
                    ]},
                    {'$Contract.status$': {
                        [Op.notIn]: ['terminated'],
                    }},
                    {'$Contract.ClientId$': req.profile.id} // get Job only if current logged Profile is Client of the relative Contract of the Job
                ]
            },
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
    /**************/
    /**************/

    if(!job) return res.status(404).end()
    
    /* @Service */
    // 2) check if logged Profile (being a Client) has enough Balance to pay for the specified Job: if no, response is 400 with custom message error
    if(!req.profile.balance || req.profile.balance < job.price) {
        return res.status(400).json({result: false, message: 'Current logged user has not enough Balance to pay for this Job'}).end()
    }
    /**************/

    // 3) if we reach this point, then the Job can be paid:
    // 3.1) then move the balance from the Client to the Contractor
    // 3.2) then update the Job to reflect the paiment
    // IMPORTANT: "transaction" will be used from Sequelize in order to manage the two operations 3.1 and 3.2 consistently in case of errors

    
    try {
        /* @Repository */
        const result = await sequelize.transaction(async (t) => {
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
        /**************/

        /* !!! fix this: don't want to reload the entire data, but I was unable to construct the response
         * using already updated data of Client and Contractor because of a circular dependency error
        */
        const fullJobUpdated = await result.reload()

        res.json(fullJobUpdated)
    } catch (error) {
        res.status(500).json({result: false, message: `Error in paying Job with id ${job_id}`}).end()
    }
})

/* @Component: Balance */
/**
 * Deposit into the balance of the current logged Profile, with specified limits (< 25% of the total Jobs to be paid at the moment of deposit)
 * 
 * @POST
 * @returns job updated
 */
 app.post('/balances/deposit/:userId', getProfile, async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const {userId} = req.params
    const {deposit} = req.body

    // 1) Get Job data - to write DRY code refer to API /jobs/:job_id/pay
    /* @Repository */
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
                        {'$Contract.ClientId$': userId}
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
    /**************/

    /* @Service */
    if(deposit > (maxDepositAmount * 0.25)) {
        res.status(400).json({result: false, message: `Deposit is more than the 25% of the maximum allowed ${maxDepositAmount}`})
    }
    /**************/
    
    /* @Repository */
    const userProfile = await Profile.findByPk(userId)
    const updatedProfile = await userProfile.increment({balance: deposit})
    /**************/
    
    res.json(await updatedProfile.reload()) // TODO - improve the previous increment call if possible to avoid this reload()
})

/* @Component: Admin */
/**
 * Return best profession in a specific date range
 * 
 * @GET
 * @returns profession
 */
 app.get('/admin/best-profession', getProfile, async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const {start, end} = req.query

    const startDate = new Date(start)
    const endDate = new Date(`${end} 23:59:59.999 GMT`)

    /* @Repository */
    const jobsProfessions = await Job.findAll(
        {
            attributes: [
                'Contract.Contractor.profession', 
                [sequelize.fn('sum', sequelize.col('price')), 'sumPrice']
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
    /**************/

    const bestProfession = jobsProfessions.reduce((prev, current) => {
        return (prev.sumPrice > current.sumPrice) ? prev : current
    })

    res.json({result: true, data: {profession: bestProfession.profession}})
})

/* @Component: Admin */
/**
 * Return the list of Clients (Profile) that most paid for Jobs in a specific date range
 * 
 * @GET
 * @returns Profile clients list
 */
 app.get('/admin/best-clients', getProfile, async (req, res) =>{
    const {Contract, Job, Profile} = req.app.get('models')
    const {start, end, limit} = req.query

    const startDate = new Date(start)
    const endDate = new Date(`${end} 23:59:59.999 GMT`)

    const limitValue = limit || 2

    /* @Repository */
    const clientTotalPayments = await Job.findAll(
        {
            attributes: [
                'Contract.Client.id',
                'Contract.Client.firstName',
                'Contract.Client.lastName',
                // [sequelize.col('Contract.Client.fullName'), 'fullName'],
                [sequelize.fn('sum', sequelize.col('price')), 'paid']
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
                [sequelize.col('paid'), 'DESC']
            ],
            limit: limitValue
        }
    )
    /**************/
    
    const result = clientTotalPayments.map(client => {
        return {
            id: client.id,
            fullName: `${client.firstName} ${client.lastName}`,
            paid: client.paid
        }
    })

    res.json(result)
})

module.exports = app;
