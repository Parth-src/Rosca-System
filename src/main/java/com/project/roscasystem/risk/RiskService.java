package com.project.roscasystem.risk;

import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RiskService {

    private static final double DEFAULT_PENALTY=10.0;
    private static final double ON_TIME_REWARD=2.0;
    private static final double MAX_TRUST=100.0;
    private static final double MIN_TRUST=0;

    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;


    @Transactional
    public void rewardOnTimePayment(Membership membership) {
        User user= membership.getUser();

        double trust= Math.min(MAX_TRUST, user.getCurrentTrustScore()+ON_TIME_REWARD);

        user.setCurrentTrustScore(trust);
        userRepository.save(user);
    }

    @Transactional
    public void penalizeDefault(Membership membership) {
        User user= membership.getUser();
        double trust= Math.min(MIN_TRUST, user.getCurrentTrustScore()-DEFAULT_PENALTY);

        user.setCurrentTrustScore(trust);
        userRepository.save(user);
        checkMembershipEligibility(membership);
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
