package com.project.roscasystem.exceptions;

public class BidAlreadyPlacedException extends RuntimeException {
    public BidAlreadyPlacedException(String message) {
        super(message);
    }
}
