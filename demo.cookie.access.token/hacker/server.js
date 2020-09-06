const express = require('express');
const app = express();

app.use(express.static('public'));

const cors = require('cors');
app.use(cors());

/* HANDLING 404 ERRORS */
app.use((req, res) => {
    res.status(404);
    res.json({
        err: '404 Not found'
    });
});

const host = "127.0.0.1";
const port = 1337;

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});