package com.project.roscasystem.bid;

import com.project.roscasystem.auction.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuction(Auction auction);
}
