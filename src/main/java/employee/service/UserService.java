
package employee.service;

import employee.entity.User;
import employee.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository repository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user) {
        user.setId(null);
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return repository.save(user);
    }
}
