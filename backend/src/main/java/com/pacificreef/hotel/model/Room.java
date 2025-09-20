package com.pacificreef.hotel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "rooms")
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Room number is required")
    @Size(max = 10, message = "Room number must not exceed 10 characters")
    @Column(name = "room_number", unique = true, nullable = false)
    private String number;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Room type is required")
    @Column(nullable = false)
    private RoomType type;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status = RoomStatus.AVAILABLE;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "max_occupancy")
    private Integer maxOccupancy;
    
    @Column(name = "bed_count")
    private Integer bedCount;
    
    @Size(max = 50, message = "Bed type must not exceed 50 characters")
    @Column(name = "bed_type")
    private String bedType;
    
    @Column(name = "has_balcony")
    private Boolean hasBalcony = false;
    
    @Column(name = "has_sea_view")
    private Boolean hasSeaView = false;
    
    @Column(name = "has_wifi")
    private Boolean hasWifi = true;
    
    @Column(name = "has_air_conditioning")
    private Boolean hasAirConditioning = true;
    
    @Column(name = "has_minibar")
    private Boolean hasMinibar = false;
    
    @Column(name = "has_safe")
    private Boolean hasSafe = false;
    
    @Column(name = "floor_number")
    private Integer floorNumber;
    
    @ElementCollection
    @CollectionTable(name = "room_amenities", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Reservation> reservations = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public Room() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Room(String number, RoomType type, BigDecimal price) {
        this();
        this.number = number;
        this.type = type;
        this.price = price;
        this.maxOccupancy = type.getDefaultMaxOccupancy();
        this.bedCount = type.getDefaultBedCount();
        this.bedType = type.getDefaultBedType();
    }
    
    // Lifecycle callbacks
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Business methods
    public boolean isAvailable() {
        return this.status == RoomStatus.AVAILABLE;
    }
    
    public boolean isOccupied() {
        return this.status == RoomStatus.OCCUPIED;
    }
    
    public boolean isUnderMaintenance() {
        return this.status == RoomStatus.MAINTENANCE;
    }
    
    public void markAsOccupied() {
        this.status = RoomStatus.OCCUPIED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsAvailable() {
        this.status = RoomStatus.AVAILABLE;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsUnderMaintenance() {
        this.status = RoomStatus.MAINTENANCE;
        this.updatedAt = LocalDateTime.now();
    }
    
    public String getDisplayName() {
        return type.getDisplayName() + " Room " + number;
    }
    
    public List<String> getFeatures() {
        List<String> features = new ArrayList<>();
        if (hasWifi) features.add("Free WiFi");
        if (hasAirConditioning) features.add("Air Conditioning");
        if (hasBalcony) features.add("Balcony");
        if (hasSeaView) features.add("Sea View");
        if (hasMinibar) features.add("Minibar");
        if (hasSafe) features.add("Safe");
        features.addAll(amenities);
        return features;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNumber() {
        return number;
    }
    
    public void setNumber(String number) {
        this.number = number;
    }
    
    public RoomType getType() {
        return type;
    }
    
    public void setType(RoomType type) {
        this.type = type;
        if (type != null) {
            if (this.maxOccupancy == null) this.maxOccupancy = type.getDefaultMaxOccupancy();
            if (this.bedCount == null) this.bedCount = type.getDefaultBedCount();
            if (this.bedType == null) this.bedType = type.getDefaultBedType();
        }
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public RoomStatus getStatus() {
        return status;
    }
    
    public void setStatus(RoomStatus status) {
        this.status = status;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getMaxOccupancy() {
        return maxOccupancy;
    }
    
    public void setMaxOccupancy(Integer maxOccupancy) {
        this.maxOccupancy = maxOccupancy;
    }
    
    public Integer getBedCount() {
        return bedCount;
    }
    
    public void setBedCount(Integer bedCount) {
        this.bedCount = bedCount;
    }
    
    public String getBedType() {
        return bedType;
    }
    
    public void setBedType(String bedType) {
        this.bedType = bedType;
    }
    
    public Boolean getHasBalcony() {
        return hasBalcony;
    }
    
    public void setHasBalcony(Boolean hasBalcony) {
        this.hasBalcony = hasBalcony;
    }
    
    public Boolean getHasSeaView() {
        return hasSeaView;
    }
    
    public void setHasSeaView(Boolean hasSeaView) {
        this.hasSeaView = hasSeaView;
    }
    
    public Boolean getHasWifi() {
        return hasWifi;
    }
    
    public void setHasWifi(Boolean hasWifi) {
        this.hasWifi = hasWifi;
    }
    
    public Boolean getHasAirConditioning() {
        return hasAirConditioning;
    }
    
    public void setHasAirConditioning(Boolean hasAirConditioning) {
        this.hasAirConditioning = hasAirConditioning;
    }
    
    public Boolean getHasMinibar() {
        return hasMinibar;
    }
    
    public void setHasMinibar(Boolean hasMinibar) {
        this.hasMinibar = hasMinibar;
    }
    
    public Boolean getHasSafe() {
        return hasSafe;
    }
    
    public void setHasSafe(Boolean hasSafe) {
        this.hasSafe = hasSafe;
    }
    
    public Integer getFloorNumber() {
        return floorNumber;
    }
    
    public void setFloorNumber(Integer floorNumber) {
        this.floorNumber = floorNumber;
    }
    
    public List<String> getAmenities() {
        return amenities;
    }
    
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities != null ? amenities : new ArrayList<>();
    }
    
    public List<Reservation> getReservations() {
        return reservations;
    }
    
    public void setReservations(List<Reservation> reservations) {
        this.reservations = reservations != null ? reservations : new ArrayList<>();
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
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Room room = (Room) o;
        return Objects.equals(id, room.id) && Objects.equals(number, room.number);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, number);
    }
    
    @Override
    public String toString() {
        return "Room{" +
                "id=" + id +
                ", number='" + number + '\'' +
                ", type=" + type +
                ", price=" + price +
                ", status=" + status +
                '}';
    }
    
    // Enums
    public enum RoomType {
        STANDARD("Standard", 2, 1, "Queen"),
        DELUXE("Deluxe", 3, 1, "King"),
        SUITE("Suite", 4, 2, "King"),
        PENTHOUSE("Penthouse", 6, 3, "King");
        
        private final String displayName;
        private final int defaultMaxOccupancy;
        private final int defaultBedCount;
        private final String defaultBedType;
        
        RoomType(String displayName, int defaultMaxOccupancy, int defaultBedCount, String defaultBedType) {
            this.displayName = displayName;
            this.defaultMaxOccupancy = defaultMaxOccupancy;
            this.defaultBedCount = defaultBedCount;
            this.defaultBedType = defaultBedType;
        }
        
        public String getDisplayName() {
            return displayName;
        }
        
        public int getDefaultMaxOccupancy() {
            return defaultMaxOccupancy;
        }
        
        public int getDefaultBedCount() {
            return defaultBedCount;
        }
        
        public String getDefaultBedType() {
            return defaultBedType;
        }
    }
    
    public enum RoomStatus {
        AVAILABLE("Available"),
        OCCUPIED("Occupied"),
        MAINTENANCE("Under Maintenance"),
        CLEANING("Being Cleaned"),
        OUT_OF_ORDER("Out of Order");
        
        private final String displayName;
        
        RoomStatus(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
}