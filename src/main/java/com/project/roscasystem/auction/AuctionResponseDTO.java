package com.project.roscasystem.auction;

import com.project.roscasystem.common.enums.AccountStatus;
import com.project.roscasystem.common.enums.AuctionStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuctionResponseDTO {


    private Long auctionId;


    private String groupName;


    private int cycleNumber;


    private double winningDiscountBid;


    private String winnerName;


    private AuctionStatus auctionStatus;


    private LocalDateTime startTime;


    private LocalDateTime endTime;


}
