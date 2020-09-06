# CSRF Demos with Access and Refresh Tokens

I made this dead simple demos after studying basic security related to JWTs.

## DISCLAIMER

This is in no way secure, the tokens are simple strings and not JWTs. **No Login is required to get an access token**, the user simply visits an endpoint that returns one. THIS IS JUST A DEAD SIMPLE DEMO to demonstrate CSRF. 

In order to run the demos make sure to have ports 9090 and 1337 free at localhost.

# demo.cookie.access.token

In this demo I built a dummy bank application that stores an access token (needed to perform transactions) in a ``httpOnly`` cookie. This kind of Auth system is vulnerable to [CSRF](https://portswigger.net/web-security/csrf) (Cross-Site-Request-Forgery) which I am not going to explain myself, so if you don't know what that is please check the attached link.

## Breakdown

The Demo is structured like this:

* `application` -> A simple, vulnerable, bank web application that lets you transfer your money to user X.
* `hacker` -> The attacker's website that the victim will visit by falling for the hacker's scam

### Application

#### Install and Run

```npm install```

```npm run dev``` or ```npm run start```

#### Server.js

The server is configured with loose CORS policy, by allowing EVERY origin (`Access-Control-Allow-Origin` is `*`), otherwise we can't perform requests to some server's endpoints.

When the user makes a GET request to `/get_access_token` we return to him a really simple token with the value of `aToken` that lets him transfer money:

```
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
```

So when they make a POST request (with a form in the website) to `/transfer_money` immaginary cash is trasnferred to some user called X.

```
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
```

(this is the webpage where we transfer money ONLY if the user presses a button):

```
    <h1 class="center">Transfer Money to X</h1>
    <h3 class="center red">CLICK ONLY IF YOU REALLY WANT TO TRANSFER 100$ to X</h3>

    <div class="container">
        <form class="center-btn" action="http://127.0.0.1:9090/transfer_money" method="POST">
            <input type="submit" value="Send Money">
        </form>
    </div>
```

And if the token situated in the ``httpOnly`` cookie is valid (is "aToken") we transfer the money.

You can see where this is going, in fact it leads to a CSRF vulnerability.

### Hacker

#### Install and Run

```npm install```

```npm run dev``` or ```npm run start```

#### The website

The hacker hosts a simple website where he/she runs a simple scam: 'Get Free Money'. When a bank user visits this website the hacker performs a silent POST request to `/trasnfer_money` and tricks the user's browser into thinking that the POST comes from the user itself so the browser attaches the `accessToken` as a cookie to the request. This leads to a transaction even without the user knowing since it's silent and hidden.

```
    <form action="http://127.0.0.1:9090/transfer_money" method="POST">
        <input type="hidden">
    </form>

    <script>
        setTimeout(() => {
            document.forms[0].submit();
        }, 1500)
    </script>
```

As you can see the hacker hides the form that perfroms the HTTP request and submits it silently on page load with JavaScript (here I set a timeout just for demo purposes).

Basically the hacker lets the victim's browser do everything: it attaches the cookie to the request so the transaction is successfull.

## Conclusion

**In conclusion, we have a CSRF vulnerability.**

# demo.refresh.access.token

This demo was born after a discussion I had on Reddit about refresh tokens used to refresh access tokens. In this application we have the following auth system: users (technically after a login) get a refresh token that is used to get an access token. The refresh token is stored in a ``httpOnly`` cookie and the access token is stored in **memory**, so it's not easily accessible like in the case of a cookie or localstorage.

[Here's a better explaination](https://github.com/f0lg0/CSRF-Demo-Tokens/storeTokens.md), if you already know this method then skip to the [Breakdown](#Breakdwon) section.

With the access token they can perform actions that normal users can't, in this demo we return the access token in case of a valid refresh token and that's it; no actions such as modifying account details, transferring money etc. 

Original question that made me do this demo (this user wanted to know how refresh tokens aren't vulnerable to CSRF):

```
 Why can't an attacker set up their own website where they run malicious javascript that sends a GET request to the target server (not through a form), the browser then uses the victim's refresh_token cookie and the response from the target server gives the attacker access to a victim's JWT?
```

## Breakdown

The Demo is structured like this:

* `application` -> A simple web application that returns refresh and access tokens.
* `hacker` -> The attacker's website that the victim will visit by falling for the hacker's scam "Get a Free Iphone X"

### Application

#### Install and Run

```npm install```

```npm run dev``` or ```npm run start```

#### Server.js

The server is configured with loose CORS policy, by allowing EVERY origin (`Access-Control-Allow-Origin` is `*`), otherwise we can't perform requests to some server's endpoints.

Firstly, the user visits `/get_refresh_token`, gets a refresh token and then visits `/get_access_token` to get a new access token.

```
app.get('/get_refresh_token', (req, res) => {
    res.cookie('refreshToken', 'rToken', {
        httpOnly: true,
        path: '/get_access_token',
        sameSite: 'Lax'
    });

    res.json({
        message: 'Refresh Token Set'
    });
});
```

Here we set the refresh token (value = rToken) in a cookie.

```
app.get('/get_access_token', (req, res) => {
    console.log("Headers: ", req.headers);
    console.log("Cookies: ", req.cookies);

    if (req.cookies.refreshToken === 'rToken') {
        res.json({
            acessToken: 'aToken'
        });
    } else {
        res.json({
            error: 'Invalid Token'
        });
    }
});
```

When they want an access token we verify that the refresh token is valid.

And this is the webiste

```
    <a href="/get_refresh_token">Get Refresh Token</a><br>
    <a href="/get_access_token">Get Access Token</a><br><br>
    <a href="http://127.0.0.1:1337/hacker_page.html">Get a Free Iphone X</a>
```

With already the hacker's scam.

### Hacker

The hacker hosts a website with malicious JavaScript: the goal is to get an access token by tricking a user into visiting the hacker's site.

```
<body onload="hack()">
    <p style="text-align: center;">Haha stealing your access token.</p>

    <script>
        async function hack() {
            console.log("Hacking...");
            const response = await fetch('http://127.0.0.1:9090/get_access_token', {
                method: 'GET',
                credentials: "include"
            });
            console.log(await response.json());
        }
    </script>
</body>
```

As you can see the hacker tries to get his/her hands on the response from `/get_access_token` which, like we saw in demo 1, should return an access token since the user will alredy have a valid refresh token as a cookie (the hacker used the option `credentials: include` in order to attach cookies to the request made with `fetch()`). BUT in this case **the hacker can't actually get his hands on the reponse** (he can successfully make it though). The hacker will get the following error:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at ‘http://127.0.0.1:9090/get_access_token’. (Reason: Credential is not supported if the CORS header ‘Access-Control-Allow-Origin’ is ‘*’).
```

## Conclusion

In demo 1 the attacker performed a blind attack: he/she just submitted a POST request and the vulnerable application + victim's browser made the transaction by themselves. In this case the attacker wanted to get his hands on the response because that's where the access token is but CORS protected the victim.

If you actually see the logs in the terminal of the `application` you will see the request coming thru but the attacker stil can't manipulate the response data.

This is then a secure Auth System because the access token, since it's stored in memory (in a real application), won't be attached as a cookie to the request.
**Refresh tokens aren't vulnerable to CSRF like access tokens stored in a cookie are.**

## Note

Remember that there's always a way to break the system :D

## Tips

There's some useful information logged in the terminal (req headers and cookies).