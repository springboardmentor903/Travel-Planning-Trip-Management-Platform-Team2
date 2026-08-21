import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tripId;

    private BigDecimal totalAmount;

    private BigDecimal spentAmount;

    private BigDecimal remainingAmount;

    // getters and setters
}
