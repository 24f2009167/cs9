import mongoose from 'mongoose'
import { questionSchema } from './question.model.js'
import { faqConnection } from '../config/db.js'

const FAQQuestion = faqConnection
  ? faqConnection.model('FAQQuestion', questionSchema)
  : mongoose.model('FAQQuestion', questionSchema)

export default FAQQuestion
