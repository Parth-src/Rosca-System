package com.project.roscasystem.user;

import com.project.roscasystem.common.base.BaseEntity;
import com.project.roscasystem.common.enums.AccountStatus;
import com.project.roscasystem.common.enums.OAuthProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

        private String name;

        @Column(unique = true)
        private String email;

        @Enumerated(EnumType.STRING)
        private OAuthProvider oAuthProvider;

        private double currentTrustScore;

        private double exposureLimit;

        @Enumerated(EnumType.STRING)
        private AccountStatus accountStatus;


}
