package com.project.roscasystem.auction;

import com.project.roscasystem.group.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    Optional<Auction> findByGroupAndCycleNumber(Group group, int cycle);
}
