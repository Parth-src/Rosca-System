package com.project.roscasystem.group;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.GroupStatus;
import com.project.roscasystem.common.enums.GroupFrequency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

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
    private GroupFrequency groupFrequency;

    private LocalDateTime nextAuctionTime;

    public void updateNextAuctionTime(){

        switch(groupFrequency){

            case DAILY:
                nextAuctionTime = nextAuctionTime.plusDays(1);
                break;


            case WEEKLY:
                nextAuctionTime = nextAuctionTime.plusWeeks(1);
                break;


            case MONTHLY:
                nextAuctionTime = nextAuctionTime.plusMonths(1);
                break;
        }

    }

    private Integer auctionDurationMinutes;

    private Long adminUserId;

}
