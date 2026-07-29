package com.project.roscasystem.auction;

import com.project.roscasystem.common.enums.AuctionStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.membership.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByGroupOrderByCycleNumber(Group group);

    boolean existsByGroupAndWinner(Group group, Membership membership);

    boolean existsByGroupAndAuctionStatus(Group group, AuctionStatus auctionStatus);

    Optional<Auction> findByGroupAndAuctionStatus(Group group, AuctionStatus status);

    List<Auction> findByAuctionStatus(AuctionStatus status);

    Optional<Auction> findByWinner(Membership membership);

    Optional<Auction> findTopByGroupOrderByCycleNumberDesc(Group group);



}
