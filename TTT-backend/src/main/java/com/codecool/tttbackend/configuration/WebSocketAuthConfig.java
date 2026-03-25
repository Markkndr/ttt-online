package com.codecool.tttbackend.configuration;

import com.codecool.tttbackend.security.JwtUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    public WebSocketAuthConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor == null) {
                    return message;
                }

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    System.out.println("WS CONNECT auth header = " + authHeader);

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);

                        if (jwtUtil.validateToken(token, false)) {
                            String username = jwtUtil.getUsernameFromToken(token, false);
                            String rolesString = jwtUtil.getRolesFromToken(token);

                            List<SimpleGrantedAuthority> authorities =
                                    Arrays.stream(rolesString.split(","))
                                            .map(role -> role.replaceAll("[\\[\\]{}]", "").trim())
                                            .filter(role -> !role.isEmpty())
                                            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                                            .map(SimpleGrantedAuthority::new)
                                            .collect(Collectors.toList());

                            var authentication =
                                    new UsernamePasswordAuthenticationToken(username, null, authorities);

                            accessor.setUser(authentication);
                            System.out.println("WS user set = " + username);
                        }
                    }
                } else {
                    Principal user = accessor.getUser();
                    System.out.println("WS inbound command = " + accessor.getCommand() + ", user = " + user);

                    if (user instanceof UsernamePasswordAuthenticationToken authentication) {
                        SecurityContext context = SecurityContextHolder.createEmptyContext();
                        context.setAuthentication(authentication);
                        SecurityContextHolder.setContext(context);
                    }
                }

                return message;
            }
        });
    }
}