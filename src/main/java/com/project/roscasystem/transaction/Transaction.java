package com.project.roscasystem.transaction;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.TransactionType;
import com.project.roscasystem.membership.Membership;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "membership_id")
    private Membership membership;

    private double amount;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;


}
