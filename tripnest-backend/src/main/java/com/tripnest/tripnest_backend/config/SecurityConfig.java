package com.tripnest.tripnest_backend.config;

import java.io.IOException;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.tripnest.tripnest_backend.security.CustomAccessDeniedHandler;
import com.tripnest.tripnest_backend.security.CustomAuthenticationEntryPoint;
import com.tripnest.tripnest_backend.security.JwtAuthFilter;
import com.tripnest.tripnest_backend.security.OAuth2SuccessHandler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomAccessDeniedHandler accessDeniedHandler;
    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            // IF_REQUIRED: JWT API calls won't create sessions,
            // but OAuth2 redirect flow needs a short-lived session for the state param
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/destinations/**").permitAll()
                // OAuth2 redirect endpoints must be fully public
                .requestMatchers("/oauth2/**", "/login/**", "/login/oauth2/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )

            .exceptionHandling(ex -> ex
                .accessDeniedHandler(accessDeniedHandler)
                .authenticationEntryPoint(authenticationEntryPoint)
            )

            // Wire up Google OAuth2
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
                // On failure, redirect to frontend login page with error flag
                .failureHandler(new SimpleUrlAuthenticationFailureHandler() {
                    @Override
                    public void onAuthenticationFailure(HttpServletRequest request,
                                                        HttpServletResponse response,
                                                        AuthenticationException exception) throws IOException {
                        // Log so we can see the real cause in the console
                        System.err.println("[OAuth2 Failure] " + exception.getMessage());
                        response.sendRedirect("http://localhost:3000/login?error=oauth_failed");
                    }
                })
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
