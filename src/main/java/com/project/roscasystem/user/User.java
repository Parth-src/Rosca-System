package com.project.roscasystem.user;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.AccountStatus;
import com.project.roscasystem.common.enums.OAuthProvider;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


@Entity
@Table(name="users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity implements UserDetails {

        private String name;

        @Column(unique = true)
        private String email;

        @Enumerated(EnumType.STRING)
        private OAuthProvider oAuthProvider;

        private double currentTrustScore;

        private double exposureLimit;

        @Enumerated(EnumType.STRING)
        private AccountStatus accountStatus;

        private double accountBalance;

        private String password;

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
                return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        }

        @Override
        public String getUsername() {
                return email;
        }

        @Override
        public boolean isAccountNonExpired() {
                return true;
        }

        @Override
        public boolean isAccountNonLocked() {
                return true;
        }

        @Override
        public boolean isCredentialsNonExpired() {
                return true;
        }

        @Override
        public boolean isEnabled() {
                return accountStatus == AccountStatus.ACTIVE;
        }


}
