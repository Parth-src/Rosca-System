package com.project.roscasystem.auth;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponseDTO {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private Double accountBalance;
}
