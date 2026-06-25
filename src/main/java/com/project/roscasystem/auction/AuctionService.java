package com.project.roscasystem.auction;

import com.project.roscasystem.bid.Bid;
import com.project.roscasystem.bid.BidRepository;
import com.project.roscasystem.bid.BidResponseDTO;
import com.project.roscasystem.bid.PlaceBidRequestDTO;
import com.project.roscasystem.common.enums.AuctionStatus;
import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.group.GroupRepository;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class AuctionService {
    private final MembershipRepository membershipRepository;
    private final GroupRepository groupRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;

    public AuctionResponseDTO createAuction(Long groupId){
        Group group=  groupRepository.findById(groupId).orElseThrow(()->new IllegalArgumentException("No such group exists"));

        if(auctionRepository.existsByGroupAndAuctionStatus(group, AuctionStatus.OPEN )){
            throw new RuntimeException("Auction already exists");
        }

        if(group.getCurrentCycle()>group.getNumberOfCycles()){
            throw new RuntimeException("Current cycle exceeds maximum number of auctions");
        }

        Auction auction= new Auction();
        auction.setAuctionStatus(AuctionStatus.OPEN);
        auction.setGroup(group);
        auction.setCycleNumber(group.getCurrentCycle());
        auction.setWinningDiscountBid(0);
        auction.setStartTime(LocalDateTime.now());
        auction.setEndTime(LocalDateTime.now().plusMinutes(group.getAuctionDurationMinutes()));

        auction=auctionRepository.save(auction);

        return convertToDto(auction);
    }

    private AuctionResponseDTO convertToDto(Auction auction){

        return new AuctionResponseDTO(

                auction.getId(),

                auction.getGroup().getGroupName(),

                auction.getCycleNumber(),

                auction.getWinningDiscountBid(),

                auction.getWinner() == null
                        ? null
                        : auction.getWinner()
                        .getUser()
                        .getName(),

                auction.getAuctionStatus(),

                auction.getStartTime(),

                auction.getEndTime()

        );

    }

    public AuctionResponseDTO getCurrentAuction(Long groupId){
        Group group= groupRepository.findById(groupId).orElseThrow(()->new RuntimeException("No such group exists"));

        Auction auction= auctionRepository.findByGroupAndAuctionStatus(group, AuctionStatus.OPEN).orElseThrow(()->new RuntimeException("No such auction exists"));

        return convertToDto(auction);
    }

    private Bid determineWinner(Auction auction){
        List<Bid> bids= bidRepository.findByAuction(auction);
        if(bids.isEmpty()){
            throw new RuntimeException("No bids placed");
        }

        Bid winner= bids.stream()
                .min(
                        Comparator
                                .comparing(Bid::getBidAmount)
                                .thenComparing(Bid::getCreatedAt)
                ).orElseThrow(()->new RuntimeException("No valid bids"));

        return winner;
    }

    @Transactional
    public AuctionResponseDTO closeAuction(Long auctionId){
        Auction auction= auctionRepository.findById(auctionId).orElseThrow(()->new RuntimeException("No such auction"));

        if(auction.getAuctionStatus()!=AuctionStatus.OPEN){
            throw new RuntimeException("Auction is not open");
        }

        Bid winningBid= determineWinner(auction);
        auction.setWinner(winningBid.getBidderMembership());
        auction.setWinningDiscountBid(winningBid.getBidAmount());
        auction.setAuctionStatus(AuctionStatus.CLOSED);

        Group group= auction.getGroup();

        group.setCurrentCycle(group.getCurrentCycle()+1);
        group.updateNextAuctionTime();

        groupRepository.save(group);
        auctionRepository.save(auction);

        return convertToDto(auction);
    }

    @Transactional
    public BidResponseDTO placeBid(PlaceBidRequestDTO request){
        Auction auction= auctionRepository.findById(request.getAuctionId()).orElseThrow(()->new RuntimeException("No such auction"));

        if(auction.getAuctionStatus()!=AuctionStatus.OPEN){
            throw new RuntimeException("Auction is not open");
        }

        Membership membership= membershipRepository.findById(request.getMembershipId()).orElseThrow(()->new RuntimeException("No such member"));

        if(membership.getMembershipStatus()!= MembershipStatus.ACTIVE){
            throw new RuntimeException("Membership is not Active");
        }

        if(!membership.getGroup().equals(auction.getGroup())){
            throw new RuntimeException("Member does not belong to this group");
        }

        if(auctionRepository.existsByGroupAndWinner(auction.getGroup(), membership)){
            throw new RuntimeException("Member already won");
        }

        if(bidRepository.existsByAuctionAndBidderMembership(auction, membership)){
            throw new RuntimeException("Already placed bid");
        }

        if(request.getBidAmount()<=0){
            throw new RuntimeException("Invalid Bid");
        }

        double poolAmount= auction.getGroup().getGroupSize() * auction.getGroup().getMonthlyDepositAmount();

        if(request.getBidAmount()>poolAmount){
            throw new RuntimeException("Bid is greater then pool amount");
        }

        Bid bid= new Bid();
        bid.setAuction(auction);
        bid.setBidderMembership(membership);
        bid.setBidAmount(request.getBidAmount());
        bid=bidRepository.save(bid);


        return convertToDto(bid);

    }

    private BidResponseDTO convertToDto(Bid bid){
        return new BidResponseDTO(

                bid.getId(),

                bid.getBidderMembership()
                        .getUser()
                        .getName(),

                bid.getBidAmount(),

                bid.getAuction()
                        .getId()

        );

    }



}
