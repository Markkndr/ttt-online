package com.codecool.tttbackend.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

   @Override
   public void registerStompEndpoints(StompEndpointRegistry registry) {
      // Frontend connects here.
      // SockJS makes local dev easier (fallbacks when native WS is blocked). (Huni)
      registry.addEndpoint("/ws")
          .setAllowedOriginPatterns("http://localhost:5173") // or "*", but this is safer
          .withSockJS();
   }

   @Override
   public void configureMessageBroker(MessageBrokerRegistry registry) {

      // Clients subscribe to /topic/... to receive broadcasts: (Huni)
      registry.enableSimpleBroker("/topic", "/queue", "/notification");

      // (Optional) If you later want clients to send messages over WS. (Huni)
      registry.setApplicationDestinationPrefixes("/app");
      registry.setUserDestinationPrefix("/user");
   }
}
