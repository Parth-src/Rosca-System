package com.project.roscasystem.transaction;

import com.project.roscasystem.common.enums.TransactionType;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final MembershipRepository  membershipRepository;

    private TransactionResponseDTO convertToDto(Transaction transaction) {

        return new TransactionResponseDTO(
                transaction.getId(),
                transaction.getMembership().getUser().getName(),
                transaction.getMembership().getGroup().getGroupName(),
                transaction.getAmount(),
                transaction.getTransactionType(),
                transaction.getCreatedAt()
        );
    }

    private Membership getMembership(Long membershipId){

        return membershipRepository.findById(membershipId).orElseThrow(()->new RuntimeException("Membership not found"));
    }


    private Transaction createTransaction(Membership membership, double amount, TransactionType transactionType){
        if(amount<=0){
            throw new RuntimeException("Amount must be greater than 0");
        }

        Transaction transaction = new Transaction();
        transaction.setMembership(membership);
        transaction.setAmount(amount);
        transaction.setTransactionType(transactionType);

            return transactionRepository.save(transaction);
    }


    @Transactional
    public TransactionResponseDTO recordContribution(Long membershipId, Double amount) {
       Membership membership=getMembership(membershipId);

       Transaction transaction= createTransaction(membership,amount,TransactionType.CONTRIBUTION);

        return convertToDto(transaction);
    }

    @Transactional
    public TransactionResponseDTO recordPenalty(Long membershipId, Double amount) {
        Membership membership=getMembership(membershipId);

        Transaction transaction= createTransaction(membership,amount,TransactionType.PENALTY);

        return convertToDto(transaction);

    }

    @Transactional
    public TransactionResponseDTO recordAllocation(Long membershipId, Double amount) {
        Membership membership=getMembership(membershipId);

        Transaction transaction= createTransaction(membership,amount,TransactionType.ALLOCATION);

        return convertToDto(transaction);
    }

    @Transactional
    public TransactionResponseDTO recordDividend(Long membershipId, Double amount) {
        Membership membership=getMembership(membershipId);

        Transaction transaction= createTransaction(membership,amount,TransactionType.DIVIDEND);

        return convertToDto(transaction);
    }


    public List<TransactionResponseDTO> getUserTransactions(Long userId) {

                return transactionRepository.findByMembership_User_Id(userId)
                        .stream()
                        .map(this::convertToDto)
                        .toList();

    }

    public List<TransactionResponseDTO> getAllGroupTransactions(Long groupId) {
                return transactionRepository.findByMembership_Group_Id(groupId)
                        .stream()
                        .map(this::convertToDto)
                        .toList();
    }

}
