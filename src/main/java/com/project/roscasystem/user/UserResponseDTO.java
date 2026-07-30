package com.project.roscasystem.user;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserResponseDTO {

    private long id;

    private String name;

    private String email;

    private double accountBalance;
    
    private double currentTrustScore;
}
