package com.tripnest.tripnest_backend.config;

import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DestinationRepository destinationRepository;

    private static final List<String> DEFAULT_ROLES = List.of("TRAVELER", "GROUP_ADMIN", "ADMINISTRATOR");
    private static final String DEFAULT_ADMIN_EMAIL = "admin@tripnest.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "Admin@123";

    @Override
    public void run(String... args) {

        // ── Seed roles ──────────────────────────────────────────
        DEFAULT_ROLES.forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        });

        // ── Seed admin user (runs only once) ────────────────────
        if (!userRepository.existsByEmail(DEFAULT_ADMIN_EMAIL)) {
            Role adminRole = roleRepository.findByName("ADMINISTRATOR")
                    .orElseThrow(() -> new RuntimeException("ADMINISTRATOR role missing after seeding"));
            User admin = new User();
            admin.setName("Default Administrator");
            admin.setEmail(DEFAULT_ADMIN_EMAIL);
            admin.setPasswordHash(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
            admin.setRole(adminRole);
            admin.setOauthGoogle(false);
            userRepository.save(admin);
        }

        // ── Seed destinations (runs only when table is empty) ───
        if (destinationRepository.count() == 0) {
            List<Destination> destinations = List.of(
                new Destination(null, "Goa", "India", "Panaji",
                    "India's beach paradise famous for its golden sandy shores, vibrant nightlife, Portuguese heritage, water sports, and laid-back Konkani culture.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Baga_beach_Goa.jpg/1280px-Baga_beach_Goa.jpg"),

                new Destination(null, "Manali", "India", "Manali",
                    "A stunning Himalayan hill station known for snow-capped peaks, adventure sports, Rohtang Pass, Solang Valley, and the ancient Hadimba Temple.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Manali_-_panoramio.jpg/1280px-Manali_-_panoramio.jpg"),

                new Destination(null, "Jaipur", "India", "Jaipur",
                    "The Pink City of Rajasthan, home to the majestic Amber Fort, Hawa Mahal, City Palace, and vibrant bazaars overflowing with gems and textiles.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Hawa_Mahal_Jaipur.jpg/1024px-Hawa_Mahal_Jaipur.jpg"),

                new Destination(null, "Kerala Backwaters", "India", "Alleppey",
                    "A tranquil network of lagoons, lakes, and canals lined with coconut palms. Explore on traditional houseboats and experience authentic Kerala village life.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Kerala_backwaters.jpg/1280px-Kerala_backwaters.jpg"),

                new Destination(null, "Varanasi", "India", "Varanasi",
                    "One of the world's oldest cities, situated on the sacred Ganges River. Famous for its ghats, morning aarti ceremonies, temples, and spiritual significance.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Ghats_in_Varanasi_2013.jpg/1280px-Ghats_in_Varanasi_2013.jpg"),

                new Destination(null, "Agra", "India", "Agra",
                    "Home to the iconic Taj Mahal, one of the Seven Wonders of the World. Also features the magnificent Agra Fort and Fatehpur Sikri.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg"),

                new Destination(null, "Darjeeling", "India", "Darjeeling",
                    "A charming hill station in West Bengal famous for its tea gardens, the Toy Train UNESCO heritage railway, Tiger Hill sunrise views, and Himalayan panoramas.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Darjeeling_-_Tea_Garden.jpg/1280px-Darjeeling_-_Tea_Garden.jpg"),

                new Destination(null, "Udaipur", "India", "Udaipur",
                    "The City of Lakes in Rajasthan, known for its romantic lake palaces, City Palace complex, Pichola Lake boat rides, and rich Mewar royal heritage.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Lake_Palace_Udaipur.jpg/1280px-Lake_Palace_Udaipur.jpg"),

                new Destination(null, "Andaman Islands", "India", "Port Blair",
                    "A pristine archipelago in the Bay of Bengal with crystal-clear turquoise waters, coral reefs, Radhanagar Beach, and the historic Cellular Jail.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Radhanagar_Beach_Andaman.jpg/1280px-Radhanagar_Beach_Andaman.jpg"),

                new Destination(null, "Leh Ladakh", "India", "Leh",
                    "A remote high-altitude desert region with dramatic landscapes, ancient Buddhist monasteries, Pangong Lake, Nubra Valley, and thrilling mountain passes.",
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Pangong_tso.jpg/1280px-Pangong_tso.jpg")
            );
            destinationRepository.saveAll(destinations);
            System.out.println("[DataSeeder] Seeded " + destinations.size() + " destinations.");
        }
    }
}
