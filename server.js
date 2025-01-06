import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import usersRoutes from './routes/usersrouts.js'
import session from 'express-session'
import connectSessionSequelize from 'connect-session-sequelize'
import sequelize from './data/database.js'

const SequelizeStore = connectSessionSequelize(session.Store)
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())
app.use(cookieParser())
app.use(session({
	secret: 'secret-key',
	resave: false,
	saveUninitialized: false,
	store: new SequelizeStore({
		db: sequelize
	})
}))
app.use('/api', usersRoutes)


try {
	result = await sequelize.sync()
	app.listen(PORT, () => { console.log(`Server runs om port ${PORT}`)})
} catch (err) {
	console.log(`Error: ${err.message}`)
}
