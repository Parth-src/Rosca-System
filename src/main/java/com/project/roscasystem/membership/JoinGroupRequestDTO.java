package com.project.roscasystem.membership;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JoinGroupRequestDTO {

    private Long userId;

    private Long groupId;

}
