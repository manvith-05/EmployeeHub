
package employee.config;

import employee.entity.User;
import employee.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            UserRepository userRepository) {

        return username -> {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() ->
                            new UsernameNotFoundException("User not found"));

            String role = user.getRole();

            if (role == null || role.isBlank()) {
                role = "USER";
            }

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getUsername())
                    .password(user.getPassword())
                    .roles(role)
                    .build();
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/login.html",
                    "/register.html",
                    "/style.css",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/api/auth/**",
                    "/error"
                ).permitAll()
                .requestMatchers(
                    "/api/employees/**",
                    "/api/departments/**",
                    "/api/salary/**",
                    "/api/salaries/**"
                ).hasRole("ADMIN")
                .requestMatchers(
                    "/dashboard.html",
                    "/employees.html",
                    "/departments.html",
                    "/salary.html"
                ).authenticated()
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
