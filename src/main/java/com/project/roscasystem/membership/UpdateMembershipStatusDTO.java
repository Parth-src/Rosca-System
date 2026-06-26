package com.project.roscasystem.membership;

import com.project.roscasystem.common.enums.MembershipStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMembershipStatusDTO {

    @NotNull(message = "Membership id is required")
    private Long membershipId;

    @NotNull(message = "Status is required")
    private MembershipStatus status;

}
