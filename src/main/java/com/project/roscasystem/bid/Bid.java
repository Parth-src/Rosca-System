package com.project.roscasystem.bid;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.membership.Membership;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="bids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bid extends BaseEntity {

    @ManyToOne
    @JoinColumn(name="bidder_membership_id")
    private Membership bidderMembership;

    @ManyToOne
    @JoinColumn(name="auction_id")
    private Auction auction;

    private double bidAmount;

}
