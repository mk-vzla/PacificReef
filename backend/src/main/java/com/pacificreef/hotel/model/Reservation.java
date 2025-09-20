package com.pacificreef.hotel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Entity
@Table(name = "reservations")
public class Reservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User is required")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @NotNull(message = "Room is required")
    private Room room;
    
    @NotNull(message = "Check-in date is required")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;
    
    @NotNull(message = "Check-out date is required")
    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;
    
    @Column(name = "guest_count", nullable = false)
    private Integer guestCount = 1;
    
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;
    
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;
    
    @Column(name = "confirmation_code", unique = true)
    private String confirmationCode;
    
    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;
    
    @Column(name = "checked_out_at")
    private LocalDateTime checkedOutAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    // Constructors
    public Reservation() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Reservation(User user, Room room, LocalDate checkInDate, LocalDate checkOutDate) {
        this();
        this.user = user;
        this.room = room;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.totalAmount = calculateTotalAmount();
    }
    
    // Lifecycle callbacks
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    public void prePersist() {
        if (this.confirmationCode == null) {
            this.confirmationCode = generateConfirmationCode();
        }
        if (this.totalAmount == null) {
            this.totalAmount = calculateTotalAmount();
        }
    }
    
    // Business methods
    public BigDecimal calculateTotalAmount() {
        if (room == null || checkInDate == null || checkOutDate == null) {
            return BigDecimal.ZERO;
        }
        
        long nights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        if (nights <= 0) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        
        return room.getPrice().multiply(BigDecimal.valueOf(nights));
    }
    
    public long getNumberOfNights() {
        if (checkInDate == null || checkOutDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(checkInDate, checkOutDate);
    }
    
    public boolean isActive() {
        return status == ReservationStatus.CONFIRMED || status == ReservationStatus.CHECKED_IN;
    }
    
    public boolean canCheckIn() {
        return status == ReservationStatus.CONFIRMED && 
               LocalDate.now().equals(checkInDate) &&
               checkedInAt == null;
    }
    
    public boolean canCheckOut() {
        return status == ReservationStatus.CHECKED_IN && checkedOutAt == null;
    }
    
    public boolean canCancel() {
        return status == ReservationStatus.PENDING || 
               status == ReservationStatus.CONFIRMED;
    }
    
    public void confirm() {
        if (status != ReservationStatus.PENDING) {
            throw new IllegalStateException("Only pending reservations can be confirmed");
        }
        this.status = ReservationStatus.CONFIRMED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void checkIn() {
        if (!canCheckIn()) {
            throw new IllegalStateException("Reservation cannot be checked in");
        }
        this.status = ReservationStatus.CHECKED_IN;
        this.checkedInAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Update room status
        if (room != null) {
            room.markAsOccupied();
        }
    }
    
    public void checkOut() {
        if (!canCheckOut()) {
            throw new IllegalStateException("Reservation cannot be checked out");
        }
        this.status = ReservationStatus.COMPLETED;
        this.checkedOutAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        
        // Update room status
        if (room != null) {
            room.markAsAvailable();
        }
    }
    
    public void cancel(String reason) {
        if (!canCancel()) {
            throw new IllegalStateException("Reservation cannot be cancelled");
        }
        this.status = ReservationStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.cancellationReason = reason;
        this.updatedAt = LocalDateTime.now();
    }
    
    private String generateConfirmationCode() {
        return "PR" + System.currentTimeMillis() + 
               String.format("%03d", (int) (Math.random() * 1000));
    }
    
    public String getGuestName() {
        return user != null ? user.getFullName() : "Unknown Guest";
    }
    
    public String getRoomNumber() {
        return room != null ? room.getNumber() : "Unknown Room";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Room getRoom() {
        return room;
    }
    
    public void setRoom(Room room) {
        this.room = room;
    }
    
    public LocalDate getCheckInDate() {
        return checkInDate;
    }
    
    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }
    
    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }
    
    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }
    
    public Integer getGuestCount() {
        return guestCount;
    }
    
    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public ReservationStatus getStatus() {
        return status;
    }
    
    public void setStatus(ReservationStatus status) {
        this.status = status;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public String getConfirmationCode() {
        return confirmationCode;
    }
    
    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }
    
    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }
    
    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }
    
    public LocalDateTime getCheckedOutAt() {
        return checkedOutAt;
    }
    
    public void setCheckedOutAt(LocalDateTime checkedOutAt) {
        this.checkedOutAt = checkedOutAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }
    
    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }
    
    public String getCancellationReason() {
        return cancellationReason;
    }
    
    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Reservation that = (Reservation) o;
        return Objects.equals(id, that.id) && 
               Objects.equals(confirmationCode, that.confirmationCode);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, confirmationCode);
    }
    
    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", confirmationCode='" + confirmationCode + '\'' +
                ", checkInDate=" + checkInDate +
                ", checkOutDate=" + checkOutDate +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                '}';
    }
    
    // Enums
    public enum ReservationStatus {
        PENDING("Pending Confirmation"),
        CONFIRMED("Confirmed"),
        CHECKED_IN("Checked In"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        NO_SHOW("No Show");
        
        private final String displayName;
        
        ReservationStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}