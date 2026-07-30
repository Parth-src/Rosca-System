package com.project.roscasystem.risk;

import com.project.roscasystem.common.enums.MembershipStatus;



public record RiskResponseDTO(
        String userName,
        double trustScore,
        MembershipStatus membershipStatus
) {}
