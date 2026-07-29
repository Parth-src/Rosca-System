package com.project.roscasystem.group;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StartGroupRequestDTO {

    @NotNull(message="Group ID required")
    private Long groupId;

    @NotNull(message="First auction time required")
    @FutureOrPresent(message="Auction time cannot be in the past")
    private LocalDateTime firstAuctionTime;

    private Boolean reduceSizeIfNeeded = false;

}
