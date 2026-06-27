package com.project.roscasystem.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;



    @PostMapping
    public UserResponseDTO createUser(

            @Valid
            @RequestBody
            CreateUserRequestDTO request

    ){

        return userService.createUser(request);

    }



    @GetMapping("/{id}")
    public UserResponseDTO getUser(

            @PathVariable Long id

    ){

        return userService.getUser(id);

    }




    @GetMapping
    public List<UserResponseDTO> getAllUsers(){

        return userService.getAllUsers();

    }




    @DeleteMapping("/{id}")
    public void deleteUser(

            @PathVariable Long id

    ){

        userService.deleteUser(id);

    }


}