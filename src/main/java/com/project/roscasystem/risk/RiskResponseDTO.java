package com.project.roscasystem.risk;

import com.project.roscasystem.common.enums.MembershipStatus;
import lombok.*;
import org.springframework.stereotype.Service;


public record RiskResponseDTO(
        String userName,
        double trustScore,
        MembershipStatus membershipStatus
) {}
