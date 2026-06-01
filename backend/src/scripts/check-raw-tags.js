import 'dotenv/config'
import connectDB from '../config/db.js'
import Question from '../models/question.model.js'
import Tag from '../models/tag.model.js'

await connectDB()

const rawTags = await Question.distinct('tags')
console.log('Total unique raw tags:', rawTags.length)
rawTags.forEach(t => console.log(JSON.stringify(t)))