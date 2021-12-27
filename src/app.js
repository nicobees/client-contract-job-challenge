const express = require('express');
const bodyParser = require('body-parser');

const { initContainer } = require('./components/container');

const app = express();
app.use(bodyParser.json());

const { routers, middlewares } = initContainer(app)

for(const router of routers) {
    app.use('/', router)
}


// /* @Component: Admin */
// /**
//  * Return best profession in a specific date range
//  * 
//  * @GET
//  * @returns profession
//  */
//  app.get('/admin/best-profession', getProfile, async (req, res) =>{
//     const {Contract, Job, Profile} = req.app.get('models')
//     const {start, end} = req.query

//     const startDate = new Date(start)
//     const endDate = new Date(`${end} 23:59:59.999 GMT`)

//     /* @Repository */
//     const jobsProfessions = await Job.findAll(
//         {
//             attributes: [
//                 'Contract.Contractor.profession', 
//                 [sequelize.fn('sum', sequelize.col('price')), 'sumPrice']
//             ],
//             raw: true,
//             where: {
//                 [Op.and]: [
//                     { paid: true },
//                     {
//                         paymentDate: {
//                             [Op.gte]: startDate,
//                             [Op.lte]: endDate
//                         }
//                     }
//                 ]
//             },
//             include: {
//                 model: Contract,
//                 as: 'Contract',
//                 required: true,
//                 attributes: [],
//                 include: {
//                     model: Profile,
//                     as: 'Contractor',
//                     required: true,
//                     attributes: []
//                 }
//             },
//             group: ['Contract.Contractor.profession']
//         }
//     )
//     /**************/

//     const bestProfession = jobsProfessions.reduce((prev, current) => {
//         return (prev.sumPrice > current.sumPrice) ? prev : current
//     })

//     res.json({result: true, data: {profession: bestProfession.profession}})
// })

// /* @Component: Admin */
// /**
//  * Return the list of Clients (Profile) that most paid for Jobs in a specific date range
//  * 
//  * @GET
//  * @returns Profile clients list
//  */
//  app.get('/admin/best-clients', getProfile, async (req, res) =>{
//     const {Contract, Job, Profile} = req.app.get('models')
//     const {start, end, limit} = req.query

//     const startDate = new Date(start)
//     const endDate = new Date(`${end} 23:59:59.999 GMT`)

//     const limitValue = limit || 2

//     /* @Repository */
//     const clientTotalPayments = await Job.findAll(
//         {
//             attributes: [
//                 'Contract.Client.id',
//                 'Contract.Client.firstName',
//                 'Contract.Client.lastName',
//                 // [sequelize.col('Contract.Client.fullName'), 'fullName'],
//                 [sequelize.fn('sum', sequelize.col('price')), 'paid']
//             ],
//             raw: true,
//             where: {
//                 [Op.and]: [
//                     { paid: true },
//                     {
//                         paymentDate: {
//                             [Op.gte]: startDate,
//                             [Op.lte]: endDate
//                         }
//                     }
//                 ]
//             },
//             include: {
//                 model: Contract,
//                 as: 'Contract',
//                 required: true,
//                 attributes: [],
//                 include: {
//                     model: Profile,
//                     as: 'Client',
//                     required: true,
//                     attributes: []
//                 }
//             },
//             group: ['Contract.Client.id'],
//             order: [
//                 [sequelize.col('paid'), 'DESC']
//             ],
//             limit: limitValue
//         }
//     )
//     /**************/
    
//     const result = clientTotalPayments.map(client => {
//         return {
//             id: client.id,
//             fullName: `${client.firstName} ${client.lastName}`,
//             paid: client.paid
//         }
//     })

//     res.json(result)
// })

module.exports = app;
