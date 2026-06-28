package com.project.roscasystem.wallet;

import com.project.roscasystem.exceptions.InsufficiantBalanceException;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;

    public boolean hasSufficientBalance(User user, double amount) {
        return user.getAccountBalance() >= amount;
    }

    @Transactional
    public void debit(User user, double amount) {

        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        if (!hasSufficientBalance(user, amount)) {
            throw new InsufficiantBalanceException("Insufficient balance");
        }

        user.setAccountBalance(user.getAccountBalance() - amount);

        userRepository.save(user);
    }

    @Transactional
    public void credit(User user, double amount) {

        if (amount <= 0) {
            throw new RuntimeException("Amount must be greater than 0");
        }

        user.setAccountBalance(user.getAccountBalance() + amount);

        userRepository.save(user);
    }

    public double getBalance(User user) {
        return user.getAccountBalance();
    }

}