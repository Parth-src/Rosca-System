package com.project.roscasystem.group;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.GroupStatus;
import com.project.roscasystem.common.enums.GroupType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Group  extends BaseEntity {

    private String groupName;

    private int groupSize;

    private double riskThreshold;

    private int currentCycle;

    private int numberOfCycles;

    private double monthlyDepositAmount;

    @Enumerated(EnumType.STRING)
    private GroupStatus groupStatus;

    @Enumerated(EnumType.STRING)
    private GroupType groupType;
}
