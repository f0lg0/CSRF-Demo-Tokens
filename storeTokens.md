# How to store JSON Web Tokens

There are mainly 3 options while deciding where to store JWTs: LocalStorage, Cookies and Memory.

## LocalStorage

Most people tend to store their JWTs in the local storage of the web browser. This tactic leaves your applications open to an attack called XSS. 

In this kind of attack, an attacker takes advantage of the fact that  local storage is accessible by any Javascript code running on the same  domain that the web applications hosted. So, for example, if the  attacker can find a way to inject maliciously Javascript code inside  your application, your JWT token is immediately available to them.



### Pros

* It’s pure JavaScript and it’s convenient. Easy to use.
* Works with APIs that require you to put your access token in the header, like this: `Authorization Bearer ${access_token}`.

### Cons

* Vulnerable to XSS.

## Cookies

Putting the JWT in a cookie doesn’t completely remove the risk of token theft. Even with an HttpOnly cookie, sophisticated attackers can still  use XSS and CSRF to steal tokens or make requests on the user’s behalf.

**By setting the token in a cookie the browser will automatically send requests with cookies attached to it**. 

This is vulnerable to CSRF attacks, the solution is usually Bearer authentication:

```
Bearer authentication is one of the authentication schemes defined in HTTP. It basically means that YOU stick the (JWT) token in the Authorization HTTP header of a request. The browser will NOT do this for you automatically, so it's not suitable for protecting your website. As the browser does not automatically add the header to your request, it is not vulnerable to a CSRF attack, which depends on your authentication info being submitted automatically to the original domain.
```

### Pros

* The cookie is not accessible via JavaScript; hence, it is not as vulnerable to XSS attacks as `localStorage`.
* Depending on the use case, you might not be able to store your tokens in the cookies.
  * Cookies have a size limit of 4KB. Therefore, if you're using a big JWT Token, storing in the cookie is not an option.
  * There are scenarios where you can't share cookies with your API server or the API requires you to put the access token in the Authorization header.  In this case, you won't be able to use cookies to store your tokens.
* Vulnerable to CSRF attacks.

### CSRF Attacks

A CSRF attack is performed when an attacker takes advantage of the  browser’s default behavior, to send all cookies even on cross-domain  requests. This can lead to great security vulnerabilities if not handled correctly. An example of this attack is the following:

- The attacker sends an email with a beautiful offer, and adds a CTA button at the end, “GET A 50% DISCOUNT”.
- The user is thrilled by this awesome offer and clicks the button.
- In reality, the button submits a POST form to your web application, and  more specifically to the endpoint that changes the user’s password with a new one.
- Because cookies are sent in every request, even  cross-domain ones, the endpoint works as expected if the user has logged in, in an earlier step to your web application.
- Now the user is logged out and cannot log in to your web application anymore.



### HttpOnly Cookies

HttpOnly is a flag the website can specify about a cookie. In other words, the webserver tells your browser *“Hey, here is a cookie, and you should treat is as HttpOnly”*.

**An HttpOnly Cookie is not accessible by JavaScript.** Only the  browser knows about it, and it doesn’t give it to the JavaScript code in the page.

It is a recognized best practice to share any authentication data only  with HttpOnly cookies. Using a standard cookie for authentication is a  known vulnerability we should avoid in any case.

## Memory

This solution isn’t always very practical. That’s because storing a JWT in Javascript memory will cause it to be lost any time the page is refreshed or closed  and then opened again. This leads to a poor user experience––you don’t  want your users to need to log back in every time they refresh the page. But there's a way to get persistence.

### Pros

* No XSS
* No CSRF

### Cons

* The token is gone if the page gets refreshed


### How to gain persistence


We store the access token in a variable in memory and we store the refresh token in a ``httpOnly`` Cookie.

If the user refreshes the page the access token is gone but the refresh one is still there. So, since cookies are attached to requests, on refresh we send the refresh token to an API endpoint that returns an access token.



### What happens when the access token expires?

We can see when an access token expires from the type of response we get or by knowing the expiration date. If we get a bad response from the server it means that the token has expired (the token is invalid) so the client refreshes the token before making other requests.


## Wrapping Up

Quote:

```
If you have any XSS vulnerabilities in your app, you will be susceptible  to token theft no matter where you store them. At the end of the day,  keeping your JWT in a cookie can carry the same dangers as storing them  in local storage. That means you really need to be sure that your app is free of XSS vulnerabilities in the first place.
```

```
That being said, many people prefer to use cookies for JWT storage as theft does arguably become somewhat more difficult. If you can, store your JWTs in your app state and refresh them either through a central auth server or using a refresh token in a cookie.
```



``The most secure solution is storing JWTs in memory.``



# Source

[React Authentication: How to Store JWT in a Cookie](https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81)

[How to Store JWT for Authentication](https://www.youtube.com/watch?v=iD49_NIQ-R4&t=439s)

[Where to store JWT in browser? How to protect against CSRF?](https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf)

[How to securely store JWT tokens.](https://gkoniaris.gr/security/how-to-securely-store-jwt-tokens/)

[LocalStorage vs. Cookies: All You Need to Know About Storing JWT Tokens Securely in the Front-End](https://blog.cotter.app/localstorage-vs-cookies-all-you-need-to-know-about-storing-jwt-tokens-securely-in-the-front-end/)

[What is a HttpOnly Cookie? A Simple Definition](https://www.ictshore.com/ict-basics/httponly-cookie/)
