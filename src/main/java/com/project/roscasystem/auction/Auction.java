package com.project.roscasystem.auction;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.AuctionStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.membership.Membership;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="auctions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Auction extends BaseEntity {

    @ManyToOne
    @JoinColumn(name="group_id")
    private Group group;

    private int cycleNumber;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private double winningDiscountBid;

    @ManyToOne
    @JoinColumn(name="winner_membership_id")
    private Membership winner;

    @Enumerated(EnumType.STRING)
    private AuctionStatus auctionStatus;
}
