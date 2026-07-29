package com.project.roscasystem.scheduler;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.auction.AuctionRepository;
import com.project.roscasystem.auction.AuctionService;
import com.project.roscasystem.common.enums.AuctionStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.group.GroupRepository;
import com.project.roscasystem.notification.NotificationService;
import com.project.roscasystem.auction.AuctionResponseDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AuctionScheduler {

    private final AuctionService auctionService;
    private final AuctionRepository  auctionRepository;
    private final GroupRepository groupRepository;
    private final NotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(AuctionScheduler.class);

    @Scheduled(fixedRate = 60000)
    public void openAuctions(){

        List<Group> groups = groupRepository.findAll();

        LocalDateTime now = LocalDateTime.now();

        for(Group group : groups){

            if(group.getNextAuctionTime() != null &&
                    (group.getNextAuctionTime().isBefore(now) || group.getNextAuctionTime().isEqual(now)) &&
                    (!auctionRepository.existsByGroupAndAuctionStatus(group, AuctionStatus.OPEN))&&
                    (group.getCurrentCycle()<=group.getNumberOfCycles()) ){

                 try {
                     AuctionResponseDTO dto = auctionService.createAuction(group.getId());
                     notificationService.sendBidStartedAlert(group, dto.getAuctionId());
                 }
                 catch(Exception e){
                     log.error("Auction creation failed",e);

                 }
            }
        }
    }

    @Scheduled(fixedRate = 60000)
    public void closeAuctions(){
        List<Auction> auctions = auctionRepository.findByAuctionStatus(AuctionStatus.OPEN);

        LocalDateTime now = LocalDateTime.now();
        for(Auction auction : auctions){

            if(auction.getEndTime().isEqual(now) || auction.getEndTime().isBefore(now)){
                try{
                    auctionService.closeAuction(auction.getId());
                    notificationService.sendBidEndedAlert(auction.getGroup(), auction.getId());
                }
                catch(Exception e){
                    log.error("Auction close failed",e);
                }
            }
        }
    }

}
