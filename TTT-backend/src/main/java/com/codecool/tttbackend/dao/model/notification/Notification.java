package com.codecool.tttbackend.dao.model.notification;

import com.codecool.tttbackend.dao.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
   @Id
   @GeneratedValue
   private Integer id;

   // recipient should be a relationship to User, not a plain column
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "recipient_id", nullable = false)
   private User recipient;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "sender_id", nullable = false)
   private User sender;

   @Column(name = "type")
   private String type;

   @Column(columnDefinition = "jsonb")
   private String payload; // store JSON string of NotificationMessage or meta

   @Column(name = "is_read")
   private boolean read = false;

   @Column(name = "created_at")
   private Instant createdAt = Instant.now();

   public Notification() {
   }
}
