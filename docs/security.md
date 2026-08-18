# 🛡️ Backend Security & User Management Deep Dive

Welcome to the backend security documentation! If you have **ZERO** knowledge about how backend security works, you are in the right place. 

We will learn exactly how this Java Spring Boot backend protects your data, verifies who is logging in, and how the `config` and `user/service` folders work together to make it happen.

---

## 🏎️ The Big Picture: How Security Works
Imagine an exclusive VIP Club:
1. **The Registration Desk (`UserService`)**: You give them your details and password. They encrypt your password so nobody can read it, and save you in the database.
2. **The ID Card Maker (`JwtUtil`)**: When you log in with the correct password, they hand you an unbreakable, cryptographic ID Card (a JSON Web Token, or **JWT**).
3. **The Bouncer (`JwtAuthenticationFilter`)**: Every time you try to enter a restricted room (make an API request), the Bouncer stops you, checks your ID Card (JWT), and lets you in if it's valid.
4. **The Club Manager (`SecurityConfig`)**: The person who writes the rules for the Bouncer (e.g., "The lobby is free for everyone, but the VIP rooms require an ID Card").
5. **The Database Looker (`CustomUserDetailsService`)**: Sometimes the Bouncer needs to check the master guest list to ensure the ID Card matches a real person. This service does exactly that.

Let's look at the code line-by-line!

---

## 📂 1. The `config` Folder
This folder contains all the rules and tools for our security bouncers.

### `SecurityConfig.java`
This file is the "Club Manager". It tells Spring Security exactly what rules to enforce globally.

```java
14: @Configuration
15: public class SecurityConfig {
```
* **Line 14**: `@Configuration` tells Spring Boot: *"Hey, read this file when you start up, it has important settings inside!"*

```java
23:     @Bean
24:     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
```
* **Line 24**: A `SecurityFilterChain` is literally the chain of rules that every single HTTP request must pass through.

```java
30:                 .cors(Customizer.withDefaults())
31:                 .csrf(csrf -> csrf.disable())
```
* **Line 30**: `cors` allows our React Frontend (running on a different port) to talk to this Java Backend.
* **Line 31**: `csrf` (Cross-Site Request Forgery) protection is disabled because we are using JWT tokens instead of browser cookies.

```java
32:                 .authorizeHttpRequests(auth -> auth
33:                         .requestMatchers("/api/users/register", "/api/users/login").permitAll()
34:                         .anyRequest().authenticated()
35:                 )
```
* **Line 33**: `permitAll()` means these paths are wide open. Anyone can try to register or log in (the "Lobby").
* **Line 34**: `anyRequest().authenticated()` specifies that **EVERY OTHER URL** in the entire app requires a valid ID Card (the "VIP Rooms").

```java
36:                 .sessionManagement(session ->
37:                         session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
38:                 )
```
* **Line 37**: `STATELESS` means the backend has amnesia. It doesn't remember who you are between requests. You **MUST** show your JWT ID card on *every single request*.

```java
44:     @Bean
45:     public PasswordEncoder passwordEncoder() {
46:         return new BCryptPasswordEncoder();
47:     }
```
* **Line 46**: This tells the system how to scramble passwords. **BCrypt** is an incredibly strong hashing algorithm. If a user's password is `123456`, BCrypt turns it into a random string like `$2a$10$BLRsPrkV...` before saving it to the database.

---

### `JwtUtil.java`
This is the "ID Card Maker". It generates and verifies JWTs (JSON Web Tokens).

```java
13:     private static final String SECRET = "mysecretkeymysecretkeymysecretkey123";
14:     private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hour
```
* **Line 13**: The `SECRET` is the highly confidential stamp the server uses to sign the tokens. If a hacker tries to forge a token, they can't sign it correctly without this exact secret.
* **Line 14**: The token is only valid for 1 hour. After that, the user must log in again.

