package com.project.roscasystem.membership;

import com.project.roscasystem.common.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipResponseDTO {

    private Long membershipId;
    
    private Long groupId;

    private String username;

    private String groupName;

    private double currentTrustScore;

    private MembershipStatus status;
}
