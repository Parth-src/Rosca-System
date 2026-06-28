package com.project.roscasystem.user;

import com.project.roscasystem.exceptions.UserNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;


    private UserResponseDTO convertToDto(User user){

        return new UserResponseDTO(

                user.getId(),
                user.getName(),
                user.getEmail()

        );
    }


    @Transactional
    public UserResponseDTO createUser(CreateUserRequestDTO request){

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setAccountBalance(10000.0);

        user=userRepository.save(user);

        return convertToDto(user);

    }



    public UserResponseDTO getUser(Long id){

        User user = userRepository.findById(id)
                .orElseThrow(()->
                        new UserNotFoundException("User not found"));

        return convertToDto(user);

    }



    public List<UserResponseDTO> getAllUsers(){

        return userRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();

    }



    @Transactional
    public void deleteUser(Long id){

        User user = userRepository.findById(id)
                .orElseThrow(()->
                        new UserNotFoundException("User not found"));

        userRepository.delete(user);

    }


}
