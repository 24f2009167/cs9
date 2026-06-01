import 'dotenv/config'
import connectDB from '../config/db.js'
import Question from '../models/question.model.js'
import Answer from '../models/answer.model.js'
import Flag from '../models/flag.model.js'
import User from '../models/user.model.js'
import SparkTransaction from '../models/spark-transaction.model.js'

await connectDB()

console.log('Counts:')
console.log('  Users:', await User.countDocuments())
console.log('  Questions total:', await Question.countDocuments())
console.log('  Questions kind=faq:', await Question.countDocuments({ kind: 'faq' }))
console.log('  Questions kind=community:', await Question.countDocuments({ kind: 'community' }))
console.log('  Answers:', await Answer.countDocuments())
console.log('  Flags pending:', await Flag.countDocuments({ status: 'pending' }))
console.log('  SparkTransactions:', await SparkTransaction.countDocuments())

const kindAgg = await Question.aggregate([{ $group: { _id: '$kind', count: { $sum: 1 } } }])
console.log('\nBy kind:', kindAgg)

const sparkAgg = await SparkTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }])
console.log('Spark total:', sparkAgg[0]?.total ?? 0)

process.exit(0)