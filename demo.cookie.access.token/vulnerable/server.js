const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'))

app.get('/get_access_token', (req, res) => {
    res.cookie('accessToken', 'aToken', {
        httpOnly: true,
        path: '/transfer_money',
        sameSite: 'Lax'
    });

    res.json({
        message: 'Access Token Set'
    });
});

app.post('/transfer_money', (req, res) => {
    console.log("Headers: ", req.headers);
    console.log("Cookies: ", req.cookies);

    if (req.cookies.accessToken === 'aToken') {
        res.json({
            status: 'Done',
            message: 'You have successfully transferred money to X.'
        });
    } else {
        res.json({
            status: 'Error',
            message: 'Invalid Token. Transaction cancelled.'
        });
    }
});

/* HANDLING 404 ERRORS */
app.use((req, res) => {
    res.status(404);
    res.json({
        err: '404 Not found'
    });
});

const host = "127.0.0.1";
const port = 9090;

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
});