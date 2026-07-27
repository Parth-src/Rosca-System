package com.project.roscasystem.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private double totalSavings;
    private int activeGroupsCount;
    private double upcomingContribution;
    private double riskScore;
}
