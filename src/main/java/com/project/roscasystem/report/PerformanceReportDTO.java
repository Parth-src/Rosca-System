package com.project.roscasystem.report;

import com.project.roscasystem.common.enums.MembershipStatus;




public record PerformanceReportDTO (
    String userName,

    String groupName,

    int cyclesCompleted,

    double totalInvested,

    double totalReceived,

    double dividendReceived,

    double winningAmount,

    double recoveryReceived,

    double penaltyPaid,

    double netProfit,

    double roi,

    Integer winningCycle,

    double currentTrustScore,

    MembershipStatus membershipStatus

)
{}
