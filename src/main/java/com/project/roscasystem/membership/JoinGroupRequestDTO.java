package com.project.roscasystem.membership;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JoinGroupRequestDTO {

    @NonNull
    private Long userId;

    @NotNull
    private Long groupId;

}
