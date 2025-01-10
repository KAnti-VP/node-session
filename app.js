import express from "express";
import cors from "cors";
import session from "express-session";
import sequelize from "./data/database.js";
import usersRoutes from "./routes/users.js";
import cookieParser from "cookie-parser";

import connectSessionSequelize from "connect-session-sequelize";
const SequelizeStore = connectSessionSequelize(session.Store);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(
	session({
		secret: "key that will sign cookie",
		resave: false,
		saveUninitialized: false,
		store: new SequelizeStore({
			db: sequelize,
		}),
	})
);

app.use("/api", usersRoutes);

app.get("/", (req, res) => {
	req.session.isAuth = true;
	console.log(req.session);
	console.log(req.session.id);
	res.send("Hello Session Tut");
});

sequelize
	.sync()
	.then((result) => {
		// console.log(result)
		app.listen(3000, () => {
			console.log(`Server runs on port ${PORT}`);
		});
	})
	.catch((err) => console.log(err));
