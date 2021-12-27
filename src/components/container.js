const {sequelize} = require('../model')

const { getProfile } = require('../middleware')

const { ContractController, ContractService, ContractRepository } = require("./contract")
const { JobController, JobService, JobRepository } = require("./job/")
const { ProfileController, ProfileService, ProfileRepository } = require("./profile")

const initContainer = (app) => {
    const routerInstances = []
    const middlewares = {}
    
    const profileRepository = new ProfileRepository(sequelize)
    const profileService = new ProfileService(profileRepository)
    
    middlewares.getProfile = getProfile(profileService)
    
    const profileController = new ProfileController(middlewares, profileService)
    routerInstances.push(profileController.getRouter())

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