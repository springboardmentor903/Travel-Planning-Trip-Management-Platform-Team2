import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget updatedBudget) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));
        budget.setTotalAmount(updatedBudget.getTotalAmount());
        budget.setSpentAmount(updatedBudget.getSpentAmount());
        budget.setRemainingAmount(updatedBudget.getRemainingAmount());
        return budgetRepository.save(budget);
    }

    public Optional<Budget> getBudgetByTripId(Long tripId) {
        return budgetRepository.findByTripId(tripId);
    }
}
