package com.project.roscasystem.group;

import com.project.roscasystem.common.enums.GroupFrequency;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDTO {

    private Long id;

    private String groupName;

    private Integer groupSize;

    private Double contributionAmount;

    private Double riskThreshold;

    private Integer currentCycle;

    private Integer numberOfCycles;

    private Integer auctionDurationMinutes;

    private GroupFrequency groupFrequency;

}
