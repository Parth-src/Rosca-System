package com.project.roscasystem.bid;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class BidResponseDTO {
    private Long bidId;

    private String bidderName;

    private double bidAmount;

    private Long auctionId;
}
