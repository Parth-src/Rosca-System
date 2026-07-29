package com.project.roscasystem.risk;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRiskReportDTO {
    
    private Long membershipId; 
    private double trustScore;
    private double onTimeRate;
    private int defaults;
    private int auctionsWon;
    private double totalContributed;
    private double totalReceived;
    private String band;

}
