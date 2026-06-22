package com.project.roscasystem.membership;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="memberships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Membership extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    private Group group;

    private double trustScoreAtJoining;

    @Enumerated(EnumType.STRING)
    private MembershipStatus membershipStatus;

    private double penaltyAmount;

    private double totalEarned;

    private LocalDate joiningDate;




}
