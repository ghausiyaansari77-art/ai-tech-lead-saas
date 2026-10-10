package com.techlead.ai_tech_lead.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.techlead.ai_tech_lead.model.User;
import com.techlead.ai_tech_lead.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Critical bridge linking isolated React authentication hooks
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 🚀 1. SIGN UP ENDPOINT: Registers a secure user record profile layout matrix
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        Map<String, String> response = new HashMap<>();
        
        // Data level lookup validation: Prevent duplicate account creations
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            response.put("error", "Security Guard Triggered: Email profile already registered inside system tables.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Save the dynamic entity blueprint directly into cloud collections cluster
        user.setPassword(passwordEncoder.encode(user.getPassword()));
       User savedUser = userRepository.save(user);

       Map<String, Object> safeUser = new HashMap<>();
       safeUser.put("id", savedUser.getId());
       safeUser.put("email", savedUser.getEmail());
       safeUser.put("fullName", savedUser.getFullName());

          return ResponseEntity.status(HttpStatus.CREATED).body(safeUser);
    }

    // 🚀 2. LOGIN ENDPOINT: Validates credential parameters tokens against active database layers
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginPayload) {
        Map<String, String> response = new HashMap<>();
        String email = loginPayload.get("email");
        String password = loginPayload.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        
       if (userOpt.isPresent()) {
    User user = userOpt.get();

    boolean passwordMatches;

    if (user.getPassword() != null &&
            user.getPassword().startsWith("$2a$")) {

        passwordMatches = passwordEncoder.matches(
                password,
                user.getPassword()
        );

    } else {
        // Legacy plaintext password migration
        passwordMatches = password.equals(user.getPassword());

        if (passwordMatches) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }
    }

    if (passwordMatches) {
        Map<String, Object> safeUser = new HashMap<>();

        safeUser.put("id", user.getId());
        safeUser.put("email", user.getEmail());
        safeUser.put("fullName", user.getFullName());

        return ResponseEntity.ok(safeUser);
    }
}

        response.put("error", "Authentication Mismatch: Credentials verification failed against active indices.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

}
    

