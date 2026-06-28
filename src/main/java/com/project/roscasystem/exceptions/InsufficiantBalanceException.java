package com.project.roscasystem.exceptions;

public class InsufficiantBalanceException extends RuntimeException {
    public InsufficiantBalanceException(String message) {
        super(message);
    }
}
