package com.project.roscasystem.bid;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceBidRequestDTO {

    @NotNull
    private long auctionId;

    @NotNull
    private long membershipId;

    @Positive
    private double bidAmount;
}
