package com.project.roscasystem.auth;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationRequestDTO {
    private String email;

    private String password;

}
