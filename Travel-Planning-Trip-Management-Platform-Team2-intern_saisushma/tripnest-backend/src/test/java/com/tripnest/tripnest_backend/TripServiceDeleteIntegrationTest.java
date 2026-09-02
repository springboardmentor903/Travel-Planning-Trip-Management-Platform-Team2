package com.tripnest.tripnest_backend;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Role;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import com.tripnest.tripnest_backend.repository.RoleRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import com.tripnest.tripnest_backend.service.TripService;

@SpringBootTest
@Transactional
class TripServiceDeleteIntegrationTest {

    @Autowired
    private TripService tripService;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Test
    void deleteTrip_shouldRemoveRelatedRecords() {
        Role role = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName("USER");
                    return roleRepository.save(newRole);
                });

        User user = new User();
        user.setName("Test User");
        user.setEmail("trip.delete@test.com");
        user.setPasswordHash("hashed-password");
        user.setRole(role);
        userRepository.save(user);

        Trip trip = new Trip();
        trip.setTitle("Weekend in Goa");
        trip.setUser(user);
        trip.setStartDate(LocalDate.now());
        trip.setEndDate(LocalDate.now().plusDays(3));
        trip.setDescription("Sample trip");
        trip.setBudget(1000.0);
        trip.setStatus("PLANNED");
        trip = tripRepository.save(trip);

        Budget budget = new Budget();
        budget.setTrip(trip);
        budget.setTotalBudget(new BigDecimal("1500.00"));
        budget.setSpentAmount(new BigDecimal("200.00"));
        budget.setCurrency("INR");
        budgetRepository.save(budget);

        Itinerary itinerary = new Itinerary();
        itinerary.setTrip(trip);
        itinerary.setDayDate(LocalDate.now().plusDays(1));
        itinerary.setNotes("Beach day");
        itinerary = itineraryRepository.save(itinerary);

        Activity activity = new Activity();
        activity.setItinerary(itinerary);
        activity.setTitle("Museum visit");
        activity.setDescription("Explore old town");
        activity.setStartTime(LocalTime.of(9, 30));
        activity.setEndTime(LocalTime.of(11, 0));
        activity.setLocation("Panaji");
        activity.setType("SIGHTSEEING");
        activityRepository.save(activity);

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setPayer(user);
        expense.setCategory("FOOD");
        expense.setAmount(new BigDecimal("45.00"));
        expense.setExpenseDate(LocalDate.now());
        expense.setDescription("Lunch");
        expenseRepository.save(expense);

        tripService.delete(trip.getId(), user.getEmail());

        assertThat(tripRepository.findById(trip.getId())).isEmpty();
        assertThat(budgetRepository.findByTripId(trip.getId())).isEmpty();
        assertThat(itineraryRepository.findByTripIdOrderByDayDateAsc(trip.getId())).isEmpty();
        assertThat(expenseRepository.findByTripIdOrderByExpenseDateDesc(trip.getId())).isEmpty();
        assertThat(activityRepository.findByItineraryIdOrderByStartTimeAsc(itinerary.getId())).isEmpty();
    }
}
