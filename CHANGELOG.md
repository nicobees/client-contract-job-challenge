This Changelog file contains useful info about the steps involved in the technical challenge, such as main architectural choices and approaches followed.

### API#1
Notes:
- trying to respect the 3 hours indicative deadline, the next steps will be implemented rapidly and without following best practices and simple improvements: these will be implemented later on in case we are still within the deadline (improvements may be file structure, Dependency Injection and separation of concerns, ...)

Open points:
- when a GET contract/:id request comes in but the logged profile is not in that profile, should I return 404-not found or 403-forbidden? This depends on the feature specs (ask the Product Owner)
