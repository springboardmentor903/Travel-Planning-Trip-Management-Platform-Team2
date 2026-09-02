package com.tripnest.tripnest_backend.security;

import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name  = oAuth2User.getAttribute("name");

        // Find existing user or create one automatically
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role travelerRole = roleRepository.findByName("TRAVELER")
                    .orElseThrow(() -> new RuntimeException("TRAVELER role not found"));

            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            // OAuth2 users have no password — set a placeholder that can never match
            newUser.setPasswordHash("OAUTH2_NO_PASSWORD");
            newUser.setRole(travelerRole);
            newUser.setOauthGoogle(true);
            return userRepository.save(newUser);
        });

        // Generate JWT exactly like the normal login flow
        String token = jwtUtil.generateToken(user.getEmail());

        // Redirect to frontend with token as query param
        // Frontend reads it from URL, stores in localStorage, then redirects to /dashboard
        String redirectUrl = "http://localhost:3000/oauth2/callback?token=" + token
                + "&id=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(user.getName(), "UTF-8")
                + "&email=" + java.net.URLEncoder.encode(user.getEmail(), "UTF-8");

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
