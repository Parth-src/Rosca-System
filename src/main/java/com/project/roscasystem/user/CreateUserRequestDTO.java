package com.project.roscasystem.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUserRequestDTO {

    @NotBlank
    private String name;

    @Email
    private String email;

}