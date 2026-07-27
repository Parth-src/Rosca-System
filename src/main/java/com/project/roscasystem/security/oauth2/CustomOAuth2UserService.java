package com.project.roscasystem.security.oauth2;

import com.project.roscasystem.common.enums.AccountStatus;
import com.project.roscasystem.common.enums.OAuthProvider;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .oAuthProvider(OAuthProvider.GOOGLE)
                    .accountStatus(AccountStatus.ACTIVE)
                    .currentTrustScore(100.0) // default trust score
                    .exposureLimit(0.0)
                    .accountBalance(0.0) // default wallet balance
                    .build();
            userRepository.save(newUser);
        }

        return oAuth2User; // We can return custom user details here if needed, but DefaultOAuth2User is fine for success handler
    }
}
