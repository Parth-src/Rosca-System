package com.project.roscasystem.recovery;

import com.project.roscasystem.common.enums.RecoveryStatus;
import com.project.roscasystem.membership.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecoveryRepository extends JpaRepository<Recovery, Long> {

    List<Recovery> findByDefaulterAndRecoveryStatus(Membership membership, RecoveryStatus recoveryStatus);
    List<Recovery> findByRecoveryStatus(RecoveryStatus recoveryStatus);
}