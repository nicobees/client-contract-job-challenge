const { Service } = require("../../classes")
const { NotFoundError, ClientCanNotPay } = require("../../common/exceptions")

class JobService extends Service {
    jobRepository

    constructor(jobRepository) {
        super()
        this.setContext('Jobs')
        this.jobRepository = jobRepository
    }

    getUnpaidJobsInActiveContracts = async (ownerId) => {
        return await this.jobRepository.getUnpaidJobs(ownerId, ['terminated'], true)
    }
    
    payJob = async (jobId, client) => {
        // 1) Get Job data: only if the Job is unpaid and only if logged Profile is Client of the Contract of the specified Job, otherwise throw error in order to return 404 (open point)
        const job = await this.jobRepository.getUnpaidClientJobById(jobId, client.id, ['terminated'], true)

        if(!job) {
            throw new NotFoundError(`Job with id ${jobId} not found`)
        }

        // 2) check if logged Profile (being a Client) has enough Balance to pay for the specified Job: if no, response is 400 with custom message error
        if(!client.balance || client.balance < job.price) {
            throw new ClientCanNotPay(`Current logged user has not enough Balance to pay for Job with id ${jobId}`)
        }

        // 3) if we reach this point, then the Job can be paid:
        // 3.1) then move the balance from the Client to the Contractor
        // 3.2) then update the Job to reflect the paiment
        // IMPORTANT: "transaction" will be used from Sequelize in order to manage the two operations 3.1 and 3.2 consistently in case of errors

        const fullJobUpdated = await this.jobRepository.payJob(job)

        return fullJobUpdated
    }
}

module.exports = {
    JobService
}