class BaseError extends Error {
    constructor (message) {
      super(message)
  
      // Set the prototype explicitly.
      Object.setPrototypeOf(this, new.target.prototype)
  
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
}

class NotFoundError extends BaseError {

}


class ClientCanNotPay extends BaseError {

}

class JobPayError extends BaseError {

}

class BalanceDepositOverMaxLimit extends BaseError {

}

module.exports = {
    BaseError,
    NotFoundError,
    ClientCanNotPay,
    JobPayError,
    BalanceDepositOverMaxLimit
}