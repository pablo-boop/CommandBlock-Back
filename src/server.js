require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 7000;


const cors = require('cors');

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});