```java
18:     public static String generateToken(String email) {
19:         return Jwts.builder()
20:                 .setSubject(email)
21:                 .setIssuedAt(new Date())
22:                 .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
23:                 .signWith(key, SignatureAlgorithm.HS256)
24:                 .compact();
25:     }
```
* **Lines 18-25**: This function creates the ID card. It writes the user's `email` on it (`setSubject`), writes the exact time it was created (`setIssuedAt`), writes the expiration date 1 hour from now (`setExpiration`), and then mathematically seals it using the `SECRET` (`signWith`).

---

### `JwtAuthenticationFilter.java`
This is "The Bouncer". This file intercepts *every single request* that comes into the API.

```java
26:     protected void doFilterInternal(HttpServletRequest request,
27:                                     HttpServletResponse response,
28:                                     FilterChain filterChain)
```
* **Line 26**: `doFilterInternal` is the bouncer's checkpoint.

```java
31:         final String authHeader = request.getHeader("Authorization");
36:         if (authHeader != null && authHeader.startsWith("Bearer ")) {
37:             token = authHeader.substring(7);
38:             try {
39:                 email = JwtUtil.extractEmail(token);
```
* **Line 31 & 36**: First, the bouncer checks the headers of the incoming request. Is the user holding up an ID card? (Does it start with `Bearer `?)
* **Line 37-39**: If yes, the bouncer strips away the word "Bearer " to get the raw token, and uses `JwtUtil` to read the email address written on it.

```java
45:         if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
47:             UserDetails userDetails = userDetailsService.loadUserByUsername(email);
49:             if (JwtUtil.validateToken(token, userDetails.getUsername())) {
62:                 SecurityContextHolder.getContext().setAuthentication(authToken);
```
* **Lines 45-62**: The bouncer says: *"Okay, the ID card says your email is X"*. It then uses `userDetailsService` to look in the database to see if User X actually exists.
* If the user exists and the token's digital signature is valid (`validateToken`), the bouncer officially records the user in the `SecurityContext` (letting them into the club).

---

## 👤 2. The `user/service` Folder
Why do we have two User Service files? 
* **`UserService`**: Is *your* custom business logic (Registering, Logging in, Updating Profiles).
* **`CustomUserDetailsService`**: Is a forced requirement by Spring Security. Spring doesn't know what database you are using, so it forces you to implement an Interface so it knows how to "find" a user.

### `CustomUserDetailsService.java`
The "Database Looker". Spring Security uses this solely to verify a user's existence during the Bouncer check.

```java
11: public class CustomUserDetailsService implements UserDetailsService {
```
* **Line 11**: `implements UserDetailsService` is a contract with Spring Security. Spring says: *"If you want me to do security, you MUST provide a class with this exact name and interface!"*

```java
20:     public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
22:         User user = userRepository.findByEmail(email)
23:                 .orElseThrow(() -> new UsernameNotFoundException("User not found"));
25:         return new CustomUserDetails(user);
26:     }
```
* **Line 22**: We use the `UserRepository` (which talks to MySQL) to find the user by their email.
* **Line 23**: If they don't exist in the database, we throw an error (The Bouncer kicks them out).
* **Line 25**: We wrap our Database `User` object into a `CustomUserDetails` object that Spring Security can understand.

---

### `CustomUserDetails.java`
The "Translator". Spring Security has very specific expectations. It doesn't know what our `User` object looks like. It only understands a specific interface called `UserDetails`. This class translates our custom `User` into Spring Security's language.

```java
12: public class CustomUserDetails implements UserDetails {
14:     private final User user;
```
* **Line 12**: We tell Spring, *"Treat this exact class like the VIP ID Profile you are expecting"*.
* **Line 14**: We store our actual, custom `User` object (pulled from the database) inside this wrapper.

