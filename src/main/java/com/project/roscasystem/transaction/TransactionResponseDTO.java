package com.project.roscasystem.transaction;

import com.project.roscasystem.common.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponseDTO {

    private Long id;

    private String userName;

    private String groupName;

    private Double amount;

    private TransactionType transactionType;

    private Instant createdAt;

}
