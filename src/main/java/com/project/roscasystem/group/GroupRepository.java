package com.project.roscasystem.group;

import com.project.roscasystem.common.enums.GroupStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    List<Group> findByGroupStatus(GroupStatus status);
}
