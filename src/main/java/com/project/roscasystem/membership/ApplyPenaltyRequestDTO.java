package com.project.roscasystem.membership;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApplyPenaltyRequestDTO {
    @NotNull(message = "Membership id is required")
    private Long membershipId;

    @Positive(message = "Penalty amount must be positive")
    private Double amount;
}
