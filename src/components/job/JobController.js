const { Router } = require("express")
const { Controller } = require("../../classes")
const { NotFoundError, ClientCanNotPay, JobPayError } = require("../../common/exceptions")

class JobController extends Controller {
    constructor(middlewares, jobService) {
        super()
        this.setContext('Jobs')
        this.setPath('/jobs')

        this.setRouter(Router())
        this.jobService = jobService

        this.getRouter().get(`${this.getPath()}/unpaid`, middlewares.getProfile, this.getUnpaidJobs)
        this.getRouter().post(`${this.getPath()}/:job_id/pay`, middlewares.getProfile, this.payJob)
    }

    /**
     * Get all unpaid Jobs for only the "active" contracts of the logged Profile
     * 
     * @GET
     * @returns jobs list
     */
     getUnpaidJobs = async (req, res, next) => {
        const jobs = await this.jobService.getUnpaidJobsInActiveContracts(req.profile.id)

        res.json(jobs)
    }

    /**
     * Pay for the specified Job: the Job price will be moved from the Client balance to the Contractor balance
     * 
     * @POST
     * @returns job updated
     */
    payJob = async (req, res, next) => {
        try {
            const {job_id} = req.params
            
            const paidJob = await this.jobService.payJob(job_id, req.profile)
    
            res.json(paidJob)
        } catch(e) {
            if(e instanceof NotFoundError) {
                res.status(404).end()
                return
            }
            if(e instanceof ClientCanNotPay) {
                res.status(400).json({result: false, message: e.message}).end()
                return
            }
            if(e instanceof JobPayError) {
                res.status(500).json({result: false, message: e.message}).end()
            }
            throw e
        }
    }
}

module.exports = {
    JobController
}