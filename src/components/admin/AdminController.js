const { Router } = require("express")
const { Controller } = require("../../classes")

class AdminController extends Controller {
    constructor(middlewares, adminService) {
        super()
        this.setContext('Admin')
        this.setPath('/admin')

        this.setRouter(Router())
        this.adminService = adminService

        this.getRouter().get(`${this.getPath()}/best-profession`, middlewares.getProfile, this.getBestProfession)
        this.getRouter().get(`${this.getPath()}/best-clients`, middlewares.getProfile, this.getBestClients)
    }

    /**
     * Return best profession in a specific date range
     * 
     * @GET
     * @returns profession
     */
    getBestProfession = async (req, res, next) => {
        const {start, end} = req.query

        const startDate = new Date(start)
        const endDate = new Date(`${end} 23:59:59.999 GMT`)
        
        const bestProfession = await this.adminService.getMostPaidProfessionInDateRange(startDate, endDate)

        res.json(bestProfession)
    }

    /**
     * Return the list of Clients (Profile) that most paid for Jobs in a specific date range
     * 
     * @GET
     * @returns Profile clients list
     */
    getBestClients = async (req, res, next) => {
        const {start, end, limit} = req.query

        const startDate = new Date(start)
        const endDate = new Date(`${end} 23:59:59.999 GMT`)

        const limitValue = limit || 2
        
        const mostPayingClients = await this.adminService.getMostPayingClientsInDateRange(startDate, endDate, limitValue)

        res.json(mostPayingClients)
    }
}

module.exports = {
    AdminController
}