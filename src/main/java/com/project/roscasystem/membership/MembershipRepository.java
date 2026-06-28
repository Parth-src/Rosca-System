package com.project.roscasystem.membership;

import com.project.roscasystem.group.Group;
import com.project.roscasystem.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, Long> {

                List<Membership> findByUser(User user);

                List<Membership> findByGroup(Group group);

                List<Membership> findByUserAndGroup(User user, Group group);

                Boolean existsByUserAndGroup(User user, Group group);

                long countByGroup(Group group);


}
