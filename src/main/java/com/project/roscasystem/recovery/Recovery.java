package com.project.roscasystem.recovery;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.RecoveryStatus;
import com.project.roscasystem.membership.Membership;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "recoveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recovery extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "defaulter_membership_id")
    private Membership defaulter;

    @ManyToOne
    @JoinColumn(name = "beneficiary_membership_id")
    private Membership beneficiary;

    @ManyToOne
    @JoinColumn(name = "auction_id")
    private Auction auction;

    private double pendingContribution;

    private double penalty;

    @Enumerated(EnumType.STRING)
    private RecoveryStatus recoveryStatus;
}