const express = require('express');
const path = require('path');
const cors = require( 'cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.static(path.join(__dirname,'public')));

app.get('/levels', (req,res) => {
    res.sendFile(path.join(__dirname,'public', 'imageData.json'));
});

app.listen(port, () => {
    console.log(`Server is runing at http://localhost:${port}`);
});