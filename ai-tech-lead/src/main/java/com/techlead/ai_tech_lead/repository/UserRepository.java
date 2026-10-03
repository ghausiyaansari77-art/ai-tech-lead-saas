package com.techlead.ai_tech_lead.repository;

import com.techlead.ai_tech_lead.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    // Unique user query method to manage credential authentication during login streams
    Optional<User> findByEmail(String email);
}
