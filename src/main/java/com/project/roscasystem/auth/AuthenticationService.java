package com.project.roscasystem.auth;

import com.project.roscasystem.common.enums.AccountStatus;
import com.project.roscasystem.common.enums.OAuthProvider;
import com.project.roscasystem.security.jwt.JwtService;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponseDTO register(RegisterRequestDTO request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
        }

        User user= User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountStatus(AccountStatus.ACTIVE)
                .oAuthProvider(OAuthProvider.GOOGLE)
                .accountBalance(10000.0)
                .currentTrustScore(100.0)
                .exposureLimit(10000.0)
                .build();

        userRepository.save(user);

        String jwt= jwtService.generateToken(user);

        return AuthenticationResponseDTO.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .accountBalance(user.getAccountBalance())
                .build();
    }

    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();

        String jwt = jwtService.generateToken(user);

        return AuthenticationResponseDTO.builder()
                .token(jwt)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .accountBalance(user.getAccountBalance())
                .build();
    }

}
