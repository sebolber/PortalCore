package de.portalcore.entity;

import de.portalcore.enums.*;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "portal_apps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalApp {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "long_description", columnDefinition = "TEXT")
    private String longDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "market_segment", nullable = false)
    private MarketSegment marketSegment;

    @Enumerated(EnumType.STRING)
    @Column(name = "app_type", nullable = false)
    private AppType appType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppVendor vendor;

    @Column(name = "vendor_name")
    private String vendorName;

    private String version;

    @Column(name = "icon_color")
    private String iconColor;

    @Column(name = "icon_initials")
    private String iconInitials;

    private double rating;

    @Column(name = "review_count")
    private int reviewCount;

    @Column(name = "install_count")
    private int installCount;

    private String tags;

    @Column(nullable = false)
    private String price;

    private String compatibility;

    private boolean featured;

    @Column(name = "is_new")
    private boolean isNew;

    private String route;

    @Column(name = "repository_url")
    private String repositoryUrl;

    @Column(name = "application_url")
    private String applicationUrl;
}
