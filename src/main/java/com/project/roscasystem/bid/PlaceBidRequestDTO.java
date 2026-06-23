package com.project.roscasystem.bid;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceBidRequestDTO {

    private long auctionId;

    private long membershipId;

    private double amount;
}