```java
20:     @Override
21:     public Collection<? extends GrantedAuthority> getAuthorities() {
22:         return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
23:     }
```
* **Line 21**: The Bouncer needs to know what permissions this user holds.
* **Line 22**: We get the role from our database (e.g., `STUDENT` or `ADMIN`), slap `"ROLE_"` onto the front of it (Spring requires this prefix), and hand it directly to Spring Security.

```java
26:     public String getPassword() { return user.getPassword(); }
31:     public String getUsername() { return user.getEmail(); }
```
* **Lines 26 & 31**: Spring explicitly asks for a `Password` and a `Username`. We translate that by simply returning our `User`'s password and email.

```java
36:     public boolean isAccountNonExpired() { return true; }
41:     public boolean isAccountNonLocked() { return true; }
46:     public boolean isCredentialsNonExpired() { return true; }
51:     public boolean isEnabled() { return true; }
```
* **Lines 36-51**: Spring Security has advanced features allowing you to temporarily lock or disable accounts. Since we aren't using those advanced features yet, we hardcode them all to return `true` so nobody gets locked out accidentally!

---

### `UserService.java`
The custom "Registration Desk". This holds the logic for our actual User endpoints (like `/api/users/register`).

```java
27:     public User register(RegisterRequest request) {
29:         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
30:             throw new RuntimeException("Email already exists");
31:         }
```
* **Line 29**: Before creating a new account, we check the database to ensure this email isn't already used.

```java
33:         User user = new User();
34:         user.setName(request.getName());
35:         user.setEmail(request.getEmail());
36:         user.setPassword(passwordEncoder.encode(request.getPassword()));
37:         user.setRole(Role.STUDENT);
39:         return userRepository.save(user);
```
* **Lines 33-35**: We create a new empty User and start filling it with the data the frontend sent us.
* **Line 36**: **CRITICAL!** We do NOT save `123456` to the database. We use the `passwordEncoder` (BCrypt) to scramble the password forever.
* **Line 37**: We hardcode the role to `STUDENT`. (This means everyone who registers gets the lowest access level by default safely).
* **Line 39**: We save the new, secure user into the MySQL database.

```java
42:     public String login(String email, String password) {
44:         User user = userRepository.findByEmail(email)
45:                 .orElseThrow(() -> new RuntimeException("User not found"));
47:         if (!passwordEncoder.matches(password, user.getPassword())) {
48:             throw new RuntimeException("Invalid password");
49:         }
51:         return JwtUtil.generateToken(user.getEmail());
52:     }
```
* **Line 44**: Find the user by their email.
* **Line 47**: `passwordEncoder.matches(...)` takes the plain-text password from the login screen (e.g. `123456`), mathematically scrambles it, and checks if the output matches the scrambled text stored in the database. 
* **Line 51**: If the password is correct, we call `JwtUtil` (The ID Card Maker) to generate a brand new JWT String to hand back to the frontend.

```java
107:     public String changeUserRole(Long userId, Role newRole) {
109:         String email = SecurityContextHolder.getContext().getAuthentication().getName();
113:         User currentUser = userRepository.findByEmail(email).orElseThrow();
116:         if (currentUser.getRole() != Role.ADMIN) {
117:             throw new RuntimeException("Only admins can change roles");
118:         }
```
* **Line 109**: When someone tries to change a role, we ask the "Bouncer" (`SecurityContextHolder`) for the email of the person currently making the request.
* **Line 116**: We check if the person making the request is an `ADMIN`. If they are a `STUDENT` or `ALUMNI`, we throw an error and block them from modifying the database!

---
## Summary
1. Users send their plain text password to **UserService** to register.
2. The password is scrambled by **SecurityConfig (BCrypt)** and safely saved.
3. Upon Login, **JwtUtil** gives the user an unbreakable JWT token.
4. On every subsequent request, **JwtAuthenticationFilter** forces the user to prove they hold a valid JWT.
5. Behind the scenes, the filter uses **CustomUserDetailsService** to double-check that the user still actually exists in the database.
