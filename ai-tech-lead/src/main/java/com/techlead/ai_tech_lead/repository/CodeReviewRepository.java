package com.techlead.ai_tech_lead.repository;

import com.techlead.ai_tech_lead.model.CodeReview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeReviewRepository extends MongoRepository<CodeReview, String> {
    // MongoRepository extend karne se hume saare basic CRUD methods (save, findById, delete) ready-made mil jayenge!
}
