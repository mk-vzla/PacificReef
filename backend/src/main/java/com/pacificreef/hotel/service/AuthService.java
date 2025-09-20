package com.pacificreef.hotel.service;

import com.pacificreef.hotel.dto.LoginRequest;
import com.pacificreef.hotel.dto.LoginResponse;
import com.pacificreef.hotel.dto.RegisterRequest;
import com.pacificreef.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for handling authentication operations
 */
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Authenticate user and return JWT token
     */
    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        try {
            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();

            // Primero intentar en base de datos (si existen usuarios persistidos)
            // NOTA: Como no hay hashing implementado, se asume password plano solo para demo.
            var optionalUser = userRepository.findByUsername(email)
                .or(() -> userRepository.findByEmail(email));

            if (optionalUser.isPresent()) {
                var user = optionalUser.get();
                if (password != null && password.equals(user.getPassword())) {
                    return new LoginResponse(
                        "db-token-" + System.currentTimeMillis(),
                        user.getId(),
                        user.getUsername(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getRole().name()
                    );
                }
            }

            // Fallback a credenciales hardcodeadas (modo demo) si no se encontró usuario
            if ("admin".equals(email) && "admin123".equals(password)) {
                return new LoginResponse(
                    "mock-admin-token-" + System.currentTimeMillis(),
                    1L,
                    "admin",
                    "Admin",
                    "User",
                    "ADMIN"
                );
            }
            if ("client".equals(email) && "client123".equals(password)) {
                return new LoginResponse(
                    "mock-client-token-" + System.currentTimeMillis(),
                    2L,
                    "client",
                    "Client",
                    "User",
                    "CLIENT"
                );
            }
            return new LoginResponse(false, "Invalid credentials");
        } catch (Exception e) {
            return new LoginResponse(false, "Authentication failed: " + e.getMessage());
        }
    }
    
    /**
     * Register a new user
     */
    public void registerUser(RegisterRequest registerRequest) {
        // Mock implementation for now
        // In a real application, this would save to database
        System.out.println("Mock registration for: " + registerRequest.getEmail());
    }
    
    /**
     * Logout user and invalidate token
     */
    public void logout(String token) {
        // Mock implementation for token invalidation
        System.out.println("Mock logout for token: " + token);
    }
    
    /**
     * Refresh JWT token
     */
    public LoginResponse refreshToken(String refreshToken) {
        // Mock implementation for token refresh
        return new LoginResponse(
            "mock-refreshed-token-" + System.currentTimeMillis(),
            1L,
            "user",
            "User",
            "Name",
            "CLIENT"
        );
    }
}