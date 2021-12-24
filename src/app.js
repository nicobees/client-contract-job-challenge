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
 * @returns jobs list
 */
 app.get('/jobs/unpaid', getProfile, async (req, res) =>{
    const {Contract, Job} = req.app.get('models')
    
    /* Repository */
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

module.exports = app;
