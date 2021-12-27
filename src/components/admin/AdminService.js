const { Service } = require("../../classes")

class AdminService extends Service {
    adminRepository

    constructor(adminRepository) {
        super()
        this.setContext('Admin')
        this.adminRepository = adminRepository
    }

    getMostPaidProfessionInDateRange = async (startDate, endDate) => {
        const jobsProfessionsInDateRange = await this.adminRepository.findPaidOfProfessionsInDateRange(startDate, endDate)

        const bestProfession = jobsProfessionsInDateRange.reduce((prev, current) => {
            return (prev.sumPrice > current.sumPrice) ? prev : current
        })

        return bestProfession
    }
    
    getMostPayingClientsInDateRange = async (startDate, endDate, limit) => {
        const clientTotalPayments = await this.adminRepository.getMostPayingClientsInDateRange(startDate, endDate, limit)

        const mappedClientsList = clientTotalPayments.map(client => {
            return {
                id: client.id,
                fullName: `${client.firstName} ${client.lastName}`,
                paid: client.paid
            }
        })

        return mappedClientsList
    }
}

module.exports = {
    AdminService
}