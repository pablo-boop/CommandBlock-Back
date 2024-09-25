require('dotenv').config();
const express = require('express');

const userRoutes = require("./routes/user.routes")
const vacancyRoutes = require("./routes/vacancy.routes")
const companyRoutes = require("./routes/company.routes")
const candidacyRoutes = require("./routes/candidacy.routes")

const app = express();
const port = process.env.PORT || 7000;
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.use('/', userRoutes);
app.use('/', vacancyRoutes);
app.use('/', companyRoutes);
app.use('/', candidacyRoutes)

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});