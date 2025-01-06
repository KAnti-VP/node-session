import express from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

const isAuth = (req, res, next) => {
	if (req.session.isAuth) {
        next()
    } else {
        res.status(401).json({message: 'Not authenticated'})
    }
}

router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	if (!name && !email && !password) {
		return res.status(400).json({ message: "Missing data" });
	}
	try {
		let user = await User.findOne({where: { email }});
		if (user) {
			return res.status(400).json({ message: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPasword = await bcrypt.hash(password, salt);
		user = await User.create({
			name,
			email,
			password: hashedPasword,
		});
		res.status(201).json(user);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email && !password) {
		return res.status(400).json({ message: "Missing data" });
	}
	try {
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		if (!(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
        req.session.isAuth = true;
		const token = jwt.sign({ id: user.id }, "secret-key");
		res.cookie("jwt", token, {
			httpOnly: true,
			maxAge: 30000,
		});
		res.status(200).json({ message: "Login successful"});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) { console.log(`Error: ${err.message}`)}
    })
	res.cookie("jwt", "", { maxAge: 0 })
		.status(200)
		.json({ message: "Logout successful" });
});

router.get("/user", isAuth, async (req, res) => {
	try {
		const accessToken = req.cookies["jwt"];
		if (!accessToken) {
			return res.status(403).json({ message: "Not authenticated 1" });
		}
		const token = jwt.verify(accessToken, "secret-key");
		if (!token && !token.id && !token.maxAge) {
			return res.status(403).json({ message: "Not authenticated 2" });
		}
		const user = await User.findByPk(token.id);
		const { id, name, email } = user;
		res.status(200).json({ id, name, email });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;
