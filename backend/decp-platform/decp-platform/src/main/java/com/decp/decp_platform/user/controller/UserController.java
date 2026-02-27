package com.decp.decp_platform.user.controller;

import com.decp.decp_platform.user.dto.LoginRequest;
import com.decp.decp_platform.user.dto.RegisterRequest;
import com.decp.decp_platform.user.entity.User;
import com.decp.decp_platform.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String token = userService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(token);
    }
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("JWT Authentication Works!");
    }
}