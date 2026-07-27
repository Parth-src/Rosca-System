package com.project.roscasystem.scheduler;

import com.project.roscasystem.group.Group;
import com.project.roscasystem.group.GroupRepository;
import com.project.roscasystem.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final GroupRepository groupRepository;
    private final NotificationService notificationService;

    @Scheduled(fixedRate = 3600000) // hourly
    public void sendUpcomingAlerts() {
        List<Group> groups = groupRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        
        for (Group group : groups) {
            if (group.getNextAuctionTime() != null &&
                group.getNextAuctionTime().isAfter(now) &&
                group.getNextAuctionTime().isBefore(tomorrow)) {
                
                notificationService.sendUpcomingBidAlert(group);
            }
        }
    }
}
