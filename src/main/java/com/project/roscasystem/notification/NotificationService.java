package com.project.roscasystem.notification;

import com.project.roscasystem.group.Group;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    public void sendUpcomingBidAlert(Group group) {
        log.info("Upcoming Bid Alert for Group: {}, next auction at {}", group.getGroupName(), group.getNextAuctionTime());
    }

    public void sendBidStartedAlert(Group group, Long auctionId) {
        log.info("Bid Started for Group: {}, Auction ID: {}", group.getGroupName(), auctionId);
    }

    public void sendBidEndedAlert(Group group, Long auctionId) {
        log.info("Bid Ended for Group: {}, Auction ID: {}", group.getGroupName(), auctionId);
    }
}
