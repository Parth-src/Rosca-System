package com.project.roscasystem.transaction;

import com.project.roscasystem.membership.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByMembership(Membership membership);
}
