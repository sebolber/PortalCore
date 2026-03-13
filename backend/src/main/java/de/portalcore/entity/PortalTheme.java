package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portal_theme")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalTheme {

    @Id
    private String id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "portal_title")
    private String portalTitle;

    @Column(name = "portal_icon_initials")
    private String portalIconInitials;

    @Column(name = "portal_icon_url")
    private String portalIconUrl;

    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "primary_dark")
    private String primaryDark;

    @Column(name = "primary_light")
    private String primaryLight;

    @Column(name = "primary_contrast")
    private String primaryContrast;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "secondary_dark")
    private String secondaryDark;

    @Column(name = "secondary_light")
    private String secondaryLight;

    @Column(name = "secondary_contrast")
    private String secondaryContrast;

    @Column(name = "font_family")
    private String fontFamily;

    @Column(name = "font_family_heading")
    private String fontFamilyHeading;

    @Column(name = "font_color")
    private String fontColor;

    @Column(name = "font_color_light")
    private String fontColorLight;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @PrePersist
    @PreUpdate
    void onSave() {
        lastModified = LocalDateTime.now();
    }
}
