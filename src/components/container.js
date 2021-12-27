const {sequelize} = require('../model')

const {getProfile} = require('../middleware/getProfile')

const { ContractRepository } = require("./contract/ContractRepository")
const { ContractService } = require("./contract/ContractService")
const { ContractController } = require("./contract/ContractController")
const { ProfileRepository } = require('./profile/ProfileRepository')
const { JobRepository } = require('./job/JobRepository')
const { JobService } = require('./job/JobService')
const { JobController } = require('./job/JobController')

const initContainer = (app) => {
    const routerInstances = []
    const middlewares = {}

    const profileRepository = new ProfileRepository(sequelize)
    middlewares.getProfile = getProfile(profileRepository)
    
    const contractRepository = new ContractRepository(sequelize)
    const contractService = new ContractService(contractRepository)
    const contractController = new ContractController(middlewares, contractService)
    routerInstances.push(contractController.getRouter())

    const jobRepository = new JobRepository(sequelize)
    const jobService = new JobService(jobRepository)
    const jobController = new JobController(middlewares, jobService)
    routerInstances.push(jobController.getRouter())

    return {
        routers: routerInstances,
        middlewares: middlewares
    }
}

module.exports = {
    initContainer
}