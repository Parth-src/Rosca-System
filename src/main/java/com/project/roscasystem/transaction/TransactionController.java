package com.project.roscasystem.transaction;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/user/{userId}")
    public List<TransactionResponseDTO> getUserTransactions(@PathVariable Long userId){
            return  transactionService.getUserTransactions(userId);
    }


    @GetMapping("/group/{groupId}")
    public List<TransactionResponseDTO> getGroupTransactions(@PathVariable Long groupId){
          return transactionService.getAllGroupTransactions(groupId);
    }
}
