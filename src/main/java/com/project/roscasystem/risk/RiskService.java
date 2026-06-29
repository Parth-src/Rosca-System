package com.project.roscasystem.risk;

import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.exceptions.UserNotFoundException;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskService {

    private static final double MAX_TRUST=100.0;
    private static final double MIN_TRUST=0;
    private static final double PAYMENT_IMPROVEMENT = 0.015;
    private static final double DEFAULT_MULTIPLIER = 0.92;
    private static final double RECOVERY_IMPROVEMENT = 0.03;
    private static final double FRAUD_MULTIPLIER = 0.75;

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;


    @Transactional
    public void contributionSuccess(Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        double trust = user.getCurrentTrustScore();

        trust = trust + (MAX_TRUST - trust) * PAYMENT_IMPROVEMENT;

        trust = Math.min(MAX_TRUST, trust);

        user.setCurrentTrustScore(trust);

        userRepository.save(user);

        membershipRepository.findByUser(user)
                .forEach(this::checkMembershipEligibility);
    }

    @Transactional
    public void defaultOccurred(Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        double trust = user.getCurrentTrustScore();

        trust = trust * DEFAULT_MULTIPLIER;

        trust = Math.max(MIN_TRUST, trust);

        user.setCurrentTrustScore(trust);

        userRepository.save(user);

        membershipRepository.findByUser(user)
                .forEach(this::checkMembershipEligibility);
    }

    @Transactional
    public void recoveryCompleted(Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        double trust = user.getCurrentTrustScore();

        trust = trust + (MAX_TRUST - trust) * RECOVERY_IMPROVEMENT;

        trust = Math.min(MAX_TRUST, trust);

        user.setCurrentTrustScore(trust);

        userRepository.save(user);

        membershipRepository.findByUser(user)
                .forEach(this::checkMembershipEligibility);
    }

    @Transactional
    public void severeViolation(Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        double trust = user.getCurrentTrustScore();

        trust = trust * FRAUD_MULTIPLIER;

        trust = Math.max(MIN_TRUST, trust);

        user.setCurrentTrustScore(trust);

        userRepository.save(user);

        membershipRepository.findByUser(user)
                .forEach(this::checkMembershipEligibility);
    }


    @Transactional
    private void checkMembershipEligibility(Membership membership) {
        double trust= membership.getUser().getCurrentTrustScore();

        double threshold= membership.getGroup().getRiskThreshold();

        if(trust<threshold){
            membership.setMembershipStatus(MembershipStatus.SUSPENDED);
        }
        else{
            membership.setMembershipStatus(MembershipStatus.ACTIVE);
        }
        membershipRepository.save(membership);
    }

    public boolean canJoinGroup(User user, Group group) {
        return user.getCurrentTrustScore()>=group.getRiskThreshold();
    }

    public boolean canBid(Membership membership) {
        return membership.getMembershipStatus()==MembershipStatus.ACTIVE;
    }

    public RiskResponseDTO getRisk(Long membershipId){

        Membership membership =
                membershipRepository.findById(membershipId)
                        .orElseThrow();

        return new RiskResponseDTO(

                membership.getUser().getName(),

                membership.getUser().getCurrentTrustScore(),

                membership.getMembershipStatus()

        );
    }

}
