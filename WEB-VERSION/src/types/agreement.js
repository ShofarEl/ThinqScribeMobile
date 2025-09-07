/**
 * @typedef {Object} Installment
 * @property {number} amount - The amount of the installment
 * @property {Date} dueDate - The due date of the installment
 */

/**
 * @typedef {Object} ProjectDetails
 * @property {string} title - The title of the project
 * @property {string} description - The detailed description
 * @property {string} subject - The subject area
 * @property {Date} deadline - The project deadline
 */

/**
 * @typedef {Object} AgreementFormData
 * @property {ProjectDetails} projectDetails - The project details
 * @property {Installment[]} installments - The payment installments
 */

/**
 * @typedef {Object} Agreement
 * @property {string} _id - The agreement ID
 * @property {string} student - The student ID
 * @property {string} writer - The writer ID
 * @property {('pending'|'active'|'completed'|'disputed')} status - The agreement status
 * @property {number} progress - The work progress percentage
 * @property {number} totalAmount - The total amount
 * @property {number} paidAmount - The amount paid so far
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {ProjectDetails} projectDetails - The project details
 * @property {Installment[]} installments - The payment installments
 */

/**
 * @typedef {Object} AgreementNotification
 * @property {string} agreementId - The agreement ID
 * @property {string} orderId - The associated order ID
 * @property {string} title - The project title
 * @property {string} studentName - The student's name
 * @property {number} totalAmount - The total amount
 * @property {Date} createdAt - Creation timestamp
 */

export const AGREEMENT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DISPUTED: 'disputed'
};

export const INSTALLMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue'
};

export const ProjectDetails = {
  title: String,
  description: String,
  subjectArea: String,
  deadline: Date,
  requirements: [String],
  attachments: [String]
};

export const Installment = {
  amount: Number,
  dueDate: Date,
  status: String,
  paymentId: String
};

export const Agreement = {
  _id: String,
  student: {
    _id: String,
    name: String,
    email: String
  },
  writer: {
    _id: String,
    name: String,
    email: String
  },
  projectDetails: ProjectDetails,
  installments: [Installment],
  status: String,
  createdAt: Date,
  updatedAt: Date,
  order: String
};

export const AgreementFormData = {
  projectDetails: {
    title: String,
    description: String,
    subjectArea: String,
    deadline: Date,
    requirements: [String]
  },
  installments: [{
    amount: Number,
    dueDate: Date
  }]
}; 