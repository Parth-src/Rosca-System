package com.project.roscasystem.group;

import com.project.roscasystem.common.enums.GroupFrequency;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequestDTO {

    @NotBlank(message="Group name required")
    private String groupName;

    @Min(value = 2, message = "Group should have at least 2 members")
    private Integer groupSize;

    @Positive
    private Double contributionAmount;

    @Positive
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double riskThreshold;



    @Min(1)
    private Integer numberOfCycles;

    @NotNull
    private GroupFrequency groupFrequency;


}
