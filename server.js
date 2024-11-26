require('dotenv').config(); 
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const usersFilePath = path.join(__dirname, "users.json");

// Middleware to parse incoming request body
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to read users from file
const readUsersFromFile = async () => {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
};

// Helper function to write user to the file
const writeUserToFile = async (user) => {
    const users = await readUsersFromFile();
    users.push(user);
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
};

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", "./views");

// Home route
app.get("/", (req, res) => {
    res.render("welcome", { title: "Welcome", message: "Welcome to Our Application!" });
});

// Signup form route
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Route to handle signup form submission
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const user = { username, password };
        await writeUserToFile(user); // Save user data to the file
        res.redirect(`/users/${username}`); // Redirect to user profile
    } else {
        res.status(400).send("Please provide a valid username and password.");
    }
});

// Route to display a specific user profile
app.get('/users/:username', async (req, res) => {
    const { username } = req.params;
    const users = await readUsersFromFile();
    const user = users.find(u => u.username === username);

    if (user) {
        res.render('users', {
            title: 'User Profile',
            username: user.username,
            password: user.password
        });
    } else {
        res.status(404).send("User not found.");
    }
});

// Route to display list of all users
app.get('/users', async (req, res) => {
    const users = await readUsersFromFile(); // Fetch all users
    res.render('users', {
        title: 'All Users',
        users: users // Pass the users array to the view
    });
});

// Set the port to run on
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
