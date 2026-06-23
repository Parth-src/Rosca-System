package com.project.roscasystem.auction;

import com.project.roscasystem.common.enums.AccountStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionResponseDTO {

    private long auctionId;

    private int cycleNumber;

    private double highestBid;

    private String winnerName;

    private AccountStatus status;

}
