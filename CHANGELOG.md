This Changelog file contains useful info about the steps involved in the technical challenge, such as main architectural choices and approaches followed.
Start from the bottom of the file to follow chronological order.

### API#3
Notes:
- in the response, only Job data are included (nested Contract data, for each Job, are not included)
- since now on I will also add comment annotations with "@Component" to mark what code may be refered to a single Component in the 3-tier architecture future improvement: briefly, each Component may have a Controller, a Service and a Repository, in order to have every Component fully autonomous, but anyway Components can exchange data to each other using Dependency Injection (generally this is implemented at Service layer)

Open points:
- is it correct to retrieve all the Contracts, being the logged Profile both Client or Contractor in the Contract itself? Or, probably, the spec is to retrieve only contracts for the logged Profile filtering only for Client Contracts or only for Contractor Contracts? In the second case, how should the type of Contract be specified in the request?

### API#2
Notes:
- since now on I will add "@Controller", "@Service" and "@Repository" comment annotations in order to identify the different classes in a 3-tier architecture future improvement: briefly, Controller will manage the incoming request and the client part, Service will contain the specific business logic, Repository will contain the CRUD operations involving the specific DAOs and connections to the external data sources

Open points:
- is it correct to retrieve all the Contracts, being the logged Profile both Client or Contractor in the Contract itself? Or, probably, the spec is to retrieve only contracts for the logged Profile filtering only for Client Contracts or only for Contractor Contracts? In the second case, how should the type of Contract be specified in the request?

### API#1
Notes:
- trying to respect the 3 hours indicative deadline, the next steps will be implemented rapidly and without following best practices and simple improvements: these will be implemented later on in case we are still within the deadline (improvements may be file structure, Dependency Injection and separation of concerns, ...)

Open points:
- when a GET contract/:id request comes in but the logged profile is not in that profile, should I return 404-not found or 403-forbidden? This depends on the feature specs (ask the Product Owner)

