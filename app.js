const env = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require('./models/student')
const Course = require('./models/course')
const { title } = require("process");
const app = express();
const port = process.env.PORT || 8000;
const conn = process.env.DataBase;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./templates/views/"));
hbs.registerPartials(path.join(__dirname, "./templates/partials/"));

mongoose.set('strictQuery', false); // to not show warning

mongoose.connect(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Database Connected");
}).catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/studentlogin", (req, res) => {
    res.render("studentlogin");
});

app.get("/studentregister", (req, res) => {
    res.render("studentregister");
});

app.get("/aboutus", (req, res) => {
    res.render("aboutus");
});

app.get("/coursePage", (req, res) => {
    res.render("coursePage")
});

app.get("/stafflogin", (req, res) => {
    res.render("stafflogin");
});

// POST Request from login -> home
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const user = await Student.findOne({ email: email })
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ _id: user._id }, process.env.SecretKey);
            user.tokens = user.tokens.concat({ token: token });

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 60 * 60 * 60 * 1000),
                httpOnly: true
            })

            const loggedin = await user.save();
            const subs = await Course.findOne({ name: user.course })
            res.status(201).render("studentindex", {
                name: user.name,
                course: user.course,
                subs: subs.subjects
            });

        } else {
            res.status(201).render("studentlogin", {
                message: "Invalid Login Credentials",
                status: "danger"
            })
        }
    } catch (error) {
        res.status(400).render("studentlogin", {
            message: "No user found",
            status: "danger"
        })
    }
});

// POST Request from register -> login
app.post("/register", async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const course = req.body.course;
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;

        const hashpassword = await bcrypt.hash(password, 10);

        if (password === confirmpassword) {
            const registerStudent = new Student({
                name,
                email,
                phone,
                course,
                password: hashpassword,
                confirmpassword
            });

            const token = jwt.sign({ _id: registerStudent._id.toString() }, process.env.SecretKey);
            registerStudent.tokens = registerStudent.tokens.concat({ token: token });

            const registered = await registerStudent.save();
            res.status(201).render("studentlogin",{
                message: "Registered Successfully",
                status: "success"
            });
        } else {
            res.status(201).render("studentregister", {
                message: "Password and Confirm Password not matching",
                status: "danger"
            })
        }
    } catch (error) {
        res.status(201).render("studentregister", {
            message: "Email already exists",
            status: "danger"
        });
    }
});

app.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.render("studentlogin", {
        message: "Logout Successfully",
        status: "success"
    });
});


app.get("*", (req, res) => {
    res.render("404error");
});

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});